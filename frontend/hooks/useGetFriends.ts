import { useIsFocused } from "@react-navigation/native";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { BACKENDADRESS } from "../config";
import { UserState } from "../reducers/user";
import { User } from "../types/user";

// Hook personnalisé pour récupérer la liste des amis de l'utilisateur connecté
export const useGetFriends = () => {
    const isFocused = useIsFocused();//hook renvoie `true` si l'écran est actif, `false` sinon.

    const [friends, setFriends] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false); // état de chargement pour éviter les appels redondants
    const [error, setError] = useState<string | null>(null); // état d'erreur pour la gestion des erreurs de fetch
    const user = useSelector((state: { user: UserState }) => state.user.value);

    useEffect(() => {
        if(!isFocused || isLoading || error) return; // ne pas fetch si pas focus, déjà en chargement ou en erreur
        if (!user.token) {  // si pas de token, on ne peut pas fetch les friends
            setError("User not authenticated");
            return;
        }
        const fetchFriends = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(
                    BACKENDADRESS + "/users/friends",
                    {
                        headers: {
                            Authorization: `Bearer ${user.token}`,  // envoi du token pour authentification
                        },
                    }
                );
                if (!response.ok) {
                    setError("Failed to fetch events");
                    return;
                }

                const data = await response.json();
                if (data.result) {
                    setFriends(data.friends);
                } else {
                    setError(data.error);
                }
            } catch (error) {
                console.error("Erreur de récupération des amis", error);
                setError("Failed to fetch friends");
            } finally {
                setIsLoading(false); // refetch à chaque fois que l'écran devient actif
            }
        };
        fetchFriends();
    }, [isFocused]);
    return {friends, isLoading, error}; // on retourne un objet avec les données, l'état de chargement et l'erreur pour une utilisation plus flexible dans les composants   
};
