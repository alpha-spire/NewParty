import React from "react";
import { Text, View, TextInput, StyleSheet, Modal } from "react-native";
import { useState } from "react";
import { Button } from "../../ui/button";
import { Xbutton } from "../../ui/xButton";
import { useDispatch } from "react-redux";
import { login } from "../../reducers/user";
import { useNavigation } from "@react-navigation/native";
import { BACKENDADRESS } from "../../config";

export default function SignInModal({
    onClose,
    visible,
}: {
    onClose: () => void;
    visible: boolean;
}) {
    const navigation = useNavigation<any>();
    const dispatch = useDispatch();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [passwordError, setPasswordError] = useState(false);
    const [missingError, setMissingError] = useState(false);

    const [text, onChangeText] = React.useState("Useless Text");

    const handleConnection = async () => {
        setMissingError(false);
        setPasswordError(false);

        const res = await fetch(BACKENDADRESS + "/users/signin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username,
                password,
            }),
        });
        const data = await res.json();
        if (data.error === "Missing or empty fields") {
            setMissingError(true);
        }
        if (data.error === "User not found or wrong password") {
            setPasswordError(true);
        }
        if (data.result) {
            const { email, username, userPhoto } = data.user;

            dispatch(
                login({
                    email,
                    username,
                    token: data.token,
                    userPhoto,
                }),
            );

            setUsername("");
            setPassword("");
            navigation.navigate("TabNavigator");
            onClose();

        }
        setPassword("");
        setUsername("");
    };

    return (
        <Modal visible={visible} transparent style={styles.modal}>
            <View style={styles.container}>
                <Xbutton colour="black" size="s" text="X  " onPress={onClose} />
                <Text style={styles.maintext}>SE CONNECTER</Text>
                <TextInput
                    style={styles.input}
                    placeholder="username"
                    placeholderTextColor="grey"
                    onChangeText={setUsername}
                    value={username}
                />
                <TextInput
                    style={styles.input}
                    placeholder="mot de passe"
                    secureTextEntry
                    placeholderTextColor="grey"
                    onChangeText={setPassword}
                    value={password}
                />
                {missingError && (
                    <Text style={styles.error}>
                        Veuillez remplir tous les champs
                    </Text>
                )}
                {passwordError && (
                    <Text style={styles.error}>
                        User not found or wrong password
                    </Text>
                )}
                <Button
                    colour="pink"
                    size="m"
                    text="GO"
                    onPress={handleConnection}
                />
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    input: {
        height: 40,
        margin: 15,
        borderWidth: 1,
        padding: 10,
        color: "white",
        borderColor: "white",
        borderRadius: 25,
        width: "80%",
    },
    container: {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#202020",
        borderRadius: 40,

        margin: 40,
        height: 515,
        top: 20,
        borderWidth: 1,
        borderColor: "white",
    },
    error: {
        marginTop: 10,
        color: "red",
    },
    modal: {
        alignItems: "center",
        justifyContent: "center",
    },
    text: {
        color: "white",
        fontSize: 15,
    },
    maintext: {
        color: "white",
        fontSize: 20,
        bottom: 40,
        marginTop: 10,
    },
});
