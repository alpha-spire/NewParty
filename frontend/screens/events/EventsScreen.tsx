import { StyleSheet, Text, View, Image, Alert } from "react-native";
import React from "react";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import { CreateButton } from "../../ui/createButton";
import { EditButton } from "../../ui/editButton";
import { FlatList } from "react-native";
import { EventWithUsers } from "../../types/event";
import { useDispatch, useSelector } from "react-redux";
import { addEvent } from "../../reducers/event";
import { UserState } from "../../reducers/user";
import { Fontisto } from "@expo/vector-icons";
import Header from "../headers/Header";
import { useGetUserEvents } from "../../hooks/useGetUSerEvents";
import { formatDate, formatHour } from "../../utils/dateUtils";

type EventsScreenProps = {
    navigation: NavigationProp<ParamListBase>;
};

export default function EventScreen({ navigation }: EventsScreenProps) {
    const dispatch = useDispatch();
    const user = useSelector((state: { user: UserState }) => state.user.value);
    //Hook personnalisé qui fetch la liste des events de l'user connecté
    const { events: allEvents, isLoading, error } = useGetUserEvents();

    // Filtre : uniquement les events dont la date de début est aujourd'hui ou dans le futur
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const events = allEvents.filter(
        (e) => e.startDate && new Date(e.startDate) >= today,
    );

    const handleCreateEvent = () => {
        navigation.navigate("CreateEvent");
    };

    const handleModifyEvent = (item: EventWithUsers) => {
        // Seul l'admin peut modifier l'event
        if (item.adminId._id !== user._id) {
            Alert.alert(
                "Accès refusé",
                "Seul le créateur de l'évènement peut le modifier.",
            );
            return;
        }
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

                {/* Contenu conditionnel uniquement dans la zone liste */}
                {isLoading ? (
                    // Indicateur de chargement centré
                    <View style={styles.centeredMessage}>
                        <Text style={styles.loadingText}>Chargement...</Text>
                    </View>
                ) : error ? (
                    // Message d'erreur centré
                    <View style={styles.centeredMessage}>
                        <Text style={styles.errorText}>
                            Erreur lors du chargement des événements
                        </Text>
                    </View>
                ) : (
                    // Liste des events
                    <FlatList
                        style={styles.listPosition}
                        data={events}
                        keyExtractor={(item) => item._id}
                        // message affiché si la liste est vide
                        ListEmptyComponent={
                            <Text style={styles.emptyText}>
                                Aucun évènement pour le moment
                            </Text>
                        }
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

                                {/* Infos de l'event */}
                                <View style={styles.infosBox}>
                                    <Text style={styles.eventTitle}>
                                        {item.title}
                                    </Text>
                                    <Text style={styles.eventInfos}>
                                        du {formatDate(item.startDate)}
                                    </Text>
                                    <Text style={styles.eventInfos}>
                                        à {formatHour(item.startHour)}
                                    </Text>
                                    <Text style={styles.eventInfos}>
                                        jusqu'au {formatDate(item.endDate)}{" "}
                                    </Text>
                                    <Text style={styles.eventInfos}>
                                        à {formatHour(item.endHour)}
                                    </Text>
                                    <Text style={styles.eventInfos}>
                                        Lieu : {item.location}
                                    </Text>
                                    {/* Bouton modification — navigue vers ModifyEvent */}
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
                )}
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
    centeredMessage: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    loadingText: {
        color: "white",
        fontSize: 16,
    },
    errorText: {
        color: "red",
        fontSize: 16,
    },
    emptyText: {
        //  style pour liste events vide
        color: "grey",
        textAlign: "center",
        marginTop: 40,
        fontSize: 16,
    },
    eventBox: {
        flexDirection: "row",
        backgroundColor: "#1b1b1b",
        borderTopColor: "white",
        borderTopWidth: 0.5,
        width: "100%",
    },
    eventTitle: {
        //  style dédié pour le titre de l'event
        color: "white",
        fontSize: 17,
        fontWeight: "bold",
        marginBottom: 4,
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
