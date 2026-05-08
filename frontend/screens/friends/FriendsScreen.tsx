import {
    StyleSheet,
    Text,
    View,
    TextInput,
    FlatList,
    Image,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { UserState, addFriend, removeFriend } from "../../reducers/user";
import { BACKENDADRESS } from "../../config";
import Header from "../headers/Header";
import { User } from "../../types/user";
import { useGetFriends } from "../../hooks/useGetFriends";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import { AntDesign } from "@expo/vector-icons";
import { useGetInvitations } from "../../hooks/useGetInvitations";

type UserScreenProps = {
    navigation: NavigationProp<ParamListBase>;
};

export default function FriendsScreen({ navigation }: UserScreenProps) {
    const dispatch = useDispatch();
    const user = useSelector((state: { user: UserState }) => state.user.value);
    const { invitations, setInvitations } = useGetInvitations();

    const { friends, isLoading, error, refetch } = useGetFriends();

    const [searchUsername, setSearchUsername] = useState<string>("");
    const [searchResult, setSearchResult] = useState<User | null>(null);
    const [isAlreadyFriend, setIsAlreadyFriend] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [loadingFriendId, setLoadingFriendId] = useState<string | null>(null);

    const handleSearch = async () => {
        if (!searchUsername.trim()) return;

        setSearchResult(null);
        setSearchError(null);
        setIsSearching(true);

        try {
            const response = await fetch(
                BACKENDADRESS + "/users/search/" + searchUsername.trim(),
                { headers: { Authorization: `Bearer ${user.token}` } },
            );
            if (!response.ok) {
                setSearchError("Aucun utilisateur trouvé");
                return;
            }
            const data = await response.json();
            if (!data.result) {
                setSearchError("Aucun utilisateur trouvé");
                return;
            }
            setSearchResult(data.user);
            setIsAlreadyFriend(data.isAlreadyFriend);
        } catch (error) {
            setSearchError("Erreur réseau");
            console.error("Search error:", error);
        } finally {
            setIsSearching(false);
        }
    };

    const handlesendFriend = async (friend: User) => {
        setLoadingFriendId(friend._id);
        try {
            const response = await fetch(BACKENDADRESS + "/invitations/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`,
                },
                body: JSON.stringify({ receiverId: friend._id }),
            });
            const data = await response.json();
            if (!response.ok) {
                // Gestion des cas spécifiques
                if (data.error === "Invitation already exists") {
                    Alert.alert("Info", "Une invitation a déjà été envoyée");
                } else if (data.error === "Already friends") {
                    Alert.alert("Info", "Vous êtes déjà amis");
                } else {
                    Alert.alert("Erreur", data.error);
                }
                return;
            }

            // Invitation envoyée
            Alert.alert(
                "Invitation envoyée ! 🎉",
                `${friend.username} recevra ta demande d'ami`,
            );
            setSearchResult(null);
            setSearchUsername("");
            refetch();
        } catch (error) {
            Alert.alert("Erreur", "Erreur réseau");
            console.error("Add friend error:", error);
        } finally {
            setLoadingFriendId(null);
        }
    };

    // Accepter ou refuser une invitation
    const handleRespond = async (
        invitationId: string,
        accept: boolean,
        sender: User,
    ) => {
        try {
            const response = await fetch(
                BACKENDADRESS + `/invitations/respond/${invitationId}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${user.token}`,
                    },
                    body: JSON.stringify({ accept }),
                },
            );

            const data = await response.json();
            if (data.result) {
                // Retire l'invitation de la liste localement
                setInvitations((prev) =>
                    prev.filter((inv) => inv._id !== invitationId),
                );

                if (accept) {
                    // Met à jour Redux avec le nouvel ami
                    dispatch(addFriend(sender._id));
                    Alert.alert(
                        "Succès",
                        `${sender.username} est maintenant votre ami ! 🎉`,
                    );
                }
            }
        } catch (error) {
            Alert.alert("Erreur", "Erreur réseau");
        }
    };

    const handleRemoveFriend = async (friend: User) => {
        Alert.alert(
            "Supprimer un ami",
            `Retirer ${friend.username} de vos amis ?`,
            [
                { text: "Annuler", style: "cancel" },
                {
                    text: "Supprimer",
                    style: "destructive",
                    onPress: async () => {
                        setLoadingFriendId(friend._id);
                        try {
                            const response = await fetch(
                                BACKENDADRESS + "/users/update",
                                {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                        Authorization: `Bearer ${user.token}`,
                                    },
                                    body: JSON.stringify({
                                        friendId: friend._id,
                                        remove: true,
                                    }),
                                },
                            );
                            const data = await response.json();
                            if (!response.ok) {
                                Alert.alert(
                                    "Erreur",
                                    data.error || "Impossible de supprimer",
                                );
                                return;
                            }
                            dispatch(removeFriend(friend._id));
                            refetch();
                        } catch (error) {
                            Alert.alert("Erreur", "Erreur réseau");
                            console.error("Remove friend error:", error);
                        } finally {
                            setLoadingFriendId(null);
                        }
                    },
                },
            ],
        );
    };

    return (
        <View style={styles.screen}>
            <View style={styles.header}>
                <Header destination={"Events"} goBack={false} />
            </View>

            <View style={styles.container}>
                {/* SECTION RECHERCHE */}
                <View style={styles.section}>
                    <Text style={styles.title}>Rechercher une personne :</Text>
                    <View style={styles.searchRow}>
                        <TextInput
                            style={styles.input}
                            placeholder="Nom d'utilisateur ..."
                            placeholderTextColor="grey"
                            onChangeText={(value) => {
                                setSearchUsername(value);
                                setSearchResult(null);
                                setSearchError(null);
                            }}
                            value={searchUsername}
                            autoCapitalize="none"
                            onSubmitEditing={handleSearch}
                        />
                        <TouchableOpacity
                            style={styles.searchBtn}
                            onPress={handleSearch}
                        >
                            {isSearching ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <AntDesign
                                    name="search"
                                    size={24}
                                    color="white"
                                />
                            )}
                        </TouchableOpacity>
                    </View>
                    {searchError && (
                        <Text style={styles.error}>{searchError}</Text>
                    )}
                </View>

                {/* Résultat de la recherche */}
                {searchResult && (
                    <View style={styles.searchResult}>
                        {searchResult.userPhoto ? (
                            <Image
                                style={styles.userPhoto}
                                source={{ uri: searchResult.userPhoto }}
                            />
                        ) : (
                            <EvilIcons
                                style={styles.userIcon}
                                name="user"
                                size={60}
                                color="white"
                            />
                        )}
                        <Text style={styles.friendName}>
                            {searchResult.username}
                        </Text>
                        {isAlreadyFriend ? (
                            <Text style={styles.alreadyFriend}>Déjà ami ✓</Text>
                        ) : (
                            <TouchableOpacity
                                style={styles.addBtn}
                                onPress={() => handlesendFriend(searchResult)}
                            >
                                {loadingFriendId === searchResult._id ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <AntDesign
                                        name="plus-circle"
                                        size={24}
                                        color="white"
                                    />
                                )}
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                {/* SECTION LISTE D'AMIS */}
                <View style={styles.section}>
                    <Text style={styles.title}>
                        Mes amis ({friends.length})
                    </Text>
                    <FlatList
                        style={styles.listPosition}
                        data={friends}
                        keyExtractor={(item) => item._id}
                        ListEmptyComponent={
                            <Text style={styles.emptyText}>
                                Aucun ami pour le moment.{"\n"}
                                Recherche un utilisateur ci-dessus !
                            </Text>
                        }
                        renderItem={({ item }) => (
                            <View style={styles.infosBox}>
                                <Text style={styles.texte}>
                                    {item.username}
                                </Text>
                                <TouchableOpacity
                                    onPress={() => handleRemoveFriend(item)}
                                >
                                    {loadingFriendId === item._id ? (
                                        <ActivityIndicator color="red" />
                                    ) : (
                                        <AntDesign
                                            name="delete"
                                            size={22}
                                            color="red"
                                        />
                                    )}
                                </TouchableOpacity>
                            </View>
                        )}
                    />
                </View>

                {/* SECTION INVITATIONS */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        🔔 Invitations reçues ({invitations.length})
                    </Text>
                    {invitations.length === 0 ? (
                        <Text style={styles.emptyText}>
                            Aucune invitation en attente
                        </Text>
                    ) : (
                        invitations.map((inv) => (
                            <View key={inv._id} style={styles.invitationItem}>
                                {/* Photo expéditeur */}
                                {inv.senderId.userPhoto ? (
                                    <Image
                                        style={styles.userPhoto}
                                        source={{ uri: inv.senderId.userPhoto }}
                                    />
                                ) : (
                                    <View style={styles.photoPlaceholder}>
                                        <Text style={styles.photoInitial}>
                                            {inv.senderId.username
                                                .charAt(0)
                                                .toUpperCase()}
                                        </Text>
                                    </View>
                                )}
                                <Text style={styles.friendName}>
                                    {inv.senderId.username}
                                </Text>

                                {/* Boutons accepter / refuser */}
                                <View style={styles.invitationBtns}>
                                    <TouchableOpacity
                                        style={styles.acceptBtn}
                                        onPress={() =>
                                            handleRespond(
                                                inv._id,
                                                true,
                                                inv.senderId,
                                            )
                                        }
                                    >
                                        <AntDesign
                                            name="check"
                                            size={20}
                                            color="white"
                                        />
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.refuseBtn}
                                        onPress={() =>
                                            handleRespond(
                                                inv._id,
                                                false,
                                                inv.senderId,
                                            )
                                        }
                                    >
                                        <AntDesign
                                            name="close"
                                            size={20}
                                            color="white"
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    )}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "#1b1b1b",
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
        paddingHorizontal: 10,
    },
    section: {
        marginBottom: 15,
        paddingTop: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 10,
        color: "white",
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "grey",
        textAlign: "center",
    },
    searchRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    searchBtn: {
        backgroundColor: "#323232",
        padding: 12,
        borderRadius: 17,
        borderWidth: 1,
        borderColor: "white",
        marginLeft: 8,
    },
    searchResult: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#2a2a2a",
        padding: 10,
        borderRadius: 15,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "white",
    },
    userIcon: {
        marginRight: 10,
    },
    userPhoto: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "white",
        marginRight: 10,
    },
    friendName: {
        flex: 1,
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
    },
    alreadyFriend: {
        color: "#92ff2d",
        fontSize: 14,
    },
    addBtn: {
        backgroundColor: "#323232",
        padding: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "white",
    },
    listPosition: {
        width: "100%",
        maxHeight: 250,
    },
    infosBox: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 5,
        borderBottomWidth: 1,
        borderBottomColor: "#333",
    },
    texte: {
        fontSize: 18,
        fontWeight: "bold",
        color: "white",
    },
    emptyText: {
        color: "grey",
        textAlign: "center",
        marginTop: 20,
        fontSize: 15,
        lineHeight: 22,
    },
    input: {
        flex: 1,
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "left",
        height: 50,
        marginRight: 8,
        borderWidth: 1,
        padding: 10,
        backgroundColor: "#323232",
        color: "white",
        borderColor: "white",
        borderRadius: 17,
    },
    error: {
        marginTop: 10,
        fontSize: 15,
        color: "red",
        textAlign: "center",
    },

    invitationItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#2a2a2a",
        padding: 10,
        marginBottom: 8,
        borderRadius: 12,
        borderWidth: 0.5,
        borderColor: "#2196F3", //  bordure bleue pour distinguer des amis
    },
    invitationBtns: {
        flexDirection: "row",
        gap: 8,
        marginLeft: "auto",
    },
    acceptBtn: {
        backgroundColor: "#4CAF50",
        padding: 8,
        borderRadius: 10,
    },
    refuseBtn: {
        backgroundColor: "#F44336",
        padding: 8,
        borderRadius: 10,
    },
});
