import { StyleSheet, View, Image, TouchableOpacity, Text } from "react-native";
import React from "react";
import { useNavigation } from "@react-navigation/native";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useSelector } from "react-redux";
import { UserState } from "../../reducers/user";
import { useGetInvitations } from "../../hooks/useGetInvitations";

export default function Header({
    destination,
    goBack,
}: {
    destination?: string; // écran cible pour le bouton retour
    goBack: boolean;      // affiche ou masque la flèche retour
}) {
    const navigation = useNavigation<any>();
    const user = useSelector((state: { user: UserState }) => state.user.value);

    // Récupère les invitations d'amis en attente pour le badge
    const { invitations } = useGetInvitations();

    const handleGoBack = () => {
        if (destination) navigation.navigate(destination);
        else navigation.goBack();
    };

    const handleGoProfile = () => navigation.navigate("FocusOnProfil");

    // La cloche redirige vers l'écran Friends où sont gérées les invitations
    const handleGoNotifications = () => navigation.navigate("Friends");

    return (
        <View style={styles.header}>
            {/* Flèche retour ou espace réservé pour garder le logo centré */}
            {goBack ? (
                <FontAwesome6
                    style={styles.arrow}
                    name="arrow-left"
                    size={35}
                    color="white"
                    onPress={handleGoBack}
                />
            ) : (
                <View style={styles.noArrow} />
            )}

            <Image
                source={require("../../assets/Party Logo.png")}
                style={styles.logo}
                resizeMode="contain"
            />

            {/* Avatar utilisateur — photo ou icône par défaut */}
            <TouchableOpacity style={styles.avatarBtn} onPress={handleGoProfile}>
                {user.userPhoto ? (
                    <Image
                        style={styles.updPhoto}
                        source={{ uri: user.userPhoto }}
                    />
                ) : (
                    <EvilIcons
                        style={styles.userIcon}
                        name="user"
                        size={60}
                        color="white"
                    />
                )}
            </TouchableOpacity>

            {/* Cloche avec badge rouge si invitations en attente */}
            <TouchableOpacity
                style={styles.notifBtn}
                onPress={handleGoNotifications}
            >
                <Ionicons
                    name="notifications-outline"
                    size={45}
                    color="white"
                />
                {invitations.length > 0 && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>
                            {invitations.length > 9 ? "9+" : invitations.length}
                        </Text>
                    </View>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#282828",
        height: 120,
        maxHeight: 150,
        width: "100%",
        borderBottomWidth: 0.2,
        borderColor: "white",
        paddingTop: 40,
        padding: 5,
        paddingLeft: 15,
        paddingRight: 15,
    },
    logo: {
        width: 75,
        height: 75,
    },
    avatarBtn: {
        width: 70,
        height: 70,
    },
    updPhoto: {
        width: 50,
        height: 50,
        borderWidth: 2,
        borderColor: "white",
        borderRadius: 35,
        marginTop: 10,
        marginLeft: 15,
    },
    userIcon: {
        width: 60,
        height: 60,
        marginTop: 10,
        marginLeft: 15,
    },
    // Conteneur relatif pour positionner le badge sur la cloche
    notifBtn: {
        position: "relative",
        padding: 4,
    },
    // Pastille rouge en haut à droite de la cloche
    badge: {
        position: "absolute",
        top: 0,
        right: 0,
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: "#E53935",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 3,
    },
    badgeText: {
        color: "white",
        fontSize: 11,
        fontWeight: "bold",
    },
    arrow: { width: "37%" },
    noArrow: {
        width: "36%",
        height: 60,
    },
});
