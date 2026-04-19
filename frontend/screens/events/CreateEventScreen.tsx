import {
    StyleSheet,
    Text,
    View,
    TextInput,
    Image,
    Alert,
    ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import { Button } from "../../ui/button";
import { Fontisto, AntDesign } from "@expo/vector-icons";
import FriendsModal from "./FriendsModal";
import PhotoModal from "./PhotoModal";
import { BACKENDADRESS } from "../../config";
import { useSelector, useDispatch } from "react-redux";
import { addEventId, UserState } from "../../reducers/user";
import { addEvent } from "../../reducers/event";
import Header from "../headers/Header";

import DateTimePicker, {
    DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { formatDate, formatHour } from "../../utils/dateUtils";
import { uploadPhoto } from "../../utils/uploadPhotoUtils";

type CreateEventScreenProps = {
    navigation: NavigationProp<ParamListBase>;
};

export default function CreateEventScreen({
    navigation,
}: CreateEventScreenProps) {
    //champs du formulaire de création d'évènement
    const [title, setTitle] = useState("");
    const [location, setLocation] = useState("");
    const [memberIds, setMemberIds] = useState<string[]>([]);
    const [photo, setPhoto] = useState<string>("");

    //Etats des dates et heures de début et de fin de l'évènement
    const [startDate, setStartDate] = useState<Date>(new Date());
    const [startHour, setStartHour] = useState<Date>(new Date());
    const [endDate, setEndDate] = useState<Date>(new Date());
    const [endHour, setEndHour] = useState<Date>(new Date());
    const [visible, setVisible] = useState(false);

    //Etat pour différencier les différents types de date à modifier (date de début, date de fin,
    //  heure de début, heure de fin)
    const [typeDate, setTypeDate] = useState<
        "startDate" | "endDate" | "startHour" | "endHour" | null
    >(null);
    const [date, setDate] = useState<Date>(new Date());
    const [mode, setMode] = useState<"date" | "time">("date");

    //Etats pour l'ouverture des modals d'ajout de photo et d'amis
    const [isFriendsModalOpened, setIsFriendsModalOpened] = useState(false);
    const [isPhotoModalOpened, setIsPhotoModalOpened] = useState(false);

    // État de chargement
    const [isLoading, setIsLoading] = useState(false);

    const dispatch = useDispatch();
    const user = useSelector((state: { user: UserState }) => state.user.value);

    const showDate = () => {
        setMode("date");
        setVisible(true);
    };
    const showTime = () => {
        setMode("time");
        setVisible(true);
    };
    // Fonction de gestion du changement de date/heure, qui met à jour le champ correspondant
    // en fonction du type de date sélectionné
    const dateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        const currentDate = selectedDate || date;
        setDate(currentDate);
        switch (typeDate) {
            case "startDate":
                setStartDate(currentDate);
                break;
            case "endDate":
                setEndDate(currentDate);
                break;
            case "startHour":
                setStartHour(currentDate);
                break;
            case "endHour":
                setEndHour(currentDate);
                break;
        }
        setVisible(false);
    };

    // Fonction de gestion de l'ajout de photo, qui envoie l'image sélectionnée au backend
    // et met à jour le champ photo avec l'URL retournée
    const handleAddPhoto = async (imageURI: string) => {
        if(!user.token) return;
        const url = await uploadPhoto(imageURI, user.token);
        if (url) {
            setPhoto(url);
        }
    };

    // Ajoute un membre à la liste des membres de l'évènement, en évitant les doublons
    const handleAddMember = (member: string) => {
        if (!memberIds.includes(member)) {
            setMemberIds((prevMembers) => [...prevMembers, member]);
        }
    };
    // Supprime un membre de la liste des membres de l'évènement
    const handleRemoveMember = (member: string) => {
        if (memberIds.includes(member)) {
            setMemberIds((prevMember) =>
                prevMember.filter((e) => member !== e),
            );
        }
    };

    const handleCreateEvent = async () => {
        if (!title.trim()) {
            Alert.alert("Erreur", "Veuillez remplir le titre de l'évènement");
            return;
        }
        setIsLoading(true);
        try {
            const response = await fetch(
                BACKENDADRESS + "/events/createEvent",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${user.token}`,
                    },
                    body: JSON.stringify({
                        title: title.trim(),
                        location,
                        photoEventUrl: photo || null,
                        startDate: startDate!.toISOString(),
                        endDate: endDate!.toISOString(),
                        startHour: startHour!.toISOString(),
                        endHour: endHour!.toISOString(),
                        memberIds,
                    }),
                },
            );
            const data = await response.json();
            if (!response.ok) {
                Alert.alert("Erreur", data.error || "Failed to create event");
                return;
            }
            if (data.result) {
                dispatch(addEvent(data.event));
                dispatch(addEventId(data.event._id)); // on ajoute l'id de l'event créé à la liste des events de l'utilisateur dans le store pour que ça s'affiche directement dans la liste des events sans avoir à refetch la liste complète depuis le backend
                navigation.navigate("TabNavigator", { screen: "Events" });
            }
        } catch (error) {
            console.error("Create event error", error);
            Alert.alert(
                "Erreur",
                "Une erreur est survenue lors de la création de l'évènement",
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View>
            <View style={styles.header}>
                <Header destination={"Events"} goBack={true} />
            </View>

            <View style={styles.container}>
                <Text style={styles.title}>Création d'évènement</Text>
                {/* Champ titre */}
                <TextInput
                    style={styles.input}
                    placeholder="title..."
                    placeholderTextColor="grey"
                    onChangeText={(value) => setTitle(value)}
                    value={title}
                />
                {/* photo de l'event et amis */}
                <View style={styles.photoPlusFriends}>
                    {photo ? (
                        <Image
                            style={styles.updPhoto}
                            source={{ uri: photo }}
                        />
                    ) : (
                        <Fontisto
                            style={styles.photos}
                            name="photograph"
                            size={95}
                            color={"white"}
                            onPress={() => setIsPhotoModalOpened(true)}
                        />
                    )}

                    <PhotoModal
                        onClose={() => setIsPhotoModalOpened(false)}
                        visible={isPhotoModalOpened}
                        addPhoto={handleAddPhoto}
                    />
                    <AntDesign
                        style={styles.friends}
                        name="usergroup-add"
                        size={105}
                        color={"white"}
                        onPress={() => setIsFriendsModalOpened(true)}
                    />
                    <FriendsModal
                        onClose={() => setIsFriendsModalOpened(false)}
                        visible={isFriendsModalOpened}
                        addMember={handleAddMember}
                        removeMember={handleRemoveMember}
                        memberIds={memberIds}
                    />
                </View>

                {/* Champ localisation */}
                <TextInput
                    style={styles.locationInput}
                    placeholder="Lieu..."
                    placeholderTextColor="grey"
                    onChangeText={(value) => setLocation(value)}
                    value={location}
                />

                {/* Sélection dates et heures */}
                <View style={styles.datePlusHour}>
                    <View style={styles.date}>
                        <Text style={styles.texte}>Du</Text>
                        <Text
                            style={styles.input}
                            onPress={() => {
                                showDate();
                                setTypeDate("startDate");
                            }}
                        >
                            {formatDate(startDate.toISOString())}
                        </Text>
                        <Text style={styles.texte}>au</Text>
                        <Text
                            style={styles.input}
                            onPress={() => {
                                showDate();
                                setTypeDate("endDate");
                            }}
                        >
                            {formatDate(endDate.toISOString())}
                        </Text>
                    </View>
                    <View style={styles.hour}>
                        <Text style={styles.texte}>De</Text>
                        <Text
                            style={styles.input}
                            onPress={() => {
                                showTime();
                                setTypeDate("startHour");
                            }}
                        >
                            {formatHour(startHour.toISOString())}
                        </Text>
                        <Text style={styles.texte}>à</Text>
                        <Text
                            style={styles.input}
                            onPress={() => {
                                showTime();
                                setTypeDate("endHour");
                            }}
                        >
                            {formatHour(endHour.toISOString())}
                        </Text>
                        {visible && (
                            <DateTimePicker
                                value={date}
                                mode={mode}
                                is24Hour={true}
                                onChange={dateChange}
                            />
                        )}
                    </View>
                </View>

                {isLoading ? (
                    <ActivityIndicator size="large" color="#92ff2d" style={styles.loader} />
                ) : (
                    <Button
                        colour="green"
                        size="m"
                        text="Créer l'évènement"
                        onPress={handleCreateEvent}
                    />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        justifyContent: "flex-start",
        backgroundColor: "#202020",
        height: "100%",
        paddingTop: 20,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#000",
        maxHeight: 125,
        width: "100%",
    },
    title: {
        fontSize: 25,
        fontWeight: "bold",
        textAlign: "center",
        color: "white",
        marginBottom: 10,
    },
    loader: {
        marginVertical: 30,
    },
    input: {
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
        height: 40,
        margin: 15,
        borderWidth: 1,
        padding: 10,
        backgroundColor: "#323232",
        color: "grey",
        borderColor: "white",
        borderRadius: 17,
        width: "80%",
    },
    locationInput: {
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
        height: 40,
        margin: 15,
        borderWidth: 1,
        padding: 10,
        backgroundColor: "#323232",
        color: "grey",
        borderColor: "white",
        borderRadius: 17,
        width: 300,
    },
    texte: {
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
        color: "white",
    },
    photoPlusFriends: {
        flexDirection: "row",
    },
    photos: {
        backgroundColor: "#323232",
        width: 140,
        height: 140,
        borderWidth: 2,
        borderRadius: 25,
        borderColor: "white",
        marginLeft: 10,
        marginRight: 10,
        padding: 15,
    },
    updPhoto: {
        width: 140,
        height: 140,
        borderWidth: 2,
        borderRadius: 25,
        borderColor: "white",
        marginLeft: 10,
        marginRight: 10,
    },
    friends: {
        backgroundColor: "#323232",
        width: 140,
        height: 140,
        borderWidth: 2,
        borderRadius: 25,
        borderColor: "white",
        marginLeft: 10,
        marginRight: 10,
        padding: 15,
    },
    date: {
        width: 140,
        height: 140,
        marginLeft: 10,
        marginRight: 10,
        padding: 15,
    },
    hour: {
        width: 140,
        height: 140,
        marginLeft: 10,
        marginRight: 10,
        padding: 15,
    },
    datePlusHour: {
        flexDirection: "row",
        marginBottom: 40,
    },
});
