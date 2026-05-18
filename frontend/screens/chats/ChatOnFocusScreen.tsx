import { StyleSheet, Text, View, TextInput, Image, Alert } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { FlatList } from "react-native";
import { BACKENDADRESS } from "../../config";
import { useSelector } from "react-redux";
import { useEventState } from "../../reducers/event";
import { UserState } from "../../reducers/user";
import React, { useEffect, useState } from "react";
import { Message } from "../../types/message";
import { User } from "../../types/user";
import Header from "../headers/Header";
import { SendButton } from "../../ui/sendButton";

// _userId est populé par le backend (objet User au lieu d'un simple string)
type PopulatedMessage = Omit<Message, "_userId"> & {
    _userId: Pick<User, "_id" | "username" | "userPhoto">;
};

export default function ChatOnFocusScreen() {
    const currentEvent = useEventState()!;
    const user = useSelector((state: { user: UserState }) => state.user.value);
    const isFocused = useIsFocused();

    const [chat, setChat] = useState<PopulatedMessage[]>([]);
    const [message, setMessage] = useState("");

    // Récupère les messages et relance un polling toutes les 10s quand l'écran est actif
    useEffect(() => {
        if (!isFocused) return;

        const fetchChatList = async () => {
            try {
                const response = await fetch(
                    BACKENDADRESS + `/messages/${currentEvent._id}`,
                    { headers: { Authorization: `Bearer ${user.token}` } },
                );
                const data = await response.json();
                // Le backend retourne "chat" et non "messages"
                if (data.result) setChat(data.chat);
            } catch (error) {
                console.error("Erreur de récupération messages:", error);
            }
        };

        fetchChatList();
        const interval = setInterval(fetchChatList, 10000);
        return () => clearInterval(interval); // nettoyage à la désactivation de l'écran
    }, [isFocused, currentEvent._id]);

    // Envoie un message et l'ajoute localement sans attendre le prochain polling
    const handleAddMessage = async () => {
        if (!message.trim()) return;
        try {
            const response = await fetch(
                BACKENDADRESS + `/messages/${currentEvent._id}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${user.token}`,
                    },
                    body: JSON.stringify({ message }),
                },
            );
            const data = await response.json();
            if (data.result) {
                // Construit le message populé localement pour éviter un refetch immédiat
                const newMessage: PopulatedMessage = {
                    ...data.message,
                    _userId: {
                        _id: user._id!,
                        username: user.username!,
                        userPhoto: user.userPhoto,
                    },
                };
                setChat((prev) => [...prev, newMessage]);
                setMessage("");
            }
        } catch (error) {
            Alert.alert("Erreur", "Impossible d'envoyer le message");
            console.error("Erreur envoi message:", error);
        }
    };

    return (
        <View style={styles.screen}>
            <View style={styles.header}>
                <Header destination={"Chat"} goBack={true} />
            </View>

            <View style={styles.container}>
                <View style={styles.underHeader}>
                    <Text style={styles.title}>{currentEvent.title}</Text>
                </View>

                {/* Liste inversée — le plus récent reste en bas */}
                <FlatList
                    style={styles.listPosition}
                    data={chat.toReversed()}
                    keyExtractor={(item) => item._id}
                    inverted
                    renderItem={({ item }) => (
                        <View>
                            {/* Bulle droite : message de l'utilisateur connecté */}
                            {item._userId._id === user._id ? (
                                <View style={styles.user}>
                                    <Text style={styles.userTexte}>
                                        {item.message}
                                    </Text>
                                    <Text style={styles.userDate}>
                                        {item.createdAt.slice(11, 16)}
                                    </Text>
                                </View>
                            ) : (
                                /* Bulle gauche : message d'un autre membre */
                                <View style={styles.notUser}>
                                    {item._userId.userPhoto ? (
                                        <Image
                                            style={styles.userPhoto}
                                            source={{ uri: item._userId.userPhoto }}
                                        />
                                    ) : null}
                                    <Text style={styles.member}>
                                        {item._userId.username}
                                    </Text>
                                    <Text style={styles.notUserTexte}>
                                        {item.message}
                                    </Text>
                                    <Text style={styles.notUserDate}>
                                        {item.createdAt.slice(11, 16)}
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}
                />

                {/* Zone de saisie */}
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
    screen: {
        flex: 1,
        backgroundColor: "#1b1b1b",
    },
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
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
    userPhoto: {
        width: 30,
        height: 30,
        borderWidth: 2,
        borderRadius: 25,
        borderColor: "white",
    },
    listPosition: {
        width: "100%",
        flex: 1,
    },
    // Bulle de l'utilisateur connecté — droite, fond clair
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
    userTexte: {
        marginLeft: 10,
        color: "black",
        fontSize: 20,
    },
    userDate: {
        color: "#4f4f4f",
        fontSize: 12,
        textAlign: "right",
        marginRight: 10,
    },
    // Bulle des autres membres — gauche, fond sombre
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
    notUserTexte: {
        marginLeft: 10,
        color: "white",
        fontSize: 20,
    },
    notUserDate: {
        color: "grey",
        fontSize: 12,
        textAlign: "right",
        marginRight: 10,
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
});
