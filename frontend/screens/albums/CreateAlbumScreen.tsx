import { StyleSheet, Text, View, TextInput } from "react-native";
import React, { useState } from "react";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import Header from "../headers/Header";
import PhotoModal from "../events/PhotoModal";
import { Fontisto } from "@expo/vector-icons";

type UserScreenProps = {
  navigation: NavigationProp<ParamListBase>;
};

export default function CreateAlbumScreen({ navigation }: UserScreenProps) {
  const [title, setTitle] = useState("");
  const [isPhotoModalOpened, setIsPhotoModalOpened] = useState(false);
  const [photo, setPhoto] = useState<string>("");

  const handleAddPhoto = (imageURI: string) => {
    const formData = new FormData();
    //@ts-expect-error
    formData.append("photoFromFront", {
      uri: imageURI,
      name: "photo.jpg",
      type: "image/jpeg",
    });
    fetch("http://192.168.1.160:3000/upload", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        setPhoto(data.photo.url);
      });
  };

  return (
    <View>
      <View style={styles.header}>
        <Header goBack={true} destination="Album" />
      </View>
      <View style={styles.container}>
        <View>
          <Text style={styles.title}>Création d'un album</Text>
          <TextInput
            style={styles.input}
            placeholder="titre..."
            placeholderTextColor="grey"
            onChangeText={(value) => setTitle(value)}
            value={title}
          />
        </View>
        <Fontisto
          style={styles.photos}
          name="photograph"
          size={95}
          color={"white"}
          onPress={() => setIsPhotoModalOpened(true)}
        />

        <PhotoModal
          onClose={() => setIsPhotoModalOpened(false)}
          visible={isPhotoModalOpened}
          addPhoto={handleAddPhoto}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#202020",
    height: "100%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#000",
    maxHeight: 125,
    width: "100%",
  },
  title: {
    marginTop: -200,
    fontSize: 25,
    fontWeight: "bold",
    textAlign: "center",
    color: "white",
  },
  input: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    height: 40,
    margin: 15,
    borderWidth: 1,
    padding: 10,
    backgroundColor: "#323232",
    color: "grey",
    borderColor: "white",
    borderRadius: 17,
    width: "80%",
  },
  locationInput: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    height: 40,
    margin: 15,
    borderWidth: 1,
    padding: 10,
    backgroundColor: "#323232",
    color: "grey",
    borderColor: "white",
    borderRadius: 17,
    width: 300,
  },
  texte: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: "white",
  },
  photoPlusFriends: {
    flexDirection: "row",
  },
  photos: {
    backgroundColor: "#323232",
    width: 140,
    height: 140,
    borderWidth: 2,
    borderRadius: 25,
    borderColor: "white",
    marginLeft: 10,
    marginRight: 10,
    padding: 15,
  },
  friends: {
    backgroundColor: "#323232",
    width: 140,
    height: 140,
    borderWidth: 2,
    borderRadius: 25,
    borderColor: "white",
    marginLeft: 10,
    marginRight: 10,
    padding: 15,
  },
  date: {
    width: 140,
    height: 140,
    marginLeft: 10,
    marginRight: 10,
    padding: 15,
  },
  hour: {
    width: 140,
    height: 140,
    marginLeft: 10,
    marginRight: 10,
    padding: 15,
  },
  datePlusHour: {
    flexDirection: "row",
    marginBottom: 40,
  },
});
