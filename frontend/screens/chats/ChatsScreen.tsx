import { StyleSheet, Text, View, Image, TouchableOpacity, FlatList } from "react-native";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import React from "react";
import { useDispatch } from "react-redux";
import { EventWithUsers } from "../../types/event";
import Header from "../headers/Header";
import { Fontisto } from "@expo/vector-icons";
import { addEvent } from "../../reducers/event";
import { CreateButton } from "../../ui/createButton";
import { useGetUserEvents } from "../../hooks/useGetUSerEvents";

type UserScreenProps = {
  navigation: NavigationProp<ParamListBase>;
};

export default function ChatsScreen({ navigation }: UserScreenProps) {
  const dispatch = useDispatch();

  // Réutilise les événements de l'utilisateur — chaque event est un fil de discussion
  const { events } = useGetUserEvents();

  const handleCreateChat = () => {
    navigation.navigate("CreateChat");
  };

  // Stocke l'event sélectionné dans Redux puis navigue vers le chat de cet event
  const handleFocusChat = (item: EventWithUsers) => {
    dispatch(addEvent(item));
    navigation.navigate("ChatOnFocus");
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Header goBack={false} />
      </View>

      <View style={styles.container}>
        {/* Barre sous le header : titre + bouton création */}
        <View style={styles.underHeader}>
          <Text style={styles.title}>Discussions</Text>
          <CreateButton
            colour="#92ff2daf"
            size="m"
            text="+"
            onPress={handleCreateChat}
          />
        </View>

        {/* Liste des discussions — une ligne par événement */}
        <FlatList
          style={styles.listPosition}
          data={events}
          keyExtractor={(item) => item._id}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Aucune discussion pour le moment</Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleFocusChat(item)}>
              <View style={styles.eventBox}>
                {/* Photo de l'événement ou icône par défaut */}
                {item.photoEventUrl ? (
                  <Image
                    style={styles.updPhoto}
                    source={{ uri: item.photoEventUrl }}
                  />
                ) : (
                  <Fontisto
                    style={styles.photos}
                    name="photograph"
                    size={25}
                    color={"white"}
                  />
                )}
                <View style={styles.infosBox}>
                  <Text style={styles.eventInfos}>{item.title}</Text>
                </View>
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
  eventBox: {
    width: "100%",
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#101010",
    borderTopWidth: 0.2,
    borderBottomWidth: 0.2,
    borderColor: "white",
  },
  infosBox: {
    alignContent: "center",
    marginTop: 10,
  },
  eventInfos: {
    marginLeft: 10,
    color: "white",
    fontSize: 20,
  },
  photos: {
    backgroundColor: "#323232",
    width: 50,
    height: 50,
    borderWidth: 2,
    borderRadius: 25,
    borderColor: "white",
    marginTop: 10,
    marginBottom: -10,
    padding: 10,
  },
  updPhoto: {
    width: 50,
    height: 50,
    borderWidth: 2,
    borderRadius: 25,
    borderColor: "white",
  },
  emptyText: {
    color: "grey",
    textAlign: "center",
    marginTop: 40,
    fontSize: 15,
  },
});
