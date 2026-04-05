import { StyleSheet, Text, View, Image } from "react-native";
import React from "react";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import { CreateButton } from "../../ui/createButton";
import { EditButton } from "../../ui/editButton";
import { FlatList } from "react-native";
import { EventWithUsers } from "../../types/event";
import { useDispatch } from "react-redux";
import { addEvent } from "../../reducers/event";
import { Fontisto } from "@expo/vector-icons";
import Header from "../headers/Header";
import { useGetUserEvents } from "../../hooks/useGetUSerEvents";

type UserScreenProps = {
  navigation: NavigationProp<ParamListBase>;
};

export default function EventScreen({ navigation }: UserScreenProps) {
  const dispatch = useDispatch();

  const events = useGetUserEvents();

  const handleCreateEvent = () => {
    navigation.navigate("CreateEvent");
  };

  const handleModifyEvent = (item: EventWithUsers) => {
    dispatch(addEvent(item));
    navigation.navigate("ModifyEvent");
  };

  return (
    <View>
      <View style={styles.header}>
        <Header goBack={false} />
      </View>
      <View style={styles.container}>
        <View style={styles.underHeader}>
          <Text style={styles.title}>Mes évènements</Text>
          <CreateButton
            colour="#92ff2daf"
            size="m"
            text="+"
            onPress={handleCreateEvent}
          />
        </View>

        <FlatList
          style={styles.listPosition}
          data={events}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.eventBox}>
              {item.photoEventUrl ? (
                <Image
                  style={styles.updPhoto}
                  source={{ uri: item.photoEventUrl }}
                />
              ) : (
                <Fontisto
                  style={styles.photos}
                  name="photograph"
                  size={80}
                  color={"white"}
                  bottom={10}
                />
              )}

              <View style={styles.infosBox}>
                <Text style={styles.eventInfos}>{item.title}</Text>
                <Text style={styles.eventInfos}>
                  du {item.startDate.slice(5, 10)}
                </Text>
                <Text style={styles.eventInfos}>
                  à {item.startDate.slice(11, 16)}
                </Text>
                <Text style={styles.eventInfos}>
                  jusqu'au {item.endDate.slice(5, 10)}{" "}
                </Text>
                <Text style={styles.eventInfos}>
                  à {item.endDate.slice(11, 16)}
                </Text>
                <Text style={styles.eventInfos}>Lieu : {item.location}</Text>
                <EditButton
                  size="l"
                  text="..."
                  onPress={() => {
                    handleModifyEvent(item);
                  }}
                />
              </View>
            </View>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "flex-start",
    justifyContent: "center",
    backgroundColor: "#1b1b1b",
    height: "85%",
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
    fontSize: 30,
    fontWeight: "bold",
    color: "white",
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
  listPosition: {
    height: "100%",
    width: "100%",
  },
  eventBox: {
    display: "flex",
    flexDirection: "row",
    backgroundColor: "#1b1b1b",
    borderTopColor: "white",
    borderTopWidth: 0.5,
    marginBottom: -37,
    width: 375,
  },

  infosBox: {
    alignContent: "center",
    marginTop: 10,
  },
  eventInfos: {
    color: "grey",
    fontSize: 15,
    marginBottom: -1.75,
  },
  photos: {
    backgroundColor: "#323232",
    width: 120,
    height: 120,
    borderWidth: 2,
    borderRadius: 25,
    borderColor: "white",
    marginLeft: 10,
    marginRight: 10,
    marginTop: 20,
    padding: 15,
  },
  updPhoto: {
    width: 120,
    height: 120,
    borderWidth: 2,
    borderRadius: 25,
    borderColor: "white",
    marginLeft: 10,
    marginRight: 10,
    marginTop: 10,
  },
});
