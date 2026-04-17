import { Alert } from "react-native";
import { BACKENDADRESS } from "../config";

/**
 * Upload une image vers Cloudinary via le backend
 * @param imageURI  — URI locale de l'image (depuis ImagePicker)
 * @param token     — token de l'user connecté pour l'auth
 * @returns         — URL Cloudinary de l'image uploadée, ou null si échec
 */
export const uploadPhoto = async (
    imageURI: string,
    token: string,
): Promise<string | null> => {
    // retourne l'URL ou null, pas de setPhoto ici
    const formData = new FormData();
    // @ts-expect-error — FormData natif React Native ne supporte pas le typage complet
    formData.append("photoFromFront", {
        uri: imageURI,
        name: "photo.jpg",
        type: "image/jpeg",
    });

    try {
        const response = await fetch(BACKENDADRESS + "/upload/", {
            method: "POST",
            body: formData,
            headers: {
                Authorization: `Bearer ${token}`, // token passé en paramètre
            },
        });

        const data = await response.json();

        if (!response.ok) {
            Alert.alert("Erreur", data.error || "Échec de l'upload");
            return null; // null en cas d'échec
        }
        if (data.result) {
            Alert.alert("Succès", "Photo uploadée avec succès");
        }
        return data.photo.url; // retourne juste l'URL
    } catch (error) {
        console.error("Upload photo error:", error);
        Alert.alert("Erreur", "Impossible d'uploader la photo");
        return null;
    }
};
