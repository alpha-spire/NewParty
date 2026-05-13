import { StyleSheet, Text, View, Image, TouchableOpacity, FlatList } from "react-native";
import React from "react";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import { CreateButton } from "../../ui/createButton";
import { EventWithUsers } from "../../types/event";
import { useDispatch } from "react-redux";
import { addEvent } from "../../reducers/event";
import { Fontisto } from "@expo/vector-icons";
import Header from "../headers/Header";
import { useGetUserEvents } from "../../hooks/useGetUSerEvents";

type UserScreenProps = {
  navigation: NavigationProp<ParamListBase>;
};

export default function AlbumScreen({ navigation }: UserScreenProps) {
  const dispatch = useDispatch();

  // Récupère la liste des événements de l'utilisateur depuis l'API
  const { events } = useGetUserEvents();

  // Navigue vers l'écran de création d'album
  const handleCreateAlbum = () => {
    navigation.navigate("CreateAlbum");
  };

  // Stocke l'événement sélectionné dans Redux puis navigue vers son album
  const handleFocusAlbum = (item: EventWithUsers) => {
    dispatch(addEvent(item));
    navigation.navigate("FocusOnAlbum");
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Header goBack={false} />
      </View>

      <View style={styles.container}>
        {/* Barre sous le header : titre + bouton de création */}
        <View style={styles.underHeader}>
          <Text style={styles.title}>Mes albums</Text>
          <CreateButton
            colour="#92ff2daf"
            size="m"
            text="+"
            onPress={handleCreateAlbum}
          />
        </View>

        {/* Grille 3 colonnes — chaque carte = un album lié à un événement */}
        <FlatList
          numColumns={3}
          style={styles.listPosition}
          data={events}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.eventBox}
              onPress={() => handleFocusAlbum(item)}
            >
              {/* Photo de couverture ou icône par défaut */}
              {item.photoEventUrl ? (
                <Image
                  style={styles.updPhoto}
                  source={{ uri: item.photoEventUrl }}
                />
              ) : (
                <Fontisto
                  style={styles.photos}
                  name="photograph"
                  size={60}
                  color={"white"}
                />
              )}

              {/* Titre tronqué à 10 caractères + date de début */}
              <View style={styles.infosBox}>
                <Text style={styles.eventInfos}>{item.title.slice(0, 10)}</Text>
                <Text style={styles.eventInfos}>
                  {item.startDate.slice(0, 10)}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#1b1b1b",
  },
  container: {
    width: "100%",
    backgroundColor: "#1b1b1b",
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
  underHeader: {
    padding: 10,
    paddingTop: 20,
    alignItems: "flex-start",
    justifyContent: "center",
    backgroundColor: "#1b1b1b",
    height: 100,
    width: "100%",
    borderBottomWidth: 0.2,
    borderColor: "white",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "white",
  },
  listPosition: {
    height: "100%",
    width: "100%",
  },
  // Cellule de la grille : 1/3 de la largeur, bordures légères
  eventBox: {
    width: "33.333333%",
    flexDirection: "column",
    backgroundColor: "#101010",
    borderTopColor: "white",
    borderTopWidth: 0.2,
    borderBottomColor: "white",
    borderBottomWidth: 0.2,
    borderRightColor: "white",
    borderRightWidth: 0.2,
    borderLeftColor: "white",
    borderLeftWidth: 0.2,
    padding: 15,
    paddingTop: 25,
  },
  infosBox: {
    alignContent: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  eventInfos: {
    color: "grey",
    fontSize: 15,
    marginBottom: -1.75,
    textAlign: "center",
  },
  // Icône photograph affichée quand aucune photo n'est définie
  photos: {
    backgroundColor: "#323232",
    width: "100%",
    height: 100,
    borderWidth: 2,
    borderRadius: 25,
    borderColor: "white",
    padding: 15,
    marginTop: 10,
  },
  updPhoto: {
    width: "100%",
    height: 100,
    borderWidth: 2,
    borderRadius: 25,
    borderColor: "white",
    marginBottom: 10,
  },
});
