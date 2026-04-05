import { StyleSheet, Text, View, TextInput, Image } from "react-native";
import {
    NavigationProp,
    ParamListBase,
    useIsFocused,
} from "@react-navigation/native";
import { FlatList } from "react-native";
import { BACKENDADRESS } from "../../config";
import { useSelector } from "react-redux";
import { useEventState } from "../../reducers/event";
import { UserState } from "../../reducers/user";
import React, { useEffect, useState } from "react";
import { Message } from "../../types/message";
import Header from "../headers/Header";
import { SendButton } from "../../ui/sendButton";
import { AddMemberButton } from "../../ui/addMemberButton";

type UserScreenProps = {
    navigation: NavigationProp<ParamListBase>;
};

export default function FocusocusOnAlbum({ navigation }: UserScreenProps) {
    const currentEvent = useEventState()!;
    const user = useSelector((state: { user: UserState }) => state.user.value);
    const isFocused = useIsFocused();
    const event = useEventState();
    const [chat, setChat] = useState<Message[]>([]);
    const [message, setMessage] = useState("");
    const [userId, setUserId] = useState("");
    // const [notUserId, setNotUserId] = useState("");

    useEffect(() => {
        const fetchChatList = async () => {
            try {
                const response = await fetch(
                    BACKENDADRESS + `/messages/${currentEvent._id}`,
                );
                const data = await response.json();
                setChat(data.messages);
            } catch (error) {
                console.error("Erreur de récupération Message", error);
            }
        };
        const interval = setInterval(() => {
            fetchChatList();
        }, 10000);
        fetchChatList();
        // (globalThis as any).fetchChatList = fetchChatList;
        return () => clearInterval(interval);
    }, [currentEvent._id]);

    const handleAddMessage = () => {
        fetch(BACKENDADRESS + `/messages/${user.token}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message: message,
                eventId: event!._id,
                date: new Date().toISOString(),
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                const fetchChatList = async () => {
                    try {
                        const response = await fetch(
                            BACKENDADRESS + `/messages/${currentEvent._id}`,
                        );
                        const data = await response.json();
                        setChat(data.messages);
                    } catch (error) {
                        console.error("Erreur de récupération Message", error);
                    }
                };
                fetchChatList();
                setMessage("");
            });
    };

    const getUserId = () => {
        fetch(BACKENDADRESS + `/users/${user.token}`)
            .then((response) => response.json())
            .then((data) => {
                if (data.result) {
                    setUserId(data.user._id);
                }
            });
    };
    getUserId();

    const handleAddMember = () => {};

    return (
        <View style={{ height: "100%" }}>
            <View style={styles.header}>
                <Header destination={"Chat"} goBack={true} />
            </View>
            <View style={styles.container}>
                <View style={styles.underHeader}>
                    <Text style={styles.title}>{currentEvent.title}</Text>
                    <AddMemberButton
                        colour="#1b1b1b"
                        size="m"
                        text="+"
                        onPress={handleAddMember}
                    />
                </View>
                <FlatList
                    style={styles.listPosition}
                    data={chat.toReversed()}
                    keyExtractor={(item) => item._id}
                    inverted
                    renderItem={({ item }) => (
                        <View>
                            {userId === item._userId ? (
                                <View style={styles.user}>
                                    <Text style={styles.userTexte}>
                                        {item.message}
                                    </Text>
                                    <Text style={styles.userDate}>
                                        {item.date.slice(11, 16)}
                                    </Text>
                                </View>
                            ) : (
                                <View style={styles.notUser}>
                                    <Image
                                        style={styles.userPhoto}
                                        source={{
                                            uri: event?.memberIds.find(
                                                (member) => {
                                                    return (
                                                        member._id ===
                                                        item._userId
                                                    );
                                                },
                                            )?.userPhoto,
                                        }}
                                    />
                                    <Text style={styles.member}>
                                        {
                                            event?.memberIds.find((member) => {
                                                return (
                                                    member._id === item._userId
                                                );
                                            })?.username
                                        }
                                    </Text>
                                    <Text style={styles.notUserTexte}>
                                        {item.message}
                                    </Text>
                                    <Text style={styles.notUserDate}>
                                        {item.date.slice(11, 16)}
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}
                />
                <View style={styles.footer}>
                    <TextInput
                        style={styles.input}
                        placeholder="message..."
                        placeholderTextColor="grey"
                        onChangeText={(value) => setMessage(value)}
                        value={message}
                    />
                    <SendButton text="" onPress={handleAddMessage} size="m" />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#1b1b1b",
        flex: 1,
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
        padding: 10,
        paddingTop: 20,
        alignItems: "flex-start",
        justifyContent: "center",
        backgroundColor: "#1b1b1b",
        height: 100,
        width: "100%",
        borderBottomWidth: 0.2,
        borderColor: "white",
    },
    title: {
        fontSize: 30,
        fontWeight: "bold",
        color: "white",
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
    userPhoto: {
        width: 30,
        height: 30,
        borderWidth: 2,
        borderRadius: 25,
        borderColor: "white",
    },
    listPosition: {
        width: "100%",
        height: "100%",
    },
    photoBox: {
        display: "flex",
        flexDirection: "row",
        backgroundColor: "#1b1b1b",
        borderTopColor: "white",
        borderTopWidth: 0.5,
        marginBottom: -37,
        width: 375,
    },
    userTexte: {
        marginLeft: 10,
        color: "black",
        fontSize: 20,
    },
    notUserTexte: {
        marginLeft: 10,
        color: "white",
        fontSize: 20,
    },
    userDate: {
        color: "#4f4f4f",
        fontSize: 12,
        textAlign: "right",
        marginRight: 10,
    },
    notUserDate: {
        color: "grey",
        fontSize: 12,
        textAlign: "right",
        marginRight: 10,
    },
    user: {
        marginRight: 10,
        marginLeft: "35%",
        marginBottom: 10,
        backgroundColor: "#fac4ff",
        borderRadius: 20,
        borderWidth: 0.5,
        borderBottomRightRadius: 0,
        borderColor: "white",
        padding: 5,
    },
    notUser: {
        marginLeft: 10,
        marginRight: "35%",
        marginBottom: 10,
        backgroundColor: "#282828",
        borderRadius: 20,
        borderWidth: 0.5,
        borderBottomLeftRadius: 0,
        borderColor: "grey",
        padding: 5,
    },
    member: {
        marginLeft: 10,
        color: "grey",
        fontSize: 15,
    },
    footer: {
        height: 100,
        width: "101%",
        flexDirection: "row",
        borderTopWidth: 0.2,
        borderLeftWidth: 0.2,
        borderRightWidth: 0.2,
        borderTopColor: "white",
        borderLeftColor: "white",
        borderRightColor: "white",
        padding: 20,
        borderTopStartRadius: 35,
        borderTopEndRadius: 35,
    },
    input: {
        height: 50,
        marginRight: 15,
        borderWidth: 2,
        padding: 10,
        color: "black",
        borderColor: "grey",
        backgroundColor: "white",
        borderRadius: 25,
        width: "80%",
    },

    infosBox: {
        alignContent: "center",
        marginTop: 10,
    },
    eventInfos: {
        color: "grey",
        fontSize: 15,
        fontFamily: "",
        marginBottom: -1.75,
    },
    updPhoto: {
        width: 120,
        height: 120,
        borderWidth: 2,
        borderRadius: 25,
        borderColor: "white",
        marginLeft: 10,
        marginRight: 10,
        marginTop: 10,
    },
});
