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
    Button,
} from "react-native";
import React, { useEffect } from "react";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { UserState, addFriend, removeFriend } from "../../reducers/user";
import { BACKENDADRESS } from "../../config";
import Header from "../headers/Header";
import { User } from "../../types/user";
import { useGetFriends } from "../../hooks/useGetFriends";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import { AntDesign } from "@expo/vector-icons";


type UserScreenProps = {
    navigation: NavigationProp<ParamListBase>;
};

export default function FriendsScreen({ navigation }: UserScreenProps) {
    const dispatch = useDispatch();
    const user = useSelector((state: { user: UserState }) => state.user.value);

    // Hook — charge la liste d'amis depuis le backend
    const { friends, isLoading, error } = useGetFriends();

    const [searchUsername, setSearchUsername] = useState<string>("");
    const [searchResult, setSearchResult] = useState<User | null>(null);

    const [isAlreadyFriend, setIsAlreadyFriend] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);

    // État de chargement pour add/remove
    const [loadingFriendId, setLoadingFriendId] = useState<string | null>(null);

    // Recherche un user par username exact
    const handleSearch = async () => {
        if (!searchUsername.trim()) return;

        try {
            const response = await fetch(
                BACKENDADRESS + "/users/search/" + `${searchUsername.trim()}`,
                {
                    headers: { Authorization: `Bearer ${user.token}` },
                },
            );
            if (!response.ok) {
                console.error("Erreur fetch search friends:", response.status);
                return;
            }

            const data = await response.json();
            if (!data.result) {
                setSearchError("Aucun utilisateur trouvé");
                return;
            }
            setSearchResult(data.user);
            setIsAlreadyFriend(data.isAlreadyFriend); // backend indique si déjà ami
        } catch (error) {
            setSearchError("Erreur réseau");
            console.error("Search error:", error);
        } finally {
            setIsSearching(false);
        }
    };

    //Ajoute un ami dans la liste des amis
    const handleAddFriend = async (friend : User) => {
        setLoadingFriendId(friend._id);

        try {
            const response = await fetch(BACKENDADRESS + "/users/update", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`,
                },
                body: JSON.stringify({ friendId: friend._id }),
            });
            
            const data = await response.json()
            if (!response.ok) {
                Alert.alert("Erreur", data.error || "Impossible d'ajouter l'ami");
                return;
            }

            dispatch(addFriend(friend._id));
         setSearchResult(null);  //  reset la recherche
        setSearchUsername("");
         Alert.alert("Succès", `${friend.username} ajouté à vos amis !`);
        } catch (error) {
            Alert.alert("Erreur", "Erreur réseau");
            console.error("Add friend error:", error);
        }
    };

    //Supprime un ami avec confirmation
    const handleRemoveFriend = async (friend : User) => {
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
                                        remove: true, // flag pour indiquer une suppression
                                    }),
                                }
                            );

                            const data = await response.json();

                            if (!response.ok) {
                                Alert.alert("Erreur", data.error || "Impossible de supprimer");
                                return;
                            }

                            dispatch(removeFriend(friend._id));
                        } catch (error) {
                            Alert.alert("Erreur", "Erreur réseau");
                            console.error("Remove friend error:", error);
                        } finally {
                            setLoadingFriendId(null);
                    }
                }
            }
            ]
        );
    };



    return (
        <View style={styles.screen}>
            {/* Header */}
            <View style={styles.header}>
                <Header destination={"Events"} goBack={false} />
            </View>

            <View style={styles.container}>

                {/* ── SECTION RECHERCHE ── */}
                <View style={styles.section}>
                    <Text style={styles.title}>Rechercher une personne :</Text>
                    <View style={styles.searchRow}>

                        <TextInput
                            style={styles.input}
                            placeholder="Nom d'utilisateur ..."
                            placeholderTextColor="grey"
                            onChangeText={(value) => {
                                setSearchUsername(value),
                                setSearchResult(null);  // reset résultat si on retape
                                setSearchError(null);
                            }}
                            value={searchUsername}
                            autoCapitalize="none"
                                //  Lance la recherche quand on valide le clavier
                                onSubmitEditing={handleSearch}
                        />
                        <TouchableOpacity
                                style={styles.searchBtn}
                                onPress={handleSearch}
                            >
                                {isSearching ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <AntDesign name="search1" size={24} color="white" />
                                )}
                            </TouchableOpacity>

                    </View>

                    {/* Erreur de recherche */}
                    {searchError && <Text style={styles.error}>{searchError}</Text>}

                </View>

                    {/* Résultat de la recherche */}
                    {searchResult && (
                        <View style={styles.searchResult}>
                            {searchResult.userPhoto ? (
                                <Image
                                    style={styles.userPhoto}
                                    source={{ uri: searchResult.userPhoto }}
                                />
                            ) : (<EvilIcons
                                    style={styles.userIcon}
                                    name="user"
                                    size={60}
                                    color="white"
                                    />
                            )}

                            <Text style={styles.friendName}>{searchResult.username}</Text>

                            {/* Bouton désactivé si déjà ami */}
                            {isAlreadyFriend ? (
                                <Text style={styles.alreadyFriend}>Déjà ami ✓</Text>
                            ) : (
                                <TouchableOpacity
                                    style={styles.addBtn}
                                    onPress={() => handleAddFriend(searchResult)}
                                >
                                    {loadingFriendId === searchResult._id ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <AntDesign name="adduser" size={24} color="white" />
                                    )}
                                </TouchableOpacity>
                            )}
                        </View>
                    )}

                    {/* ── SECTION LISTE D'AMIS ── */}
                <View style={styles.section}>
                        <Text style={styles.title}>
                            👥 Mes amis ({friends.length})
                             </Text>
                        <FlatList
                        style={styles.listPosition}
                        data={friends}
                        keyExtractor={(item) => item._id}
                        // Message si liste vide
                            ListEmptyComponent={
                                <Text style={styles.emptyText}>
                                    Aucun ami pour le moment.{"\n"}
                                    Recherche un utilisateur ci-dessus !
                                </Text>
                            }
                        renderItem={({ item }) => (
                            <View style={styles.infosBox}>
                                <Text style={styles.texte}>{item.username}</Text>
                            </View>
                        )}
                        />
                </View>

                <View>
                    {/* ── SECTION INVITATIONS (future) ── */}
                    {/* Préparée pour les notifications futures */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        🔔 Invitations reçues (0)
                    </Text>
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
