import React from "react";
import {
    Text,
    View,
    StyleSheet,
    Modal,
    Image,
    TouchableOpacity,
    Alert,
} from "react-native";
import { useState } from "react";
import { Xbutton } from "../../ui/xButton";
import { Button } from "../../ui/button";
import * as ImagePicker from "expo-image-picker";

export default function PhotoModal({
    onClose,
    visible,
    addPhoto,
}: {
    onClose: () => void;
    visible: boolean;
    addPhoto: (base64: string) => void;
}) {
    const [imageURI, setImageURI] = useState<string>("");
    const [imageBase64, setImageBase64] = useState<string>("");

    async function pickImageAsync() {
        const result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            quality: 0.3,
            base64: true,
        });

        if (result.canceled) {
            Alert.alert("Info", "Aucune image sélectionnée");
        } else {
            setImageURI(result.assets[0].uri);
            setImageBase64(result.assets[0].base64 ?? "");
        }
    }

    const handleRegister = () => {
        if (!imageBase64) {
            Alert.alert("Erreur", "Veuillez sélectionner une image");
            return;
        }
        addPhoto(`data:image/jpeg;base64,${imageBase64}`);
        onClose();
    };

    return (
        <Modal visible={visible} transparent style={styles.modal}>
            <View style={styles.container}>
                <Xbutton colour="black" size="l" text="X  " onPress={onClose} />

                <Text style={styles.texte}>
                    Ajoute une photo de ta galerie de photos
                </Text>
                {imageURI ? (
                    <Image style={styles.image} source={{ uri: imageURI }} />
                ) : (
                    <View style={styles.image} />
                )}
                <TouchableOpacity style={styles.btn} onPress={pickImageAsync}>
                    <Text style={styles.btnTxt}>Ajouter une photo</Text>
                </TouchableOpacity>
                <Button
                    colour="grey"
                    size="m"
                    text="Enregistrer"
                    onPress={() => handleRegister()}
                />
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modal: {
        alignItems: "center",
        justifyContent: "center",
    },
    container: {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "grey",
        borderRadius: 40,
        margin: 40,
        height: 670,
        top: 20,
        borderWidth: 1,
        borderColor: "white",
    },
    texte: {
        color: "white",
        fontSize: 30,
        alignItems: "center",
        justifyContent: "center",
    },
    image: {
        height: 200,
        marginVertical: 30,
        width: "90%",
    },
    btn: {
        width:'50%',
        backgroundColor: "black",
        borderRadius: 40,
        alignItems: "center",
        padding: 10,
        borderWidth: 0.5,
        borderColor: 'white'
    },
    btnTxt: { color: "white",
     },
});
