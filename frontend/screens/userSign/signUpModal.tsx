import { Text, View, TextInput, StyleSheet, Modal } from "react-native";
import { useState } from "react";
import { Button } from "../../ui/button";
import { Xbutton } from "../../ui/xButton";
import { useDispatch } from "react-redux";
import { login } from "../../reducers/user";
import { useNavigation } from "@react-navigation/native";
import { BACKENDADRESS } from "../../config";

const EMAIL_REGEX: RegExp = /^\S+@\S+\.\S+$/;

type SignUpModalProps = {
    onClose: () => void;
    visible: boolean;
};

export default function SignUpModal({ onClose, visible }: SignUpModalProps) {
    const navigation = useNavigation<any>();
    const dispatch = useDispatch();

    //champs du formulaire d'inscription
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    //champs d'erreur pour la validation du formulaire
    const [passwordError, setPasswordError] = useState(false);
    const [emailError, setEmailError] = useState(false);
    const [missingError, setMissingError] = useState(false);
    const [userError, setUserError] = useState(false);

    // État de chargement pendant l'appel API
    const [isLoading, setIsLoading] = useState(false);

    // Réinitialise tous les champs du formulaire
    const resetFormulaire = () => {
        setEmail("");
        setPassword("");
        setUsername("");
        setConfirmPassword("");
    };

    const handleRegister = async () => {
        setEmailError(false);
        setMissingError(false);
        setUserError(false);
        setPasswordError(false);

        // Validations coté client avant d'envoyer la requête au backend
        if (!email || !username || !password || !confirmPassword) {
            setMissingError(true);
            return;
        }
        if (confirmPassword !== password) {
            setPasswordError(true);
            return;
        }
        if (!EMAIL_REGEX.test(email)) {
            setEmailError(true);
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(BACKENDADRESS + "/users/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    username,
                    password,
                }),
            });

            const data = await response.json();
            // Gestion des erreurs retournées par le backend
            if (data.error === "Missing or empty fields") {
                setMissingError(true);
            }
            if (data.error === "Username or email already exists") {
                setUserError(true);
            }
            //inscription réussie, on dispatch l'action de login pour mettre à jour
            //  le store avec les infos de l'utilisateur et on navigue vers l'écran
            //  principal de l'application

            if (data.result) {
                dispatch(
                    login({
                        email,
                        username,
                        token: data.token,
                        userPhoto: null, // pas de photo à l'inscription
                    }),
                );
                onClose();
                navigation.navigate("TabNavigator");
            }
        } catch (error) {
            console.error("Error during registration:", error);
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
                <Text style={styles.maintext}>S'INSCRIRE</Text>

                {/* Champ email */}
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="grey"
                    onChangeText={(value) => setEmail(value)}
                    value={email}
                    keyboardType="email-address" // clavier adapté sur mobile
                    autoCapitalize="none" // pas de majuscule automatique
                />
                {emailError && (
                    <Text style={styles.error}>Adresse email invalide</Text>
                )}

                {/* Champ username */}
                <TextInput
                    style={styles.input}
                    placeholder="Username"
                    placeholderTextColor="grey"
                    onChangeText={(value) => setUsername(value)}
                    value={username}
                    autoCapitalize="none"
                />
                {userError && (
                    <Text style={styles.error}>
                        "Username ou email déjà utilisé"
                    </Text>
                )}

                {/* Champ password */}
                <TextInput
                    style={styles.input}
                    placeholder="Mot de passe"
                    placeholderTextColor="grey"
                    secureTextEntry // masque le mot de passe
                    onChangeText={(value) => setPassword(value)}
                    value={password}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Confirmer le Mot de passe"
                    placeholderTextColor="grey"
                    secureTextEntry
                    onChangeText={(value) => setConfirmPassword(value)}
                    value={confirmPassword}
                />
                {passwordError && (
                    <Text style={styles.error}>
                        Les mots de passe ne correspondent pas
                    </Text>
                )}
                {missingError && (
                    <Text style={styles.error}>
                        Veuillez remplir tous les champs
                    </Text>
                )}

                {/* Bouton d'inscription */}
                <Button
                    colour="pink"
                    size="m"
                    text={isLoading ? "Chargement..." : "GO"}
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
