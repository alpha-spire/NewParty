import { View, Text, ImageBackground, StyleSheet, Image } from "react-native";
import { useEvent } from 'expo';
import { useVideoPlayer, VideoView } from "expo-video";
import { Button } from "../../ui/button";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import { useState } from "react";
import SignUpModal from "./signUpModal";
import SignInModal from "./signInModal";
import { SafeAreaView } from "react-native-safe-area-context";

const assetId = require('../../assets/Gradient Background Loop 1.mp4');

type UserScreenProps = {
  navigation: NavigationProp<ParamListBase>;
};

export default function UserScreen({ navigation }: UserScreenProps) {
  const [isSignUpModalOpened, setIsSignUpModalOpened] = useState(false);
  const [isSignInModalOpened, setIsSignInModalOpened] = useState(false);

  const player = useVideoPlayer(assetId, (player) => {
    player.loop = true;
    player.play();
  });

   const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });

  const handleSignup = () => {
    setIsSignUpModalOpened(true);
  };

  const handleSignIn = () => {
    setIsSignInModalOpened(true);
  };

  return (
    <ImageBackground
      // source={require("../../assets/Party Background Crop.png")}
      style={styles.background}
    >
      <VideoView
        style={styles.video}
        player={player}
        allowsPictureInPicture
      />
      <SafeAreaView>
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/Party Logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Image
            source={require("../../assets/PARTY TITLE.png")}
            style={{ marginRight: 145, height: 100, width: 150 }}
            resizeMode="contain"
          />
        </View>

        <View style={{ padding: 15, marginTop: 60 }}>
          <Button
            text="Se connecter"
            size="m"
            colour="black"
            onPress={() => handleSignIn()}
          />
          <Text style={{ color: "Black", fontSize: 15, textAlign: "center" }}>
            Pas encore inscrit?
          </Text>
          <Button
            text="S'inscrire"
            size="m"
            colour="black"
            onPress={() => handleSignup()}
          />
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
  logoContainer: {
    alignItems: "center",
    marginTop: 40,
  },
  logo: {
    width: 200,
    height: 200,
  },
  video: {
    left: -200,
    position: 'absolute',
    width: '390%',
    height: "100%",
  },
});
