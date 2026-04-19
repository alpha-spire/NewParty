import {
    StyleSheet,
    Text,
    View,
    TextInput,
    Image,
    TouchableOpacity,
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
import { useDispatch, useSelector } from "react-redux";
import { useEventState, removeEvent } from "../../reducers/event";
import { removeEventId, UserState } from "../../reducers/user";
import Header from "../headers/Header";
import DateTimePicker, {
    DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { formatDate, formatHour } from "../../utils/dateUtils";
import { uploadPhoto } from "../../utils/uploadPhotoUtils";

type ModifyEventScreenProps = {
    navigation: NavigationProp<ParamListBase>;
};

export default function ModifyEventScreen({
    navigation,
}: ModifyEventScreenProps) {
    const dispatch = useDispatch();
    const currentEvent = useEventState();
    const user = useSelector((state: { user: UserState }) => state.user.value);

    // États initialisés depuis l'event courant
    const [title, setTitle] = useState("");
    const [location, setLocation] = useState("");
    const [photo, setPhoto] = useState<string>("");
    const [memberIds, setMemberIds] = useState<string[]>(
        currentEvent ? currentEvent.memberIds.map((m) => m._id) : []
    );
    const [startDate, setStartDate] = useState<Date>(
        currentEvent ? new Date(currentEvent.startDate) : new Date()
    );
    const [startHour, setStartHour] = useState<Date>(
        currentEvent ? new Date(currentEvent.startHour) : new Date()
    );
    const [endDate, setEndDate] = useState<Date>(
        currentEvent ? new Date(currentEvent.endDate) : new Date()
    );
    const [endHour, setEndHour] = useState<Date>(new Date());
    const [isFriendsModalOpened, setIsFriendsModalOpened] = useState(false);
    const [isPhotoModalOpened, setIsPhotoModalOpened] = useState(false);
    const [visible, setVisible] = useState(false);
    const [date, setDate] = useState(new Date());
    const [mode, setMode] = useState<"date" | "time">("date");
    const [typeDate, setTypeDate] = useState<
        "startDate" | "endDate" | "startHour" | "endHour" | null
    >(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    if (!currentEvent) {
        navigation.goBack();
        return null;
    }

    const showDate = () => {
        setMode("date");
        setVisible(true);
    };
    const showTime = () => {
        setMode("time");
        setVisible(true);
    };

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

    const handleAddPhoto = async (imageURI: string) => {
        if (!user.token) return;
        const url = await uploadPhoto(imageURI, user.token);
        if (url) {
            setPhoto(url);
        }
    };

    const handleAddMember = (member: string) => {
        if (!memberIds.includes(member)) {
            setMemberIds((prevMembers) => [...prevMembers, member]);
        }
    };

    const handleRemoveMember = (member: string) => {
        if (memberIds.includes(member)) {
            setMemberIds((prevMembers) =>
                prevMembers.filter((e) => member !== e),
            );
        }
    };

    const handleDeleteEvent = async () => {
        // ajouter une confirmation avant de supprimer
        Alert.alert(
            "Confirmer la suppression",
            "Êtes-vous sûr de vouloir supprimer cet évènement ?",
            [
                { text: "Annuler", style: "cancel" },
                {
                    text: "Supprimer",
                    style: "destructive",
                    onPress: async () => {
                        setIsDeleting(true);
                        try {
                            const response = await fetch(
                                BACKENDADRESS +
                                    `/events/delete/${currentEvent._id}`,
                                {
                                    method: "DELETE",
                                    headers: {
                                        "Content-Type": "application/json",
                                        Authorization: `Bearer ${user.token}`,
                                    },
                                },
                            );
                            const data = await response.json();
                            if (data.result) {
                                dispatch(removeEvent()); // reducer event
                                dispatch(removeEventId(currentEvent._id)); //reducer user
                                navigation.navigate("TabNavigator", {
                                    screen: "Events",
                                });
                            }
                        } catch (error) {
                            console.error("Delete event error:", error);
                            Alert.alert(
                                "Erreur",
                                "Impossible de supprimer l'évènement",
                            );
                        } finally {
                            setIsDeleting(false);
                        }
                    },
                },
            ],
        );
    };
    // Modification de l'event — envoie uniquement les champs modifiés
    const handleModifyEvent = async () => {
        const updateObj: Record<string, any> = {};

        if (title.trim()) updateObj.title = title;
        if (location) updateObj.location = location;
        if (startDate) updateObj.startDate = startDate.toISOString();
        if (endDate) updateObj.endDate = endDate.toISOString();
        if (startHour) updateObj.startHour = startHour.toISOString();
        if (endHour) updateObj.endHour = endHour.toISOString();
        if (photo) updateObj.photoEventUrl = photo;

        if (Object.keys(updateObj).length === 0) {
            Alert.alert("Info", "Aucune modification effectuée");
            return;
        }
        setIsUpdating(true);
        try {
            const response = await fetch(BACKENDADRESS + `/events/update/${currentEvent._id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`,
                },
                body: JSON.stringify(updateObj),
            });
            const data = await response.json();

            if (data.result) {
                navigation.navigate("TabNavigator", { screen: "Events" });
            }
        } catch (error) {
            console.error("Modify event error:", error);
            Alert.alert("Erreur", "Impossible de modifier l'évènement");
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <View style={styles.screen}>
            <View style={styles.header}>
                <Header destination={"Events"} goBack={true} />
            </View>

            <View style={styles.container}>
                <Text style={styles.title}>Modification d'évènement</Text>

                {/* Champ titre — placeholder = valeur actuelle de l'event */}
                <TextInput
                    style={styles.titleInput}
                    placeholder={currentEvent.title}
                    placeholderTextColor="grey"
                    onChangeText={(value) => setTitle(value)}
                    value={title}
                />

                {/* Photo et membres */}
                <View style={styles.photoPlusFriends}>
                    {currentEvent.photoEventUrl ? (
                        <TouchableOpacity
                            onPress={() => setIsPhotoModalOpened(true)}
                        >
                            <Image
                                style={styles.photos}
                                source={{ uri: currentEvent.photoEventUrl }}
                            />
                        </TouchableOpacity>
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
                    placeholder={currentEvent.location || "Lieu ..."}
                    placeholderTextColor="grey"
                    onChangeText={(value) => setLocation(value)}
                    value={location}
                />

                {/* Dates et heures */}
                <View style={styles.datePlusHour}>
                    <View style={styles.date}>
                        <Text style={styles.texte}>Du </Text>
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
                        <Text style={styles.texte}>De </Text>
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

                {isUpdating ? (
                    <ActivityIndicator size="large" color="#4a90e2" style={styles.loader} />
                ) : (
                    <Button
                        colour="blue"
                        size="m"
                        text="Modifier"
                        onPress={handleModifyEvent}
                    />
                )}

                {isDeleting ? (
                    <ActivityIndicator size="large" color="red" style={styles.loader} />
                ) : (
                    <Button
                        colour="red"
                        size="m"
                        text="Supprimer"
                        onPress={handleDeleteEvent}
                    />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1 },
    container: {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#202020",
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
        marginTop: 10,
        fontSize: 25,
        fontWeight: "bold",
        textAlign: "center",
        color: "white",
    },
    titleInput: {
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
        width: 290,
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
        width: "90%",
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
        width: 290,
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
    loader: {
        marginVertical: 30,
    },
});
