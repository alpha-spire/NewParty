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
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const user = useSelector((state: { user: UserState }) => state.user.value);

    useEffect(() => {
        if (!isFocused || !user.token) return;
        const fetchFriends = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(BACKENDADRESS + "/users/friends", {
                    headers: { Authorization: `Bearer ${user.token}` },
                });
                if (!response.ok) {
                    setError("Failed to fetch friends");
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
                setIsLoading(false);
            }
        };
        fetchFriends();
    }, [isFocused, refreshTrigger]);

    const refetch = () => setRefreshTrigger((t) => t + 1);

    return { friends, isLoading, error, refetch };
};
