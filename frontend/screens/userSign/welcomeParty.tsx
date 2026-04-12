import { View, Text, ImageBackground, StyleSheet, Image } from "react-native";
import { useEvent } from "expo";
import { useVideoPlayer, VideoView } from "expo-video";
import { Button } from "../../ui/button";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import { useState } from "react";
import SignUpModal from "./signUpModal";
import SignInModal from "./signInModal";
import { SafeAreaView } from "react-native-safe-area-context";
//video d'arrière plan, assetId pour expo-video
const assetId = require("../../assets/Gradient Background Loop 1.mp4");

//type pour les props navigation pour la navigation entre les écrans, nécessaire pour les modals
// de connexion et d'inscription
type WelcomePartyProps = {
    navigation: NavigationProp<ParamListBase>;
};

export default function WelcomeParty({ navigation }: WelcomePartyProps) {
    //états pour gérer l'ouverture des modals de connexion et d'inscription
    const [isSignUpModalOpened, setIsSignUpModalOpened] = useState(false);
    const [isSignInModalOpened, setIsSignInModalOpened] = useState(false);

    //initialisation du lecteur vidéo avec les paramètres souhaités : boucle, muet et lecture automatique
    const player = useVideoPlayer(assetId, (player) => {
        player.loop = true;
        player.muted = true; //muet par défaut, meilleure UX sur un écran d'accueil
        player.play();
    });
    //écoute de l'événement de changement d'état de lecture pour mettre à jour l'état isPlaying, ce qui peut être utilisé pour des fonctionnalités supplémentaires si nécessaire
    const { isPlaying } = useEvent(player, "playingChange", {
        isPlaying: player.playing,
    });

    return (
        <ImageBackground style={styles.background}>
            <VideoView
                style={styles.video}
                player={player}
                nativeControls={false} //désactive les contrôles natifs du lecteur vidéo pour une expérience plus immersive sur l'écran d'accueil
            />
            <SafeAreaView style={styles.safeArea}>
                {/* Section logo */}
                <View style={styles.logoContainer}>
                    <Image
                        source={require("../../assets/Party Logo.png")}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Image
                        source={require("../../assets/PARTY TITLE.png")}
                        style={styles.title}
                        resizeMode="contain"
                    />
                </View>

                {/* Section boutons */}
                <View style={styles.buttonsContainer}>
                    <Button
                        text="Se connecter"
                        size="m"
                        colour="black"
                        onPress={() => setIsSignInModalOpened(true)}
                    />
                    <Text style={styles.orText}>Pas encore inscrit?</Text>
                    <Button
                        text="S'inscrire"
                        size="m"
                        colour="black"
                        onPress={() => setIsSignUpModalOpened(true)}
                    />

                    {/* Modal inscription */}
                    <SignUpModal
                        onClose={() => setIsSignUpModalOpened(false)}
                        visible={isSignUpModalOpened}
                    />
                    <SignInModal
                        onClose={() => setIsSignInModalOpened(false)}
                        visible={isSignInModalOpened}
                    />
                </View>
            </SafeAreaView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        width: "100%",
        height: "100%",
    },
    safeArea: {
        flex: 1, // occupe tout l'espace disponible
    },
    logoContainer: {
        alignItems: "center",
        marginTop: 40,
    },
    logo: {
        width: 200,
        height: 200,
    },
    title: {
        marginRight: 145,
        height: 100,
        width: 150,
    },
    buttonsContainer: {
        padding: 15,
        marginTop: 60,
    },
    orText: {
        color: "black",
        fontSize: 15,
        textAlign: "center",
        marginVertical: 8,
    },
    video: {
        position: "absolute",
        left: -200,
        width: "390%",
        height: "100%",
    },
});
