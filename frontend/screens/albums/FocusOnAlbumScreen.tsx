import { StyleSheet, Text, View, Image, Alert, TouchableOpacity } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { Fontisto } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { FlatList } from "react-native";
import { BACKENDADRESS } from "../../config";
import { apiFetch } from "../../utils/apiFetch";
import { uploadPhoto } from "../../utils/uploadPhotoUtils";
import { useSelector } from "react-redux";
import { useEventState } from "../../reducers/event";
import { UserState } from "../../reducers/user";
import { useEffect, useState } from "react";
import { Photo } from "../../types/photo";
import { User } from "../../types/user";
import Header from "../headers/Header";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import PhotoModal from "../events/PhotoModal";

// Type étendu : _userId est populé par le backend (objet User au lieu d'un simple string)
type PopulatedPhoto = Omit<Photo, "_userId"> & {
    _userId: Pick<User, "_id" | "username" | "userPhoto">;
};

export default function FocusOnAlbum() {
    // Récupère l'événement courant stocké dans Redux (sélectionné depuis AlbumsScreen)
    const currentAlbum = useEventState()!;
    const user = useSelector((state: { user: UserState }) => state.user.value);
    const isFocused = useIsFocused();

    const [isPhotoModalOpened, setIsPhotoModalOpened] = useState(false);
    const [photos, setPhotos] = useState<PopulatedPhoto[]>([]);

    // Recharge les photos à chaque fois que l'écran devient actif
    useEffect(() => {
        if (!isFocused) return;

        const fetchPhotoList = async () => {
            try {
                const response = await apiFetch(
                    BACKENDADRESS + `/photos/${currentAlbum._id}`,
                    { headers: { Authorization: `Bearer ${user.token}` } },
                );
                const data = await response.json();
                // Le backend retourne "listPhotos" (et non "photos")
                setPhotos(data.listPhotos ?? []);
            } catch (error) {
                console.error("Erreur de récupération Photos", error);
            }
        };
        fetchPhotoList();
    }, [isFocused]);

    // Uploade l'image puis crée une entrée Photo en base liée à l'événement
    const handleAddPhoto = async (imageBase64: string) => {
        try {
            // Étape 1 : upload vers Cloudinary via JSON base64
            const photoUrl = await uploadPhoto(imageBase64, user.token!);
            if (!photoUrl) return;

            // Étape 2 : enregistrement de la photo en base avec l'URL et l'eventId
            const saveResponse = await apiFetch(
                BACKENDADRESS + `/photos/${currentAlbum._id}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${user.token}`,
                    },
                    body: JSON.stringify({
                        uri: photoUrl,
                        eventId: currentAlbum._id,
                    }),
                },
            );
            const saveData = await saveResponse.json();
            if (saveData.result) {
                const newPhoto: PopulatedPhoto = {
                    ...saveData.photo,
                    _userId: {
                        _id: user._id!,
                        username: user.username!,
                        userPhoto: user.userPhoto,
                    },
                };
                setPhotos((prev) => [...prev, newPhoto]);
            }
        } catch (error) {
            Alert.alert("Erreur", "Impossible d'ajouter la photo");
            console.error("Erreur ajout photo", error);
        }
    };

    // Supprime une photo après confirmation — autorisé à l'auteur ou à l'admin de l'événement
    const handleDeletePhoto = (photo: PopulatedPhoto) => {
        Alert.alert(
            "Supprimer la photo",
            "Voulez-vous supprimer cette photo définitivement ?",
            [
                { text: "Annuler", style: "cancel" },
                {
                    text: "Supprimer",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const response = await apiFetch(
                                BACKENDADRESS + `/photos/delete/${photo._id}`,
                                {
                                    method: "DELETE",
                                    headers: {
                                        Authorization: `Bearer ${user.token}`,
                                    },
                                },
                            );
                            const data = await response.json();
                            if (data.result) {
                                // Retire la photo de la liste locale sans refetch
                                setPhotos((prev) =>
                                    prev.filter((p) => p._id !== photo._id),
                                );
                            } else {
                                Alert.alert("Erreur", data.error || "Suppression impossible");
                            }
                        } catch (error) {
                            Alert.alert("Erreur", "Erreur réseau");
                            console.error("Erreur suppression photo", error);
                        }
                    },
                },
            ],
        );
    };

    // Renvoie true si l'utilisateur connecté peut supprimer cette photo :
    // soit il en est l'auteur, soit il est admin de l'événement
    const canDelete = (photo: PopulatedPhoto): boolean => {
        const isAuthor = photo._userId._id === user._id;
        const isEventAdmin = currentAlbum.adminId._id === user._id;
        return isAuthor || isEventAdmin;
    };

    return (
        <View style={styles.screen}>
            <View style={styles.header}>
                <Header destination={"Album"} goBack={true} />
            </View>

            <View style={styles.container}>
                {/* Barre sous le header : titre de l'album + bouton ajout photo */}
                <View style={styles.underHeader}>
                    <Text style={styles.title}>{currentAlbum.title}</Text>
                    <MaterialIcons
                        style={styles.addPhotoBtn}
                        name="add-a-photo"
                        size={40}
                        color="white"
                        onPress={() => setIsPhotoModalOpened(true)}
                    />
                </View>

                {/* Modal de sélection / prise de photo */}
                <PhotoModal
                    onClose={() => setIsPhotoModalOpened(false)}
                    visible={isPhotoModalOpened}
                    addPhoto={handleAddPhoto}
                />

                {/* Grille 3 colonnes des photos de l'album */}
                <FlatList
                    numColumns={3}
                    style={styles.listPosition}
                    data={photos}
                    keyExtractor={(item) => item._id}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>
                            Aucune photo pour le moment.{"\n"}
                            Appuie sur l'appareil photo pour en ajouter !
                        </Text>
                    }
                    renderItem={({ item }) => (
                        <View style={styles.photoBox}>
                            {item.uri ? (
                                <Image
                                    style={styles.updPhoto}
                                    source={{ uri: item.uri }}
                                />
                            ) : (
                                <Fontisto
                                    style={styles.photoPlaceholder}
                                    name="photograph"
                                    size={60}
                                    color={"white"}
                                />
                            )}

                            {/* Bouton poubelle — visible uniquement si l'user est autorisé */}
                            {canDelete(item) && (
                                <TouchableOpacity
                                    style={styles.deleteBtn}
                                    onPress={() => handleDeletePhoto(item)}
                                >
                                    <AntDesign
                                        name="delete"
                                        size={16}
                                        color="white"
                                    />
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "#1b1b1b",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#000",
        maxHeight: 125,
        width: "100%",
    },
    container: {
        flex: 1,
        alignItems: "flex-start",
        backgroundColor: "#1b1b1b",
    },
    underHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#1b1b1b",
        height: 80,
        width: "100%",
        paddingHorizontal: 15,
        borderBottomWidth: 0.2,
        borderColor: "white",
    },
    title: {
        fontSize: 30,
        fontWeight: "bold",
        color: "white",
    },
    addPhotoBtn: {
        backgroundColor: "#323232",
        width: 65,
        height: 65,
        borderWidth: 2,
        borderRadius: 20,
        borderColor: "white",
        padding: 12,
        textAlign: "center",
    },
    listPosition: {
        width: "100%",
    },
    // Cellule de la grille : 1/3 de largeur, hauteur fixe, position relative pour le bouton delete
    photoBox: {
        width: "33.3333333%",
        height: 125,
        borderWidth: 0.5,
        borderColor: "white",
        backgroundColor: "#1b1b1b",
        position: "relative",
    },
    updPhoto: {
        width: "100%",
        height: "100%",
    },
    photoPlaceholder: {
        flex: 1,
        textAlign: "center",
        textAlignVertical: "center",
    },
    // Pastille de suppression positionnée en bas à droite de la photo
    deleteBtn: {
        position: "absolute",
        bottom: 6,
        right: 6,
        backgroundColor: "rgba(0,0,0,0.6)",
        borderRadius: 12,
        padding: 5,
    },
    emptyText: {
        color: "grey",
        textAlign: "center",
        marginTop: 40,
        fontSize: 15,
        lineHeight: 22,
    },
});
