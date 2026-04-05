import {
    StyleSheet,
    Text,
    View,
    Image,
    TextInput,
    TouchableOpacity,
} from "react-native";
import React from "react";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import Header from "../headers/Header";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login, logout, UserState } from "../../reducers/user";
import { Fontisto } from "@expo/vector-icons";
import PhotoModal from "../events/PhotoModal";
import { BACKENDADRESS } from "../../config";
import { Button } from "../../ui/button";
import { EditButton } from "../../ui/editButton";
import { DeleteButton } from "../../ui/deleteButton";
import DeleteAccountModal from "./DeleteAccountModal";
import { User } from "../../types/user";

type UserScreenProps = {
    navigation: NavigationProp<ParamListBase>;
};

const EMAIL_REGEX: RegExp = /^\S+@\S+\.\S+$/;
//    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
//    /^[^\s@]+@[^\s@]+\.[^\s@]+$/
//    /^\S+@\S+\.\S+$/

export default function ProfileOnFocusScreen({ navigation }: UserScreenProps) {
    const dispatch = useDispatch();

    const user = useSelector((state: { user: UserState }) => state.user.value);

    const [photo, setPhoto] = useState<string>("");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [passwordError, setPasswordError] = useState(false);
    const [missingError, setMissingError] = useState(false);
    const [emailError, setEmailError] = useState(false);
    const [usernameError, setUsernameError] = useState(false);
    const [isPhotoModalOpened, setIsPhotoModalOpened] = useState(false);
    const [text, onChangeText] = React.useState("Useless Text");
    const [isDeleteModalOpened, setIsDeleteModalOpened] = useState(false);

    const updateReduxUser = (data: User, token: string) => {
        dispatch(
            login({
                email: data.email,
                username: data.username,
                token: token,
                userPhoto: data.userPhoto,
            }),
        );
    };

    const handleAddPhoto = async (imageURI: string) => {
        const formData = new FormData();
        //@ts-expect-error
        formData.append("photoFromFront", {
            uri: imageURI,
            name: "photo.jpg",
            type: "image/jpeg",
        });
        const res = await fetch(BACKENDADRESS + "/upload", {
            method: "POST",
            body: formData,
        });
        const data = await res.json();
        if (data) {
            const url = data.photo.url;
            setPhoto(url);

            fetch(BACKENDADRESS + "/users/update", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`,
                },
                body: JSON.stringify({
                    userPhoto: url,
                }),
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.token) {
                        updateReduxUser(data.user, data.token);
                    }
                })
                .catch(console.error);
        }
        setPhoto("");
    };

    const handleModifiedUsername = () => {
        if (!username) {
            setUsernameError(true);
            return;
        } else {
            fetch(BACKENDADRESS + "/users/update", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`,  //url sécurisé sans token qui est placé dans le header.Authorization
                },
                body: JSON.stringify({
                    username,
                }),
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.token) {
                        updateReduxUser(data.user, data.token);
                    }
                })
                .catch(console.error);
            setUsername("");
            setUsernameError(false);
        }
    };

    const handleModifiedEmail = () => {
        if (!email || !EMAIL_REGEX.test(email)) {
            setEmailError(true);
            return;
        } else {
            fetch(BACKENDADRESS + "/users/update", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`,
                },
                body: JSON.stringify({
                    email,
                }),
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.token) {
                        updateReduxUser(data.user, data.token);
                    }
                })
                .catch(console.error);
            setEmail("");
            setEmailError(false);
        }
    };

    const handleModifiedPassword = () => {
        if (!oldPassword || !newPassword) {
            setMissingError(true);
            return;
        } else {
            fetch(BACKENDADRESS + "/users/update", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`,
                },
                body: JSON.stringify({
                    oldPassword,
                    newPassword,
                }),
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.error === "Wrong password") {
                        setPasswordError(true);
                        setOldPassword("");
                    }
                    if (data.user) {
                        updateReduxUser(data.user, data.token);
                    }
                })

                .catch(console.error);
        }
        setOldPassword("");
        setNewPassword("");
        setMissingError(false);
        setPasswordError(false);
    };

    const deconnected = () => {
        dispatch(logout());
        navigation.navigate("Home");
    };

    return (
        <View>
            <View style={styles.header}>
                <Header destination={"Chat"} goBack={true} />
            </View>
            <View style={styles.container}>
                <View style={styles.underHeader}>
                    <PhotoModal
                        onClose={() => setIsPhotoModalOpened(false)}
                        visible={isPhotoModalOpened}
                        addPhoto={handleAddPhoto}
                    />
                    <View style={styles.user}>
                        {user.userPhoto ? (
                            <TouchableOpacity
                                onPress={() => setIsPhotoModalOpened(true)}
                            >
                                <Image
                                    style={styles.updPhoto}
                                    source={{ uri: user.userPhoto }}
                                />
                            </TouchableOpacity>
                        ) : (
                            <Fontisto
                                style={styles.photos}
                                name="photograph"
                                size={60}
                                color={"white"}
                                onPress={() => setIsPhotoModalOpened(true)}
                            />
                        )}
                        <View style={styles.usernamePlusEmail}>
                            <Text style={styles.title}>{user.username}</Text>
                            <Text style={styles.title}>{user.email}</Text>
                        </View>
                    </View>
                </View>
                <View>
                    <Text style={styles.title}>Connexion et sécurité</Text>
                    <View style={styles.modified}>
                        <View style={styles.champ}>
                            <Text style={styles.title}>Username</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Nouveau username..."
                                placeholderTextColor="grey"
                                onChangeText={(value) => setUsername(value)}
                                value={username}
                            />
                            {usernameError && (
                                <Text style={styles.error}>
                                    Missing or empty fields
                                </Text>
                            )}

                            <Text style={styles.title}>Email</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Nouveau mail..."
                                placeholderTextColor="grey"
                                onChangeText={(value) => setEmail(value)}
                                value={email}
                            />
                            {emailError && (
                                <Text style={styles.error}>
                                    Invalid email address
                                </Text>
                            )}
                        </View>
                        <EditButton
                            size="g"
                            text="Modifier"
                            onPress={handleModifiedUsername}
                        />
                        <EditButton
                            size="k"
                            text="Modifier"
                            onPress={handleModifiedEmail}
                        />
                    </View>
                    <View style={styles.modified}>
                        <View style={styles.champ}>
                            <Text style={styles.title}>
                                Ancien mot de passe
                            </Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ancien mot de passe..."
                                secureTextEntry
                                placeholderTextColor="grey"
                                onChangeText={(value) => setOldPassword(value)}
                                value={oldPassword}
                            />
                            <Text style={styles.title}>
                                Nouveau mot de passe
                            </Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Nouveau mot de passe..."
                                secureTextEntry
                                placeholderTextColor="grey"
                                onChangeText={(value) => setNewPassword(value)}
                                value={newPassword}
                            />
                            {missingError && (
                                <Text style={styles.error}>
                                    Missing or empty fields
                                </Text>
                            )}
                            {passwordError && (
                                <Text style={styles.error}>
                                    wrong password !
                                </Text>
                            )}
                        </View>
                        <EditButton
                            size="m"
                            text="Modifier"
                            onPress={handleModifiedPassword}
                        />
                    </View>
                </View>
                <View style={styles.footer}>
                    <Button
                        colour="red"
                        size="s"
                        text="Deconnection"
                        onPress={deconnected}
                    />
                    <DeleteButton
                        size="m"
                        text=""
                        onPress={() => setIsDeleteModalOpened(true)}
                    />
                </View>
            </View>
            <DeleteAccountModal
                onClose={() => setIsDeleteModalOpened(false)}
                visible={isDeleteModalOpened}
                navigation={navigation}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        backgroundColor: "#151515",
        height: 900,
    },
    user: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#000",
        maxHeight: 125,
        width: "100%",
    },
    underHeader: {
        padding: 10,
        paddingTop: 20,
        alignItems: "flex-start",
        flexDirection: "row",
        backgroundColor: "#1b1b1b",
        height: 150,
        width: "100%",
        borderBottomWidth: 0.2,
        borderColor: "white",
    },
    usernamePlusEmail: {
        flexDirection: "column",
        alignItems: "flex-start",
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
        color: "white",
        padding: 10,
    },
    photos: {
        backgroundColor: "#323232",
        width: 100,
        height: 100,
        borderWidth: 2,
        borderRadius: 25,
        borderColor: "white",
        marginLeft: 10,
        marginRight: 10,
        padding: 15,
    },
    updPhoto: {
        width: 100,
        height: 100,
        borderWidth: 2,
        borderRadius: 25,
        borderColor: "white",
        marginLeft: 10,
        marginRight: 10,
    },
    input: {
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "left",
        height: 40,
        borderWidth: 1,
        padding: 10,
        backgroundColor: "#323232",
        color: "grey",
        borderColor: "grey",
        borderRadius: 17,
        width: "80%",
    },
    error: {
        marginTop: 10,
        color: "red",
    },
    modified: {
        width: "100%",
        maxWidth: "100%",
        borderBottomColor: "white",
        flexDirection: "row",
        backgroundColor: "#151515",
        borderWidth: 0.2,
        height: 200,
        padding: 30,
    },
    champ: {
        width: "100%",
        flexDirection: "column",
        justifyContent: "flex-end",
        alignItems: "flex-start",
    },
    footer: {
        flexDirection: "column",
    },
});
