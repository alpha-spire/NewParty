import {
    StyleSheet,
    Text,
    View,
    TextInput,
    GestureResponderEvent,
    Image,
} from "react-native";
import React, { useState } from "react";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import { Button } from "../../ui/button";
import { Fontisto, AntDesign } from "@expo/vector-icons";
import FriendsModal from "./FriendsModal";
import PhotoModal from "./PhotoModal";
import { BACKENDADRESS } from "../../config";
import { useSelector, useDispatch } from "react-redux";
import { UserState } from "../../reducers/user";
import { addEvent } from "../../reducers/event";
import Header from "../headers/Header";

import DateTimePicker, {
    DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

type UserScreenProps = {
    navigation: NavigationProp<ParamListBase>;
};

export default function CreateEventScreen({ navigation }: UserScreenProps) {
    const [title, setTitle] = useState("");
    const [location, setLocation] = useState("");
    const [startDate, setStartDate] = useState<Date>(new Date());
    const [startHour, setStartHour] = useState<Date>(new Date());
    const [endDate, setEndDate] = useState<Date>(new Date());
    const [endHour, setEndHour] = useState<Date>(new Date());
    const [isFriendsModalOpened, setIsFriendsModalOpened] = useState(false);
    const [isPhotoModalOpened, setIsPhotoModalOpened] = useState(false);
    const [visible, setVisible] = useState(false);
    const [date, setDate] = useState<Date>(new Date());
    const [mode, setMode] = useState<"date" | "time">("date");
    const dispatch = useDispatch();
    const [typeDate, setTypeDate] = useState<
        "startDate" | "endDate" | "startHour" | "endHour" | null
    >(null);
    const [memberIds, setMemberIds] = useState<string[]>([]);
    const [photo, setPhoto] = useState<string>("");

    const user = useSelector((state: { user: UserState }) => state.user.value);

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

    const CreateEvent = () => {
        if (!title) {
            alert("veuillez remplir le titre de l'évènement");
            return;
        }
        fetch(BACKENDADRESS + `/events/createEvent/${user.token}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title,
                location,
                photoEventUrl: photo,
                startDate: startDate!.toISOString(),
                endDate: endDate!.toISOString(),
                startHour: startHour!.toISOString(),
                endHour: endHour!.toISOString(),
                memberIds: memberIds,
                adminId: user.token,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.result) {

                    dispatch(addEvent(data.event));
                }
                navigation.navigate("TabNavigator", { screen: "Events" });
            })
            .catch((error) => {
                console.log("Create event error", error);
            });
    };

    const handleAddPhoto = (imageURI: string) => {
        const formData = new FormData();
        //@ts-expect-error
        formData.append("photoFromFront", {
            uri: imageURI,
            name: "photo.jpg",
            type: "image/jpeg",
        });
        fetch(BACKENDADRESS + `/upload/`, {
            method: "POST",
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                setPhoto(data.photo.url);
            })
            .catch(console.error);
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

    return (
        <View>
            <View style={styles.header}>
                <Header destination={"Events"} goBack={true} />
            </View>
            <View style={styles.container}>
                <Text style={styles.title}>Création d'évènement</Text>
                <TextInput
                    style={styles.input}
                    placeholder="title..."
                    placeholderTextColor="grey"
                    onChangeText={(value) => setTitle(value)}
                    value={title}
                />
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
                        onPress={(event: GestureResponderEvent) =>
                            setIsFriendsModalOpened(true)
                        }
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
                        placeholder="location..."
                        placeholderTextColor="grey"
                        onChangeText={(value) => setLocation(value)}
                        value={location}
                    />
                </View>
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
                        <Text style={styles.texte}>De</Text>
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
                    colour="green"
                    size="m"
                    text="Créer l'évènement"
                    onPress={CreateEvent}
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
    title: {
        marginTop: -200,
        fontSize: 25,
        fontWeight: "bold",
        textAlign: "center",
        color: "white",
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
