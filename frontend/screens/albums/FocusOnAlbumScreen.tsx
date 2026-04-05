import { StyleSheet, Text, View, Image } from "react-native";
import {
    NavigationProp,
    ParamListBase,
    useIsFocused,
} from "@react-navigation/native";
import { Fontisto } from "@expo/vector-icons";
import { FlatList } from "react-native";
import { BACKENDADRESS } from "../../config";
import { useSelector } from "react-redux";
import { useEventState } from "../../reducers/event";
import { UserState } from "../../reducers/user";
import { useEffect, useState } from "react";
import { Photo } from "../../types/photo";
import Header from "../headers/Header";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import PhotoModal from "../events/PhotoModal";
import { Xbutton } from "../../ui/xButton";

type UserScreenProps = {
    navigation: NavigationProp<ParamListBase>;
};

export default function FocusocusOnAlbum({ navigation }: UserScreenProps) {
    const currentAlbum = useEventState()!;
    const [isPhotoModalOpened, setIsPhotoModalOpened] = useState(false);
    const user = useSelector((state: { user: UserState }) => state.user.value);
    const isFocused = useIsFocused();
    const event = useEventState();
    const [photos, setPhotos] = useState<Photo[]>([]);

    useEffect(() => {
        const fetchPhotoList = async () => {
            try {
                const response = await fetch(
                    BACKENDADRESS + `/photos/${currentAlbum._id}`,
                );
                const data = await response.json();
                setPhotos(data.photos);
            } catch (error) {
                console.error("Erreur de récupération Photos", error);
            }
        };
        fetchPhotoList();
    }, []);

    const handleAddPhoto = async (imageURI: string) => {
        const formData = new FormData();
        //@ts-expect-error
        formData.append("photoFromFront", {
            uri: imageURI,
            name: "photo.jpg",
            type: "image/jpeg",
        });
        const response = await fetch(BACKENDADRESS+"/upload", {
            method: "POST",
            body: formData,
        });
        const data = await response.json();
        if (data) {
            fetch(BACKENDADRESS + `/photos/${user.token}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    uri: data.photo.url,
                    eventId: event!._id,
                    date: data.photo.date,
                }),
            })
                .then((response) => response.json())
                .then((data) => {});
        }
    };

    // const handleDeletePhoto = async (photo: Photo) => {
    //     const response = await fetch(
    //         BACKENDADRESS + `/photos/delete/${user.token}`,
    //         { method: "DELETE", body: photo._id },
    //     );

    //     const data = await response.json();
    //     if (data) {
    //         console.log(data);
    //     }
    // };

    return (
        <View>
            <View style={styles.header}>
                <Header destination={"Album"} goBack={true} />
            </View>
            <View style={styles.container}>
                <View style={styles.underHeader}>
                    <View>
                        <Text style={styles.title}>{currentAlbum.title}</Text>
                    </View>
                    <MaterialIcons
                        style={styles.photos}
                        name="add-a-photo"
                        size={40}
                        color="white"
                        onPress={() => setIsPhotoModalOpened(true)}
                    />
                    <PhotoModal
                        onClose={() => setIsPhotoModalOpened(false)}
                        visible={isPhotoModalOpened}
                        addPhoto={handleAddPhoto}
                    />
                </View>
                <FlatList
                    numColumns={3}
                    style={styles.listPosition}
                    data={photos}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => (
                        <View style={styles.photoBox}>
                            {item.uri ? (
                                <Image
                                    style={styles.updPhoto}
                                    source={{ uri: item.uri }}
                                />
                            ) : (
                                <Fontisto
                                    style={styles.photos}
                                    name="photograph"
                                    size={60}
                                    color={"white"}
                                    bottom={30}
                                />
                            )}

                            {/* <View style={styles.infosBox}>
                                <Text style={styles.eventInfos}>
                                    {item.title}
                                </Text>
                                <Text style={styles.eventInfos}>
                                    {item.startDate.slice(0, 10)}
                                </Text>
                            </View> */}
                        </View>
                    )}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: "flex-start",
        justifyContent: "center",
        backgroundColor: "#1b1b1b",
        height: "100%",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#000",
        maxHeight: 125,
        width: "100%",
    },
    underHeader: {
        alignItems: "flex-start",
        justifyContent: "center",
        backgroundColor: "#1b1b1b",
        height: 100,
        width: "100%",
        borderBottomWidth: 0.2,
        borderColor: "white",
    },
    title: {
        marginTop: 20,
        marginLeft: 10,
        fontSize: 30,
        fontWeight: "bold",
        color: "white",
    },
    photos: {
        left: 275,
        bottom: 30,
        backgroundColor: "#323232",
        width: 75,
        height: 75,
        borderWidth: 2,
        borderRadius: 25,
        borderColor: "white",
        marginLeft: 10,
        marginRight: 10,
        padding: 15,
    },
    listPosition: {
        height: "100%",
        width: "100%",
    },
    photoBox: {
        width: "33.3333333%",
        display: "flex",
        flexDirection: "row",
        backgroundColor: "#1b1b1b",
        borderTopColor: "white",
        borderTopWidth: 0.5,
        borderBottomWidth: 0.5,
        borderBottomColor: "white",
        // marginBottom: -37,
        height: 125,
    },

    infosBox: {
        alignContent: "center",
        marginTop: 10,
    },
    eventInfos: {
        color: "grey",
        fontSize: 15,
        fontFamily: "",
        // marginBottom: -1.75,
    },
    updPhoto: {
        width: "100%",
        height: "100%",
        borderWidth: 0.5,
        borderColor: "white",
        // marginTop: 10,
    },
});
