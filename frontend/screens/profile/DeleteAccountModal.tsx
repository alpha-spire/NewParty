import React from "react";
import { Text, View, StyleSheet, Modal } from "react-native";
import { BACKENDADRESS } from "../../config";
import { Button } from "../../ui/button";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { logout, UserState } from "../../reducers/user";

type DeleteAccountModalProps = {
    navigation: NavigationProp<ParamListBase>;
    onClose: () => void;
    visible: boolean;
};

export default function DeleteAccountModal({
    navigation,
    onClose,
    visible,
}: DeleteAccountModalProps) {
    const dispatch = useDispatch();
    const user = useSelector((state: { user: UserState }) => state.user.value);

    const handleDeleteUser = async () => {
        try {
            const response = await fetch(BACKENDADRESS + "/users/delete/", {
                method: "DELETE",
                headers: { Authorization: `Bearer ${user.token}` },
            });
            if (!response.ok) {
                // Afficher un message d'erreur
                throw new Error(`Erreur serveur : ${response.status}`);
            }
            dispatch(logout());
            navigation.navigate("Home");
        } catch (error) {
            console.log("Erreur réseau :", error);
        }
    };

    return (
        <Modal visible={visible} transparent style={styles.modal}>
            <View style={styles.container}>
                <Text style={styles.texte}>
                    Etes-vous sur de bien vouloir supprimer votre compte ?
                </Text>
                <View style={styles.button}>
                    <Button
                        colour="red"
                        size="m"
                        text="Oui"
                        onPress={handleDeleteUser}
                    />
                    <Button
                        colour="blue"
                        size="m"
                        text="Non"
                        onPress={() => onClose()}
                    />
                </View>
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

    button: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
});
