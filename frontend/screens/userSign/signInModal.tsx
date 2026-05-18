import React, { useState } from "react";
import { Text, View, TextInput, StyleSheet, Modal } from "react-native";
import { Button } from "../../ui/button";
import { Xbutton } from "../../ui/xButton";
import { useDispatch } from "react-redux";
import { login } from "../../reducers/user";
import { useNavigation } from "@react-navigation/native";
import { BACKENDADRESS } from "../../config";

type SignInModalProps = {
    onClose: () => void;
    visible: boolean;
};

export default function SignInModal({ onClose, visible }: SignInModalProps) {
    const navigation = useNavigation<any>();
    const dispatch = useDispatch();

    // Champs du formulaire
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    // États d'erreur
    const [passwordError, setPasswordError] = useState(false);
    const [missingError, setMissingError] = useState(false);
    // État de chargement pendant l'appel API
    const [isLoading, setIsLoading] = useState(false);

    // Réinitialise les champs du formulaire
    const resetFormulaire = () => {
        setUsername("");
        setPassword("");
    };

    const handleConnection = async () => {
        // Reset des erreurs avant chaque tentative
        setMissingError(false);
        setPasswordError(false);

        if (!username || !password) {
            setMissingError(true);
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch(BACKENDADRESS + "/users/signin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username,
                    password,
                }),
            });

            const data = await res.json();
            // Gestion des erreurs retournées par le backend
            if (data.error === "Missing or empty fields") {
                setMissingError(true);
            }
            if (data.error === "Invalid credentials") {
                setPasswordError(true);
            }

            //connexion réussie, on stocke les infos de l'utilisateur dans le store Redux
            if (data.result) {
                dispatch(
                    login({
                        _id: data._id,
                        username: data.username,
                        token: data.token,
                        email: null,
                        userPhoto: data.userPhoto ?? null,
                        // friendIds et eventIds absents → [] par défaut dans le reducer
                    }),
                );
                onClose();
                navigation.navigate("TabNavigator");
            }
        } catch (error) {
            console.error("Error during sign-in:", error);
        } finally {
            setIsLoading(false);
            resetFormulaire();
        }
    };

    return (
        <Modal visible={visible} transparent style={styles.modal}>
            <View style={styles.container}>
                {/* Bouton fermeture */}
                <Xbutton colour="black" size="s" text="X  " onPress={onClose} />
                <Text style={styles.maintext}>SE CONNECTER</Text>

                {/* Champ username */}
                <TextInput
                    style={styles.input}
                    placeholder="username"
                    placeholderTextColor="grey"
                    onChangeText={setUsername}
                    value={username}
                    autoCapitalize="none" // pas de majuscule automatique
                />
                {/* Champ mot de passe */}
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
                    <Text style={styles.error}>Identifiants incorrects</Text>
                )}

                {/* Bouton de connexion */}
                <Button
                    colour="pink"
                    size="m"
                    text={isLoading ? "Chargement..." : "GO"}
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
