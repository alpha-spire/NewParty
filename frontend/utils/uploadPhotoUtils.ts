import { Alert } from "react-native";
import { BACKENDADRESS } from "../config";
import { apiFetch } from "./apiFetch";

/**
 * Upload une image vers Cloudinary via le backend
 * @param imageBase64  — image encodée en base64 (data:image/jpeg;base64,...)
 * @param token        — token de l'user connecté pour l'auth
 * @returns            — URL Cloudinary de l'image uploadée, ou null si échec
 */
export const uploadPhoto = async (
    imageBase64: string,
    token: string,
): Promise<string | null> => {
    try {
        const response = await apiFetch(BACKENDADRESS + "/upload/", {
            method: "POST",
            body: JSON.stringify({ photo: imageBase64 }),
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        let data: any;
        try {
            data = await response.json();
        } catch {
            Alert.alert("Erreur upload", `Status HTTP ${response.status} - réponse non-JSON`);
            return null;
        }

        if (!response.ok) {
            Alert.alert("Erreur upload", `[${response.status}] ${data?.error ?? "Échec de l'upload"}`);
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
