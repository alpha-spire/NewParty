import React, { useEffect } from "react";
import {
    Text,
    View,
    StyleSheet,
    Modal,
    ScrollView,
} from "react-native";
import { useState } from "react";
import { Xbutton } from "../../ui/xButton";
import { Button } from "../../ui/button";
import { BACKENDADRESS } from "../../config";
import { UserState } from "../../reducers/user";
import { useSelector } from "react-redux";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { useGetUserEvents } from "../../hooks/useGetUSerEvents";


type EventModalProps = {
    onClose: () => void;
    visible: boolean;
    addEvent: (eventIdChoise: string) => void;
    addTitle: (titleEvent: string) => void;
    removeTitle: (titleEvent: string) => void;
    title : string[] ;
};

export default function EventModal({
    onClose,
    visible,
    addEvent,
    addTitle,
    removeTitle,    
    title
}: EventModalProps) {
    const [eventIdChoise, setEventIdChoise] = useState<string>("");

    const user = useSelector((state: { user: UserState }) => state.user.value);

    const events = useGetUserEvents();

    const handleRegister = () => {
        addEvent(eventIdChoise);
        onClose();        
    };

    const eventsListUser = events.map((event) => (
        <View key={event._id} style={styles.event}>
            <Text style={styles.texte}>{event.title}</Text>
            <BouncyCheckbox
                size={25}
                fillColor="blue"
                unFillColor="#FFFFFF"
                text="Custom Checkbox"
                isChecked={title.includes(event.title)}
                iconStyle={{ borderColor: "blue" }}
                innerIconStyle={{ borderWidth: 2 }}
                textStyle={{ fontFamily: "JosefinSans-Regular" }}
                onPress={(isChecked: boolean) => {
                    if (isChecked) {
                        setEventIdChoise(event._id);
                        addTitle(event.title)
                    } else {
                        setEventIdChoise("");
                        removeTitle("")
                    }
                }}
            />
        </View>
    ));

    return (
        <Modal visible={visible} transparent style={styles.modal}>
            <View style={styles.container}>
                <Xbutton colour="black" size="s" text="X  " onPress={onClose} />

                <Text style={styles.texte}>
                    Choisis l'évènement en cours pour ta photo dans la liste suivante :
                </Text>
                <ScrollView contentContainerStyle={styles.galleryContainer}>
                    {eventsListUser}
                </ScrollView>
                <Button
                    colour="grey"
                    size="m"
                    text="Enregistrer"
                    onPress={() => handleRegister()}
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
        alignItems: "center",
        justifyContent: "center",
    },
    buttonContainer: {
        flex: 0.1,
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "space-between",
        paddingTop: 20,
        paddingLeft: 20,
        paddingRight: 20,
    },
    galleryContainer: {
        flexWrap: "wrap",
        flexDirection: "column",
        justifyContent: "center",
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
    event: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    checkbox: {
        alignSelf: "center",
    },
    btn: {
        backgroundColor: "black",
        borderRadius: 40,
        alignItems: "center",
        padding: 10,
    },
    btnTxt: { color: "white" },
});
