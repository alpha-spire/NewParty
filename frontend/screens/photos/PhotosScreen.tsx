import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { CameraView, Camera, CameraType, FlashMode } from "expo-camera";
import { useEffect } from "react";
import { useState, useRef } from "react";
import { useIsFocused } from "@react-navigation/native";
import { BACKENDADRESS } from "../../config";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Entypo from "@expo/vector-icons/Entypo";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { UserState } from "../../reducers/user";
import { useEventState } from "../../reducers/event";
import EventModal from "./EventModal";

type UserScreenProps = {
    navigation: NavigationProp<ParamListBase>;
};

export default function PhotospScreen({ navigation }: UserScreenProps) {
    const isFocused = useIsFocused();
    const [hasPermission, setHasPermission] = useState(false);
    const cameraRef = useRef<CameraView>(null);
    const [isEventModalOpened, setIsEventModalOpened] = useState(false);
    const [facing, setFacing] = useState<CameraType>("back");
    const [flash, setFlash] = useState<FlashMode>("off");
    const user = useSelector((state: { user: UserState }) => state.user.value);
    const event = useEventState();
    const [eventId, setEventId] = useState<string>("");
    const [title, setTitle] = useState<string[]>([]);

    useEffect(() => {
        (async () => {
            const result = await Camera.requestCameraPermissionsAsync();
            setHasPermission(result && result?.status === "granted");
        })();
    }, []);

    if (!hasPermission || !isFocused) {
        return <View />;
    }

    const takePicture = async () => {
        try {
            if (!eventId) {
                alert("Choisis ton évènement avant de prendre une photo !");
                return;
            }

            const photo = await cameraRef.current?.takePictureAsync({
                quality: 0.3,
            });

            if (!photo) {
                return;
            }

            const formData = new FormData();
            //@ts-expect-error
            formData.append("photoFromFront", {
                uri: photo.uri,
                name: "photo.jpg",
                type: "image/jpeg",
            });

            const response = await fetch(BACKENDADRESS + "/upload", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            await fetch(BACKENDADRESS + `/photos/${user.token}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    uri: data.photo.url,
                    eventId,
                    date: data.photo.date,
                }),
            });

            alert("Photo enregistrée !");
        } catch (error) {
            console.error("Erreur photo :", error);
            alert("Erreur : photo non enregistrée");
        }
    };

    const handleAddEvent = (eventIdChoise: string) => {
        setEventId(eventIdChoise);
    };

    const handleAddTitle = (titleEvent: string) => {
        if (title.length === 0) {
            setTitle([...title, titleEvent]);
        }
    };

    const handleRemoveTitle = (titleEvent: string) => {
        setTitle([]);
    };

    return (
        <CameraView
            style={styles.camera}
            ref={cameraRef}
            facing={facing}
            flash={flash}
        >
            <View style={styles.buttonContainer}>
                <TouchableOpacity activeOpacity={0.8}>
                    <Entypo
                        name="flash"
                        size={30}
                        color="white"
                        onPress={() => {
                            setFlash(flash === "off" ? "on" : "off");
                        }}
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.chooseEvent}
                    activeOpacity={0.8}
                    onPress={() => setIsEventModalOpened(true)}
                >
                    <Text style={styles.texte}>Choisis ton évènement :</Text>
                </TouchableOpacity>
                <Text style={styles.texte}>{title}</Text>
                <TouchableOpacity activeOpacity={0.8}>
                    <FontAwesome
                        name="rotate-right"
                        size={30}
                        color="white"
                        onPress={() => {
                            setFacing((current) =>
                                current === "back" ? "front" : "back",
                            );
                        }}
                    />
                </TouchableOpacity>
            </View>
            <View style={styles.snapContainer}>
                <TouchableOpacity activeOpacity={0.8}>
                    <TouchableOpacity
                        style={styles.photoCircle}
                        onPress={() => {
                            cameraRef && takePicture();
                        }}
                    />
                </TouchableOpacity>
            </View>
            <EventModal
                onClose={() => setIsEventModalOpened(false)}
                visible={isEventModalOpened}
                addEvent={handleAddEvent}
                addTitle={handleAddTitle}
                removeTitle={handleRemoveTitle}
                title={title}
            />
            <View></View>
        </CameraView>
    );
}

const styles = StyleSheet.create({
    camera: {
        flex: 1,
    },
    snapContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "flex-end",
        paddingBottom: 25,
    },
    buttonContainer: {
        flex: 0.1,
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "space-between",
        paddingTop: 20,
        paddingLeft: 20,
        paddingRight: 20,
    },
    texte: {
        color: "white",
    },
    chooseEvent: {
        backgroundColor: "#ff0000",
        left: 17,
        borderRadius: 7,
        borderWidth: 2,
        borderColor: "white",
        padding: 5,
    },
    photoCircle: {
        borderRadius: 50,
        backgroundColor: "#ff3434",
        width: 85,
        height: 85,
        borderWidth: 5,
        borderColor: "white",
    },
});
