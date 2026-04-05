import { useIsFocused } from "@react-navigation/native";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { BACKENDADRESS } from "../config";
import { UserState } from "../reducers/user";
import { EventWithUsers } from "../types/event";

export const useGetUserEvents = () => {
    const isFocused = useIsFocused();

    const [events, setEvents] = useState<EventWithUsers[]>([]);
    const user = useSelector((state: { user: UserState }) => state.user.value);

    useEffect(() => {
        const fetchEventList = async () => {
            try {
                const response = await fetch(
                    BACKENDADRESS + `/events/${user.token}`,
                );
                const data = await response.json();
                setEvents(data.events);
            } catch (error) {
                console.error("Erreur de récupération Events", error);
            }
        };
        fetchEventList();
    }, [isFocused]);
    return events;
};
