import React from "react";
import {
    Text,
    View,
    StyleSheet,
    Modal,
    Image,
    TouchableOpacity,
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
    addPhoto: (imageURI: string) => void;
}) {
    const [imageURI, setImageURI] = useState<string>("");

    async function pickImageAsync() {
        const result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: false,
            quality: 1,
        });

        if (result.canceled) {
            alert("Aucune image selectionnée");
        } else {
            setImageURI(result.assets[0].uri);
        }
    }

    const handleRegister = () => {
        addPhoto(imageURI);
        onClose();
    };

    return (
        <Modal visible={visible} transparent style={styles.modal}>
            <View style={styles.container}>
                <Xbutton colour="black" size="l" text="X  " onPress={onClose} />

                <Text style={styles.texte}>
                    Ajoute une photo de ta galerie de photos
                </Text>
                <Image style={styles.image} source={{ uri: imageURI }} />
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
    buttonContainer: {
        flex: 0.1,
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "space-between",
        paddingTop: 20,
        paddingLeft: 20,
        paddingRight: 20,
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
