import React, { useState } from "react";
import { Text, View, StyleSheet, Modal, ScrollView } from "react-native";
import { Xbutton } from "../../ui/xButton";
import { Button } from "../../ui/button";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { useGetUserEvents } from "../../hooks/useGetUSerEvents";

type EventModalProps = {
    onClose: () => void;
    visible: boolean;
    addEvent: (eventIdChoise: string) => void;
    addTitle: (titleEvent: string) => void;
    removeTitle: (titleEvent: string) => void;
    title: string[];
};

export default function EventModal({
    onClose,
    visible,
    addEvent,
    addTitle,
    removeTitle,
    title,
}: EventModalProps) {
    const [eventIdChoise, setEventIdChoise] = useState<string>("");

    // Réutilise le hook centralisé pour récupérer les événements de l'utilisateur
    const { events } = useGetUserEvents();

    const handleRegister = () => {
        addEvent(eventIdChoise);
        onClose();
    };

    return (
        <Modal visible={visible} transparent style={styles.modal}>
            <View style={styles.container}>
                <Xbutton colour="black" size="s" text="X  " onPress={onClose} />

                <Text style={styles.texte}>
                    Choisis l'évènement en cours pour ta photo dans la liste
                    suivante :
                </Text>

                {/* Liste des événements avec case à cocher — sélection unique */}
                <ScrollView contentContainerStyle={styles.galleryContainer}>
                    {events.map((event) => (
                        <View key={event._id} style={styles.event}>
                            <Text style={styles.texte}>{event.title}</Text>
                            <BouncyCheckbox
                                size={25}
                                fillColor="blue"
                                unFillColor="#FFFFFF"
                                isChecked={title.includes(event.title)}
                                iconStyle={{ borderColor: "blue" }}
                                innerIconStyle={{ borderWidth: 2 }}
                                onPress={(isChecked: boolean) => {
                                    if (isChecked) {
                                        setEventIdChoise(event._id);
                                        addTitle(event.title);
                                    } else {
                                        setEventIdChoise("");
                                        removeTitle("");
                                    }
                                }}
                            />
                        </View>
                    ))}
                </ScrollView>

                <Button
                    colour="grey"
                    size="m"
                    text="Enregistrer"
                    onPress={handleRegister}
                />
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modal: {
        alignItems: "center",
        justifyContent: "center",
    },
    container: {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "grey",
        borderRadius: 40,
        margin: 40,
        height: 670,
        top: 20,
        borderWidth: 1,
        borderColor: "white",
    },
    texte: {
        color: "white",
        fontSize: 20,
    },
    galleryContainer: {
        flexWrap: "wrap",
        flexDirection: "column",
        justifyContent: "center",
    },
    event: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
});
