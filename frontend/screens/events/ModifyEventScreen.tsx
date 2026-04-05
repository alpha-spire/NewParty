import {
    StyleSheet,
    Text,
    View,
    TextInput,
    Image,
    TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import { Button } from "../../ui/button";
import { Fontisto, AntDesign } from "@expo/vector-icons";
import FriendsModal from "./FriendsModal";
import PhotoModal from "./PhotoModal";
import { BACKENDADRESS } from "../../config";
import { useSelector } from "react-redux";
import { useEventState } from "../../reducers/event";
import { UserState } from "../../reducers/user";
import DateTimePicker, {
    DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import Header from "../headers/Header";

type UserScreenProps = {
    navigation: NavigationProp<ParamListBase>;
};

export default function ModifyEventScreen({ navigation }: UserScreenProps) {
    const [title, setTitle] = useState("");
    const [location, setLocation] = useState("");
    const [startDate, setStartDate] = useState<Date>(new Date());
    const [startHour, setStartHour] = useState<Date>(new Date());
    const [endDate, setEndDate] = useState<Date>(new Date());
    const [endHour, setEndHour] = useState<Date>(new Date());
    const [isFriendsModalOpened, setIsFriendsModalOpened] = useState(false);
    const [isPhotoModalOpened, setIsPhotoModalOpened] = useState(false);
    const [visible, setVisible] = useState(false);
    const [date, setDate] = useState(new Date());
    const [mode, setMode] = useState<"date" | "time">("date");
    const [typeDate, setTypeDate] = useState<
        "startDate" | "endDate" | "startHour" | "endHour" | null
    >(null);
    const [memberIds, setMemberIds] = useState<string[]>([]);
    const [photo, setPhoto] = useState<string>("");

    const currentEvent = useEventState()!;

    const user = useSelector((state: { user: UserState }) => state.user.value);

    const handleAddPhoto = async (imageURI: string) => {
        const formData = new FormData();
        //@ts-expect-error
        formData.append("photoFromFront", {
            uri: imageURI,
            name: "photo.jpg",
            type: "image/jpeg",
        });
        const response = await fetch(BACKENDADRESS + `/upload/`, {
            method: "POST",
            body: formData,
        });
        const data = await response.json();
        if (data) {
            setPhoto(data.photo.url);
        }
    };

    const addMember = () => {
        setIsFriendsModalOpened(true);
    };

    const showPicker = () => {
        setVisible(true);
    };

    const showDate = () => {
        setMode("date");
        showPicker();
    };
    const showTime = () => {
        setMode("time");
        showPicker();
    };

    const DeleteEvent = async () => {
        const body: any = { _id: currentEvent._id };
        const response = await fetch(
            BACKENDADRESS + `/events/delete/${user.token}`,
            {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            },
        );
        navigation.navigate("TabNavigator", { screen: "Events" });
    };

    const handleAddMember = (member: string) => {
        if (!memberIds.includes(member)) {
            setMemberIds((prevMembers) => [...prevMembers, member]);
        }
    };

    const handleRemoveMember = (member: string) => {
        if (memberIds.includes(member)) {
            setMemberIds(memberIds.filter((e) => member !== e));
        }
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

    const ModifyEvent = async () => {
        const body: any = { _id: currentEvent._id };

        if (title) {
            body.title = title;
        }
        if (location) {
            body.location = location;
        }
        if (startDate) {
            body.startDate = startDate;
        }
        if (endDate) {
            body.endDate = endDate;
        }
        if (startHour) {
            body.startHour = startHour;
        }
        if (endHour) {
            body.endHour = endHour;
        }
        if (photo) {
            body.photoEventUrl = photo;
        }

        const response = await fetch(
            BACKENDADRESS + `/events/update/${user.token}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            },
        );
        const data = await response.json();

        if (data) {
            navigation.navigate("TabNavigator", { screen: "Events" });
        }
    };

    return (
        <View>
            <View style={styles.header}>
                <Header destination={"Events"} goBack={true} />
            </View>
            <View style={styles.container}>
                <View>
                    <Text style={styles.title}>Modification d'évènement</Text>
                    <TextInput
                        style={styles.titleInput}
                        placeholder={currentEvent.title}
                        placeholderTextColor="grey"
                        onChangeText={(value) => setTitle(value)}
                        value={title}
                    />
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
                            onPress={addMember}
                        />
                        <FriendsModal
                            onClose={() => setIsFriendsModalOpened(false)}
                            visible={isFriendsModalOpened}
                            addMember={handleAddMember}
                            removeMember={handleRemoveMember}
                            memberIds={memberIds}
                        />
                    </View>
                    <View>
                        <TextInput
                            style={styles.locationInput}
                            placeholder={currentEvent.location}
                            placeholderTextColor="grey"
                            onChangeText={(value) => setLocation(value)}
                            value={location}
                        />
                    </View>
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
                                ...
                                {`${("0" + startDate.getDate()).slice(-2)}/${("0" + startDate.getMonth()).slice(-2)}/${startDate.getFullYear()}`}
                            </Text>
                            <Text style={styles.texte}>au</Text>
                            <Text
                                style={styles.input}
                                onPress={() => {
                                    showDate();
                                    setTypeDate("endDate");
                                }}
                            >
                                ...
                                {`${("0" + endDate.getDate()).slice(-2)}/${("0" + endDate.getMonth()).slice(-2)}/${endDate.getFullYear()}`}
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
                                ...
                                {`${("0" + startHour.getHours()).slice(-2)}:${("0" + startHour.getMinutes()).slice(-2)}`}
                            </Text>
                            <Text style={styles.texte}>à</Text>
                            <Text
                                style={styles.input}
                                onPress={() => {
                                    showTime();
                                    setTypeDate("endHour");
                                }}
                            >
                                ...
                                {`${("0" + endHour.getHours()).slice(-2)}:${("0" + endHour.getMinutes()).slice(-2)}`}
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
                    <Button
                        colour="blue"
                        size="m"
                        text="Modifier"
                        onPress={ModifyEvent}
                    />
                </View>
                <Button
                    colour="red"
                    size="m"
                    text="Supprimer"
                    onPress={DeleteEvent}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
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
});
