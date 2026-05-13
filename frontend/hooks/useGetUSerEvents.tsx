import { useIsFocused } from "@react-navigation/native";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { BACKENDADRESS } from "../config";
import { UserState } from "../reducers/user";
import { EventWithUsers } from "../types/event";

// Hook personnalisé pour récupérer la liste des événements de l'utilisateur connecté
export const useGetUserEvents = () => {
    const isFocused = useIsFocused();

    const [events, setEvents] = useState<EventWithUsers[]>([]);
    const [isLoading, setIsLoading] = useState(false); // état de chargement pour éviter les appels redondants
    const [error, setError] = useState<string | null>(null); // état d'erreur pour la gestion des erreurs de fetch
    const user = useSelector((state: { user: UserState }) => state.user.value);

    useEffect(() => {
        if(!isFocused || isLoading) return; // ne pas fetch si pas focus ou déjà en chargement
        if (!user.token) {  // si pas de token, on ne peut pas fetch les events
            setError("User not authenticated");
            return;
        }
        const fetchEventList = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(
                    BACKENDADRESS + "/events",
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
                    setEvents(data.listEvents);
                } else {
                    setError(data.error);
                }
            } catch (error) {
                console.error("Erreur de récupération Events", error);
                setError("Failed to fetch events");
            } finally {
                setIsLoading(false); // refetch à chaque fois que l'écran devient actif
            }
        };
        fetchEventList();
    }, [isFocused]);
    return {events, isLoading, error} as const; // on retourne un objet avec les données, l'état de chargement et l'erreur pour une utilisation plus flexible dans les composants   
};
