import { StyleSheet, Text, View } from "react-native";
import React, { useState, useEffect } from "react";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import Header from "../headers/Header";
import { BACKENDADRESS } from "../../config";
import { useSelector } from "react-redux";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { Event } from "../../types/event";
import { UserState } from "../../reducers/user";

type UserScreenProps = {
    navigation: NavigationProp<ParamListBase>;
};

export default function CreateChatScreen({ navigation }: UserScreenProps) {
    const [username, setUsername] = useState("");
    // const handleSearchUser = () => {};
    const [eventListMembers, setEventListMembers] = useState<String[]>([]);
    const [eventIdChoise, setEventIdChoise] = useState("");
    const [events, setEvents] = useState<Event[]>([]);

    const user = useSelector((state: { user: UserState }) => state.user.value);
    // useEffect(() => {
    //     const fetchUserList = async () => {
    //         try {
    //             const response = await fetch(BACKENDADRESS + `/getUsers`);
    //             const data = await response.json();
    //             if (
    //                 data &&
    //                 data.users.find((user: User) => user.username === username)
    //             ) {
    //             }
    //         } catch (error) {
    //             console.error("Erreur de récupération Event", error);
    //         }
    //     };
    //     fetchUserList();
    // }, []);

    useEffect(() => {
        const fetchEventList = async () => {
            try {
                const response = await fetch(
                    BACKENDADRESS + `/events/${user.token}`,
                    {},
                );
                const data = await response.json();
                setEvents(data.events);
            } catch (error) {
                console.error("Erreur de récupération events", error);
            }
        };
        fetchEventList();
    }, []);

    const listMembers = () => {};

    const eventsListUser = events.map((event) => (
        <View key={event._id} style={styles.event}>
            <Text style={styles.texte}>{event.title}</Text>
            <BouncyCheckbox
                size={25}
                fillColor="blue"
                unFillColor="#FFFFFF"
                text="Custom Checkbox"
                isChecked={false}
                iconStyle={{ borderColor: "blue" }}
                innerIconStyle={{ borderWidth: 2 }}
                textStyle={{ fontFamily: "JosefinSans-Regular" }}
                onPress={(isChecked: boolean) => {
                    if (isChecked) {
                        setEventIdChoise(event._id);
                    } else {
                        setEventIdChoise("");
                    }
                }}
            />
        </View>
    ));

    return (
        <View>
            <View style={styles.header}>
                <Header destination={"Chat"} goBack={true} />
            </View>
            <View style={styles.container}>
                {/* <View>
                    <Text style={styles.title}>
                        Recherche ton ami pour chater :
                    </Text>
                    <View style={styles.search}>
                        <TextInput
                            style={styles.input}
                            placeholder="username..."
                            placeholderTextColor="grey"
                            onChangeText={(value) => setUsername(value)}
                            value={username}
                        />
                        <Button
                            colour="green"
                            size="m"
                            text="+"
                            onPress={handleSearchUser}
                        />
                    </View>
                </View> */}
                <View>
                    <Text style={styles.texte}>Choisis ton évènement :</Text>
                    {eventsListUser}
                </View>
                <View>
                    <Text style={styles.texte}>
                        Choisis avec qui tu veux chater :
                    </Text>
                    {eventListMembers}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
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
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
    },
    event: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    texte: {
        color: "black",
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
});
