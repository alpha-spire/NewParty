import React from "react";
import { Text, View, StyleSheet, Modal, ScrollView } from "react-native";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { useState, useEffect } from "react";
import { Xbutton } from "../../ui/xButton";
import { BACKENDADRESS } from "../../config";
import { Button } from "../../ui/button";
import { User } from "../../types/user";

type FriendModalProps = {
    onClose: () => void;
    visible: boolean;
    addMember: (member: string) => void;
    removeMember: (member: string) => void;
    memberIds: string[];
};

export default function FriendsModal({
    onClose,
    visible,
    addMember,
    removeMember,
    memberIds,
}: FriendModalProps) {
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        const fetchUserList = async () => {
            try {
                const response = await fetch(BACKENDADRESS + "/users", {});
                const data = await response.json();

                setUsers(data.users);
            } catch (error) {
                console.error("Erreur de récupération Users", error);
            }
        };
        fetchUserList();
    }, []);

    const handleRegister = () => {
        onClose();
    };

    const friendsList = users.map((user) => (
        <View key={user._id} style={styles.friend}>
            <Text style={styles.texte}>{user.username}</Text>
            <BouncyCheckbox
                size={25}
                fillColor="red"
                unFillColor="#FFFFFF"
                text="Custom Checkbox"
                isChecked={memberIds.includes(user._id)}
                iconStyle={{ borderColor: "red" }}
                innerIconStyle={{ borderWidth: 2 }}
                textStyle={{ fontFamily: "JosefinSans-Regular" }}
                onPress={(isChecked: boolean) => {
                    if (isChecked) {
                        addMember(user._id);
                    } else {
                        removeMember(user._id);
                    }
                }}
            />
        </View>
    ));

    return (
        <Modal visible={visible} transparent style={styles.modal}>
            <View style={styles.container}>
                <Xbutton colour="black" size="m" text="X  " onPress={onClose} />
                <ScrollView contentContainerStyle={styles.galleryContainer}>
                    {friendsList}
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
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#202020",
        borderRadius: 40,
        margin: 40,
        height: 670,
        top: 20,
        borderWidth: 1,
        borderColor: "white",
    },
    texte: {
        color: "white",
        fontSize: 30,
        alignSelf: "center",
        minWidth: 200,
        maxWidth: 200,
    },

    friend: {
        flexDirection: "row",
        justifyContent: "space-evenly",
        borderWidth: 1,
        padding: 5,
        borderTopColor: "white",
        backgroundColor: "#212121",
        width: "100%",
    },
    checkbox: {
        alignSelf: "center",
    },
    galleryContainer: {
        flexWrap: "wrap",
        flexDirection: "column",
        justifyContent: "center",
    },
});
