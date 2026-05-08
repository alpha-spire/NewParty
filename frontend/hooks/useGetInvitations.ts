import { useState, useEffect } from "react";
import { useIsFocused } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { BACKENDADRESS } from "../config";
import { UserState } from "../reducers/user";
import { Invitation } from "../types/invitation";

// Hook personnalisé pour récupérer la liste des invitations de l'utilisateur connecté
export const useGetInvitations = () => {
    const isFocused = useIsFocused();
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const user = useSelector((state: { user: UserState }) => state.user.value);

    useEffect(() => {
        if (!isFocused || !user.token) return;

        const fetchInvitations = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(
                    BACKENDADRESS + "/invitations/received",
                    {
                        headers: { Authorization: `Bearer ${user.token}` },
                    },
                );
                if (!response.ok) {
                    setError("Failed to fetch invitations");
                    return;
                }
                const data = await response.json();
                if (data.result) {
                    setInvitations(data.invitations);
                } else {
                    setError(data.error);
                }
            } catch (error) {
                console.error("Erreur de récupération des invitations", error);
                setError("Failed to fetch invitations");
            } finally {
                setIsLoading(false);
            }
        };
        fetchInvitations();
    }, [isFocused]);

    return { invitations, isLoading, error, setInvitations };
};
