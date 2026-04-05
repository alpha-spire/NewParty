import {
    StyleSheet,
    Text,
    View,
    TextInput,
    FlatList,
    Image,
    Button,
} from "react-native";
import React, { useEffect } from "react";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import { AddButton } from "../../ui/addButton";
import { DeleteButton } from "../../ui/deleteButton";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { UserState, addFriend, removeFriend } from "../../reducers/user";
import { BACKENDADRESS } from "../../config";
import Header from "../headers/Header";
import { User } from "../../types/user";

type UserScreenProps = {
    navigation: NavigationProp<ParamListBase>;
};

export default function FriendsScreen({ navigation }: UserScreenProps) {
    const dispatch = useDispatch();
    const [newFriendName, setNewFriendName] = useState<string>("");
    const [oldFriendName, setOldFriendName] = useState<string>("");
    const [users, setUsers] = useState<User[]>([]);
    const [friendsList, setFriendsList] = useState<User[]>([]);
    const [addError, setAddError] = useState<string | null>(null);
    const [removeError, setRemoveError] = useState<string | null>(null);

    const user = useSelector((state: { user: UserState }) => state.user.value);

    useEffect(() => {
        const fetchUsersList = async () => {
            try {
                const response = await fetch(BACKENDADRESS + "/users");
                const data = await response.json();
                setUsers(data.users);
            } catch (error) {
                console.error("Erreur de récupération des users", error);
            }
        };
        fetchUsersList();
    }, []);

    const handleAddFriend = async () => {
        if (!newFriendName) return;
        setAddError(null);

        const friend = users.find((user) => user.username === newFriendName);

        if (!friend) {
            setAddError("Cet utilisateur n'existe pas.");
            return;
        }

        if (friendsList.includes(friend)) {
            setAddError("Cet utilisateur est déjà dans votre liste d'amis.");
            return;
        }

        try {
            const response = await fetch(BACKENDADRESS + "/users/update", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`,
                },
                body: JSON.stringify({ friendId: friend._id }),
            });
            if (!response.ok) {
                throw new Error(`Erreur serveur : ${response.status}`);
            }
            setFriendsList([...friendsList, friend]);
            dispatch(addFriend(friend._id));
            setNewFriendName("");
        } catch (error) {
            setAddError("Une erreur est survenue lors de l'ajout.");
            console.error("Erreur ajout ami", error);
        }
    };

    const handleRemoveFriend = async () => {
        if (!oldFriendName) {
            return;
        }

        const friend = users.find((user) => user.username === oldFriendName);

        if (!friend) {
            setRemoveError("Cet utilisateur n'existe pas.");
            return;
        }

        if (!friendsList.includes(friend)) {
            setRemoveError(
                "Cet utilisateur n'est pas dans votre liste d'amis.",
            );
            return;
        }
        try {
            const response = await fetch(BACKENDADRESS + "/users/update", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`,
                },
                body: JSON.stringify({
                    friendId: friend._id,
                    remove: true,
                }),
            });
            if (!response.ok) {
                throw new Error(`Erreur serveur : ${response.status}`);
            }
            setFriendsList(friendsList.filter((e) => e._id !== friend._id));

            dispatch(removeFriend(friend._id));

            setOldFriendName("");
        } catch (error) {
            setRemoveError("Une erreur est survenue lors de la suppression.");
            console.error("Erreur suppression ami", error);
        }
    };

    return (
        <View style={styles.screen}>
            <View style={styles.header}>
                <Header destination={"Events"} goBack={false} />
            </View>
            <View style={styles.container}>
                <Text style={styles.title}>Ma liste d'amis : </Text>
                <FlatList
                    style={styles.listPosition}
                    data={friendsList}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => (
                        <View style={styles.infosBox}>
                            <Text style={styles.texte}>{item.username}</Text>
                        </View>
                    )}
                />
                <Text style={styles.title}>Liste des utilisateurs : </Text>
                <FlatList
                    style={styles.listPosition}
                    data={users}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => (
                        <View style={styles.infosBox}>
                            <Text style={styles.texte}>{item.username}</Text>
                            <Image
                                style={styles.userPhoto}
                                source={{ uri: item.userPhoto }}
                            />
                        </View>
                    )}
                />
                <Text style={styles.title}>Ajoute un ami </Text>
                <View style={styles.formBlock}>
                    <TextInput
                        style={styles.input}
                        placeholder="Nom de ton futur ami ..."
                        placeholderTextColor="grey"
                        onChangeText={(value) => {
                            (setNewFriendName(value), setAddError(null));
                        }}
                        value={newFriendName}
                    />
                    {addError && <Text style={styles.error}>{addError}</Text>}
                    <Button title="+" onPress={handleAddFriend} />
                </View>
                <Text style={styles.title}>Supprime un ami </Text>
                <View style={styles.formBlock}>
                    <TextInput
                        style={styles.input}
                        placeholder="Nom de ton ancien ami ..."
                        placeholderTextColor="grey"
                        onChangeText={(value) => {
                            (setOldFriendName(value), setRemoveError(null));
                        }}
                        value={oldFriendName}
                    />
                    {removeError && (
                        <Text style={styles.error}>{removeError}</Text>
                    )}
                    <Button title="-" onPress={handleRemoveFriend} />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "#fff",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#000",
        maxHeight: 155,
        width: "100%",
    },
    container: {
        flex: 1,
    },
    title: {
        fontSize: 25,
        fontWeight: "bold",
        textAlign: "center",
        marginTop: 10,
        marginBottom: 10,
    },
    listPosition: {
        width: "100%",
        maxHeight: 100, // Borne la FlatList pour éviter le chevauchement
    },
    infosBox: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    userPhoto: {
        width: 30,
        height: 30,
        borderWidth: 2,
        borderRadius: 25,
        borderColor: "white",
    },
    texte: {
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "left",
    },
    formBlock: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 10,
    },
    input: {
        flex: 1,
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
        height: 50,
        marginRight: 10,
        borderWidth: 1,
        padding: 10,
        backgroundColor: "#323232",
        color: "grey",
        borderColor: "white",
        borderRadius: 17,
    },
    error: {
        marginTop: 10,
        fontSize: 15,
        color: "red",
        textAlign: "center",
    },
});
