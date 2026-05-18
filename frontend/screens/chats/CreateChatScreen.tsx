import { StyleSheet, Text, View, FlatList, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from "react";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import Header from "../headers/Header";
import { BACKENDADRESS } from "../../config";
import { useSelector, useDispatch } from "react-redux";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { EventWithUsers } from "../../types/event";
import { UserState } from "../../reducers/user";
import { addEvent } from "../../reducers/event";

type UserScreenProps = {
    navigation: NavigationProp<ParamListBase>;
};

export default function CreateChatScreen({ navigation }: UserScreenProps) {
    const [events, setEvents] = useState<EventWithUsers[]>([]);
    // Événement sélectionné — objet complet nécessaire pour Redux
    const [selectedEvent, setSelectedEvent] = useState<EventWithUsers | null>(null);

    const user = useSelector((state: { user: UserState }) => state.user.value);
    const dispatch = useDispatch();

    // Récupère les événements de l'utilisateur au montage
    useEffect(() => {
        const fetchEventList = async () => {
            try {
                const response = await fetch(BACKENDADRESS + "/events", {
                    headers: { Authorization: `Bearer ${user.token}` },
                });
                const data = await response.json();
                if (data.result) setEvents(data.listEvents);
            } catch (error) {
                console.error("Erreur de récupération events", error);
            }
        };
        fetchEventList();
    }, []);

    // Stocke l'event dans Redux puis navigue vers le chat de cet event
    const handleStartChat = () => {
        if (!selectedEvent) return;
        dispatch(addEvent(selectedEvent));
        navigation.navigate("ChatOnFocus");
    };

    return (
        <View style={styles.screen}>
            <View style={styles.header}>
                <Header destination={"Chat"} goBack={true} />
            </View>
            <View style={styles.container}>
                <Text style={styles.sectionTitle}>Choisis ton évènement :</Text>

                {/* Liste des événements — sélection unique par case à cocher */}
                <FlatList
                    style={styles.list}
                    data={events}
                    keyExtractor={(item) => item._id}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>
                            Aucun événement disponible
                        </Text>
                    }
                    renderItem={({ item }) => (
                        <View style={styles.event}>
                            <Text style={styles.texte}>{item.title}</Text>
                            <BouncyCheckbox
                                size={25}
                                fillColor="#92ff2d"
                                unFillColor="#323232"
                                isChecked={selectedEvent?._id === item._id}
                                iconStyle={{ borderColor: "#92ff2d" }}
                                innerIconStyle={{ borderWidth: 2 }}
                                onPress={(isChecked: boolean) => {
                                    setSelectedEvent(isChecked ? item : null);
                                }}
                            />
                        </View>
                    )}
                />

                {/* Bouton actif uniquement quand un événement est sélectionné */}
                <TouchableOpacity
                    style={[
                        styles.button,
                        !selectedEvent && styles.buttonDisabled,
                    ]}
                    onPress={handleStartChat}
                    disabled={!selectedEvent}
                >
                    <Text style={styles.buttonText}>Démarrer la discussion</Text>
                </TouchableOpacity>
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
        alignItems: "center",
        backgroundColor: "#1b1b1b",
        paddingTop: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "white",
        marginBottom: 15,
    },
    list: {
        width: "100%",
        flex: 1,
    },
    event: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 0.2,
        borderColor: "white",
    },
    texte: {
        color: "white",
        fontSize: 18,
    },
    emptyText: {
        color: "grey",
        textAlign: "center",
        marginTop: 40,
        fontSize: 15,
    },
    button: {
        marginVertical: 20,
        backgroundColor: "#92ff2d",
        paddingHorizontal: 30,
        paddingVertical: 14,
        borderRadius: 25,
    },
    buttonDisabled: {
        backgroundColor: "#3a3a3a",
    },
    buttonText: {
        color: "#1b1b1b",
        fontWeight: "bold",
        fontSize: 16,
    },
});
