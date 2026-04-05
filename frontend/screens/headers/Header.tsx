import { StyleSheet, View, Image, TouchableOpacity } from "react-native";
import React from "react";
import { useNavigation } from "@react-navigation/native";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useSelector } from "react-redux";
import { UserState } from "../../reducers/user";

export default function Header({
  destination,
  goBack,
}: {
  destination?: string;
  goBack: boolean;
}) {
  const navigation = useNavigation<any>();

  const user = useSelector((state: { user: UserState }) => state.user.value);

  const handleGoBack = () => {
    navigation.navigate(destination);
  };

  const handleGoProfile = () => {
    navigation.navigate("FocusOnProfil");
  };

  return (
    <View style={styles.header}>
      {(goBack && (
        <FontAwesome6
          style={styles.arrow}
          name="arrow-left"
          size={35}
          color="white"
          onPress={handleGoBack}
        />
      )) || <View style={styles.noArrow}></View>}
      <Image
        source={require("../../assets/Party Logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <TouchableOpacity
        style={{ width: 70, height: 70 }}
        onPress={handleGoProfile}
      >
        {user.userPhoto ? (
          <Image style={styles.updPhoto} source={{ uri: user.userPhoto }} />
        ) : (
          <EvilIcons
            style={styles.userIcon}
            name="user"
            size={60}
            color="white"
            onPress={handleGoProfile}
          />
        )}
      </TouchableOpacity>
      <Ionicons
        style={styles.notifIcon}
        name="notifications-outline"
        size={45}
        color="white"
      />
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
  title: {
    fontSize: 40,
    fontWeight: "bold",
    textAlign: "center",
    color: "#fff",
  },
  logo: {
    width: 75,
    height: 75,
  },
  username: {
    color: "white",
    marginTop: 50,
    fontSize: 11,
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
  notifIcon: {},
  arrow: { width: "37%" },
  noArrow: {
    width: "36%",
    height: 60,
  },
});
