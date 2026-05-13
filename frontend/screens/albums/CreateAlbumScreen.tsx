import { StyleSheet, Text, View, TextInput, Image, Alert, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import Header from "../headers/Header";
import PhotoModal from "../events/PhotoModal";
import { Fontisto } from "@expo/vector-icons";
import { BACKENDADRESS } from "../../config";
import { useSelector } from "react-redux";
import { UserState } from "../../reducers/user";

export default function CreateAlbumScreen() {
  const user = useSelector((state: { user: UserState }) => state.user.value);
  const [title, setTitle] = useState("");
  const [isPhotoModalOpened, setIsPhotoModalOpened] = useState(false);

  // URL de la photo uploadée — null tant qu'aucune photo n'a été choisie
  const [photo, setPhoto] = useState<string | null>(null);

  // Envoie la photo au backend et stocke l'URL Cloudinary retournée
  const handleAddPhoto = async (imageURI: string) => {
    console.log("1. handleAddPhoto appelé, imageURI:", imageURI ? imageURI.substring(0, 60) : "VIDE");
    try {
      const formData = new FormData();
      // @ts-expect-error — FormData sur React Native n'accepte pas le type objet nativement
      formData.append("photoFromFront", {
        uri: imageURI,
        name: "photo.jpg",
        type: "image/jpeg",
      });

      console.log("2. FormData créé, envoi vers:", BACKENDADRESS + "/upload");
      const response = await fetch(BACKENDADRESS + "/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${user.token}` },
        body: formData,
      });

      console.log("3. Réponse reçue, status:", response.status);
      const data = await response.json();
      console.log("4. Upload response:", JSON.stringify(data));

      if (!response.ok || !data.result) {
        Alert.alert("Erreur", data.error || "Upload échoué");
        return;
      }

      if (!data.photo?.url) {
        Alert.alert("Erreur", "URL de photo manquante dans la réponse");
        return;
      }

      setPhoto(data.photo.url);
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert("Erreur", "Impossible d'envoyer la photo");
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Header goBack={true} destination="Album" />
      </View>

      <View style={styles.container}>
        <Text style={styles.title}>Création d'un album</Text>

        <TextInput
          style={styles.input}
          placeholder="Titre..."
          placeholderTextColor="grey"
          onChangeText={(value) => setTitle(value)}
          value={title}
        />

        {/* Photo de couverture — affiche la photo uploadée ou l'icône par défaut */}
        {photo ? (
          <TouchableOpacity onPress={() => setIsPhotoModalOpened(true)}>
            <Image style={styles.photoPreview} source={{ uri: photo }} />
          </TouchableOpacity>
        ) : (
          <Fontisto
            style={styles.photos}
            name="photograph"
            size={95}
            color={"white"}
            onPress={() => setIsPhotoModalOpened(true)}
          />
        )}

        {/* Modal de sélection / prise de photo */}
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
  screen: {
    flex: 1,
    backgroundColor: "#202020",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#000",
    maxHeight: 125,
    width: "100%",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 25,
    fontWeight: "bold",
    textAlign: "center",
    color: "white",
    marginBottom: 20,
  },
  input: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "left",
    height: 40,
    marginBottom: 30,
    borderWidth: 1,
    padding: 10,
    backgroundColor: "#323232",
    color: "white",
    borderColor: "white",
    borderRadius: 17,
    width: "80%",
  },
  // Icône affichée quand aucune photo n'a encore été sélectionnée
  photos: {
    backgroundColor: "#323232",
    width: 140,
    height: 140,
    borderWidth: 2,
    borderRadius: 25,
    borderColor: "white",
    padding: 15,
  },
  // Aperçu de la photo une fois uploadée — même taille que l'icône
  photoPreview: {
    width: 140,
    height: 140,
    borderWidth: 2,
    borderRadius: 25,
    borderColor: "white",
  },
});
