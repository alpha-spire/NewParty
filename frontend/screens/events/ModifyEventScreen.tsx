import {
    StyleSheet,
    Text,
    View,
    TextInput,
    Image,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    ScrollView,
} from "react-native";
import React, { useState } from "react";
import { NavigationProp, ParamListBase } from "@react-navigation/native";

import { Fontisto, AntDesign } from "@expo/vector-icons";
import FriendsModal from "./FriendsModal";
import PhotoModal from "./PhotoModal";
import { BACKENDADRESS } from "../../config";
import { apiFetch } from "../../utils/apiFetch";
import { useDispatch, useSelector } from "react-redux";
import { useEventState, removeEvent } from "../../reducers/event";
import { removeEventId, UserState } from "../../reducers/user";
import Header from "../headers/Header";
import DateTimePicker, {
    DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { formatDateObj, formatHourObj, safeDate } from "../../utils/dateUtils";
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
        safeDate(currentEvent?.startDate)
    );
    const [startHour, setStartHour] = useState<Date>(
        safeDate(currentEvent?.startHour)
    );
    const [endDate, setEndDate] = useState<Date>(
        safeDate(currentEvent?.endDate)
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

    const dateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
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
                            const response = await apiFetch(
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
        // memberIds toujours inclus — représente l'état final de la liste des membres
        updateObj.memberIds = memberIds;

        const nonMemberKeys = Object.keys(updateObj).filter(k => k !== "memberIds");
        const membersChanged =
            memberIds.length !== currentEvent.memberIds.length ||
            memberIds.some((id, i) => id !== currentEvent.memberIds[i]?._id);

        if (nonMemberKeys.length === 0 && !membersChanged) {
            Alert.alert("Info", "Aucune modification effectuée");
            return;
        }
        setIsUpdating(true);
        try {
            const response = await apiFetch(BACKENDADRESS + `/events/update/${currentEvent._id}`, {
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

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.container}
                keyboardShouldPersistTaps="handled"
            >

                <Text style={styles.title}>Modification d'évènement</Text>

                {/* Champ titre — placeholder = valeur actuelle de l'event */}
                <TextInput
                    style={styles.textInput}
                    placeholder={currentEvent.title}
                    placeholderTextColor="grey"
                    onChangeText={(value) => setTitle(value)}
                    value={title}
                />

                {/* Photo et membres */}
                <View style={styles.photoPlusFriends}>
                    {currentEvent.photoEventUrl ? (
                        <TouchableOpacity onPress={() => setIsPhotoModalOpened(true)}>
                            <Image style={styles.photos} source={{ uri: currentEvent.photoEventUrl }} />
                        </TouchableOpacity>
                    ) : (
                        <Fontisto
                            style={styles.photos}
                            name="photograph"
                            size={80}
                            color="white"
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
                        size={80}
                        color="white"
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
                    style={styles.textInput}
                    placeholder={currentEvent.location || "Lieu ..."}
                    placeholderTextColor="grey"
                    onChangeText={(value) => setLocation(value)}
                    value={location}
                />

                {/* Dates et heures — deux lignes : début / fin */}
                <View style={styles.datesBlock}>
                    <View style={styles.dateRow}>
                        <Text style={styles.label}>Début</Text>
                        <Text style={styles.dateChip} onPress={() => { showDate(); setTypeDate("startDate"); }}>
                            {formatDateObj(startDate)}
                        </Text>
                        <Text style={styles.dateChip} onPress={() => { showTime(); setTypeDate("startHour"); }}>
                            {formatHourObj(startHour)}
                        </Text>
                    </View>
                    <View style={styles.dateRow}>
                        <Text style={styles.label}>Fin</Text>
                        <Text style={styles.dateChip} onPress={() => { showDate(); setTypeDate("endDate"); }}>
                            {formatDateObj(endDate)}
                        </Text>
                        <Text style={styles.dateChip} onPress={() => { showTime(); setTypeDate("endHour"); }}>
                            {formatHourObj(endHour)}
                        </Text>
                    </View>
                    {visible && (
                        <DateTimePicker
                            value={date}
                            mode={mode}
                            is24Hour={true}
                            onChange={dateChange}
                        />
                    )}
                </View>

            </ScrollView>

            {/* Boutons fixés en bas — toujours visibles quelle que soit la hauteur du contenu */}
            <View style={styles.footer}>
                {isUpdating ? (
                    <ActivityIndicator size="small" color="#4a90e2" />
                ) : (
                    <TouchableOpacity style={styles.btnModify} onPress={handleModifyEvent}>
                        <Text style={styles.btnText}>Modifier</Text>
                    </TouchableOpacity>
                )}
                {isDeleting ? (
                    <ActivityIndicator size="small" color="red" />
                ) : (
                    <TouchableOpacity style={styles.btnDelete} onPress={handleDeleteEvent}>
                        <Text style={styles.btnText}>Supprimer</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "#202020",
    },
    scroll: {
        flex: 1,
    },
    container: {
        alignItems: "center",
        paddingTop: 10,
        paddingBottom: 40,
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
        marginBottom: 10,
        fontSize: 22,
        fontWeight: "bold",
        textAlign: "center",
        color: "white",
    },
    textInput: {
        fontSize: 16,
        height: 45,
        marginVertical: 8,
        borderWidth: 1,
        paddingHorizontal: 14,
        backgroundColor: "#323232",
        color: "white",
        borderColor: "white",
        borderRadius: 17,
        width: "88%",
    },
    photoPlusFriends: {
        flexDirection: "row",
        marginVertical: 12,
    },
    photos: {
        backgroundColor: "#323232",
        width: 120,
        height: 120,
        borderWidth: 2,
        borderRadius: 20,
        borderColor: "white",
        marginHorizontal: 10,
        padding: 18,
    },
    friends: {
        backgroundColor: "#323232",
        width: 120,
        height: 120,
        borderWidth: 2,
        borderRadius: 20,
        borderColor: "white",
        marginHorizontal: 10,
        padding: 18,
    },
    // Bloc dates/heures — deux lignes : Début et Fin
    datesBlock: {
        width: "88%",
        marginVertical: 12,
    },
    dateRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    label: {
        color: "white",
        fontWeight: "bold",
        fontSize: 15,
        width: 50,
    },
    // Chip cliquable affichant une date ou une heure
    dateChip: {
        backgroundColor: "#323232",
        color: "white",
        borderWidth: 1,
        borderColor: "white",
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 15,
        marginHorizontal: 6,
        overflow: "hidden",
    },
    loader: {
        marginVertical: 20,
    },
    footer: {
        flexDirection: "row",
        justifyContent: "space-evenly",
        alignItems: "center",
        paddingVertical: 10,
        backgroundColor: "#202020",
        borderTopWidth: 0.2,
        borderTopColor: "white",
    },
    btnModify: {
        backgroundColor: "#4a90e2",
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: "white",
        opacity: 0.85,
    },
    btnDelete: {
        backgroundColor: "red",
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: "white",
        opacity: 0.85,
    },
    btnText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
        textAlign: "center",
    },
});
