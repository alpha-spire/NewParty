import React from "react";
import { Text, View, StyleSheet, Modal, ScrollView } from "react-native";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { useState, useEffect } from "react";
import { Xbutton } from "../../ui/xButton";
import { BACKENDADRESS } from "../../config";
import { apiFetch } from "../../utils/apiFetch";
import { Button } from "../../ui/button";
import { User } from "../../types/user";
import { useSelector } from "react-redux";
import { UserState } from "../../reducers/user";

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
    const [friends, setFriends] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const user = useSelector((state: { user: UserState }) => state.user.value);

    useEffect(() => {
        // Ne fetch que quand la modal s'ouvre et que le token est disponible
        if (!visible || !user.token) return;

        const fetchFriends = async () => {
            setIsLoading(true);
            try {
                const response = await apiFetch(BACKENDADRESS + "/users/friends", {
                    headers: { Authorization: `Bearer ${user.token}` },
                });

                if (!response.ok) {
                    console.error("Erreur fetch friends:", response.status);
                    return;
                }
                const data = await response.json();
                if (data.result) {
                    setFriends(data.friends);
                }
            } catch (error) {
                console.error("Erreur de récupération Users", error);
            }finally {
                setIsLoading(false);
            }
        };
        fetchFriends();
    }, [visible]);


    const friendsList = friends.map((friend) => (
        <View key={friend._id} style={styles.friend}>
            <Text style={styles.texte}>{friend.username}</Text>
            <BouncyCheckbox
                size={25}
                fillColor="red"
                unFillColor="#FFFFFF"
                isChecked={memberIds.includes(friend._id)}
                iconStyle={{ borderColor: "red" }}
                innerIconStyle={{ borderWidth: 2 }}
                onPress={(isChecked: boolean) => {
                    if (isChecked) {
                        addMember(friend._id);
                    } else {
                        removeMember(friend._id);
                    }
                }}
            />
        </View>
    ));

    return (
        <Modal visible={visible} transparent style={styles.modal}>
            <View style={styles.container}>
                <Xbutton colour="black" size="m" text="X  " onPress={onClose} />
                <Text style={styles.title}>Inviter des amis</Text>

                {/* Affiche un message pendant le chargement */}
                {isLoading ? (
                    <Text style={styles.texte}>Chargement...</Text>
                ) : friends.length === 0 ? (
                    // Message si pas d'amis — invite à en ajouter depuis FriendsScreen
                    <Text style={styles.emptyText}>
                        Aucun ami pour le moment.{"\n"}
                        Ajoutes-en depuis l'onglet Amis !
                    </Text>
                ) : (
                <ScrollView contentContainerStyle={styles.galleryContainer}>
                    {friendsList}
                </ScrollView>)}

                {/* Bouton fermeture — simplifié, handleRegister ne faisait que onClose() */}
                <Button
                    colour="grey"
                    size="m"
                    text="Enregistrer"
                    onPress={onClose}
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
    title: {
        color: "white",
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 15,
    },
        emptyText: { // style pour le message "aucun ami"
        color: "grey",
        fontSize: 16,
        textAlign: "center",
        marginTop: 20,
        paddingHorizontal: 20,
        lineHeight: 24,
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
    galleryContainer: {
        flexWrap: "wrap",
        flexDirection: "column",
        justifyContent: "center",
    },
});
