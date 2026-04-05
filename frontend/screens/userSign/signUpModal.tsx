import { Text, View, TextInput, StyleSheet, Modal } from "react-native";
import { useState } from "react";
import { Button } from "../../ui/button";
import { Xbutton } from "../../ui/xButton";
import { useDispatch } from "react-redux";
import { login } from "../../reducers/user";
import { useNavigation } from "@react-navigation/native";
import { BACKENDADRESS } from "../../config";


const EMAIL_REGEX: RegExp = /^\S+@\S+\.\S+$/;

export default function SignUpModal({
    onClose,
    visible,
}: {
    onClose: () => void;
    visible: boolean;
}) {
    const navigation = useNavigation<any>();
    const dispatch = useDispatch();

    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isGoodPassword, setIsGoodPassword] = useState("");
    const [passwordError, setPasswordError] = useState(false);
    const [emailError, setEmailError] = useState(false);
    const [missingError, setMissingError] = useState(false);
    const [userError, setUserError] = useState(false);

    const handleRegister = () => {
        // setIsGoodPassword(password);
        // setEmail(email);
        setEmailError(false);
        setMissingError(false);
        setUserError(false);
        setPasswordError(false);

        if (isGoodPassword !== password) {
            setPasswordError(true);
            return;
        }
        if (!EMAIL_REGEX.test(email)) {
            setEmailError(true);
            return;
        }

        fetch(BACKENDADRESS + "/users/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email,
                username,
                password,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.error === "Missing or empty fields") {
                    setMissingError(true);
                }
                if (data.error === "User already exists") {
                    setUserError(true);
                }
                if (data.result) {
                    dispatch(
                        login({
                            email,
                            username,
                            token: data.token,
                            userPhoto: "",
                        }),
                    );
                    navigation.navigate("TabNavigator");
                    onClose();
                }
            })
            .catch(console.error);
        setEmail("");
        setPassword("");
        setUsername("");
        setIsGoodPassword("");
    };

    return (
        <Modal visible={visible} transparent style={styles.modal}>
            <View style={styles.container}>
                <View>
                    <Xbutton
                        colour="black"
                        size="s"
                        text="X  "
                        onPress={onClose}
                    />
                </View>
                <Text style={styles.maintext}>S'INSCRIRE</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="grey"
                    onChangeText={(value) => setEmail(value)}
                    value={email}
                />
                {emailError && (
                    <Text style={styles.error}>Invalid email address</Text>
                )}
                <TextInput
                    style={styles.input}
                    placeholder="Username"
                    placeholderTextColor="grey"
                    onChangeText={(value) => setUsername(value)}
                    value={username}
                />
                {userError && (
                    <Text style={styles.error}>"User already exists"</Text>
                )}
                <TextInput
                    style={styles.input}
                    placeholder="Mot de passe"
                    placeholderTextColor="grey"
                    secureTextEntry
                    onChangeText={(value) => setPassword(value)}
                    value={password}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Vérification du Mot de passe"
                    placeholderTextColor="grey"
                    secureTextEntry
                    onChangeText={(value) => setIsGoodPassword(value)}
                    value={isGoodPassword}
                />
                {passwordError && (
                    <Text style={styles.error}>Invalid password</Text>
                )}
                {missingError && (
                    <Text style={styles.error}>
                        Veuillez remplir tous les champs
                    </Text>
                )}
                <Button
                    colour="pink"
                    size="m"
                    text="GO"
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
        backgroundColor: "#202020",
        borderRadius: 40,
        margin: 40,
        height: 670,
        top: 20,
        borderWidth: 1,
        borderColor: "white",
    },
    error: {
        marginTop: 10,
        color: "red",
    },
    input: {
        height: 40,
        margin: 15,
        borderWidth: 1,
        padding: 10,
        color: "white",
        borderColor: "white",
        width: "80%",
        borderRadius: 25,
        bottom: 15,
    },
    text: {
        color: "white",
        fontSize: 15,
    },
    maintext: {
        color: "white",
        fontSize: 20,
        bottom: 50,
        marginTop: 20,
    },
});
