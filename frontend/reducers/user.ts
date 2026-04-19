import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type UserState = {
    value: {
        _id: string| null;
        email: string | null;
        username: string | null;
        token: string | null;
        friendIds: string[];
        eventIds: string[];
        userPhoto: string | null;
    };
};

const initialState: UserState = {
    value: {
        _id : null,
        email: null,
        username: null,
        token: null,
        friendIds: [],
        eventIds: [],
        userPhoto: null,
    },
};

export const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        login: (
            state,
            action: PayloadAction<{
                _id:string|null
                username: string;
                email: string | null;
                token: string;
                userPhoto: string | null;
                eventIds?: string[]; //  optionnel, pas toujours dans la réponse signin
                friendIds?: string[]; // optionnel, pas toujours dans la réponse signin
            }>,
        ) => {
            state.value._id      = action.payload._id ?? null; 
            state.value.username = action.payload.username;
            state.value.token = action.payload.token;
            state.value.email = action.payload.email;
            state.value.userPhoto = action.payload.userPhoto;
            state.value.friendIds = action.payload.friendIds ?? []; //
            state.value.eventIds = action.payload.eventIds ?? [];
        },
        logout: (state) => {
            state.value = {
                _id: null, 
                username: null,
                email: null,
                token: null,
                friendIds: [],
                eventIds: [],
                userPhoto: null,
            };
        },
        addFriend: (state, action: PayloadAction<string>) => {
            if (!state.value.friendIds.includes(action.payload)) {
                // éviter les doublons
                state.value.friendIds.push(action.payload);
            }
        },
        removeFriend: (state, action: PayloadAction<string>) => {
            state.value.friendIds = state.value.friendIds.filter(
                (friend) => friend !== action.payload,
            );
        },
        addEventId: (state, action: PayloadAction<string>) => {
            if (!state.value.eventIds.includes(action.payload)) {
                // éviter les doublons
                state.value.eventIds.push(action.payload);
            }
        },
        removeEventId: (state, action: PayloadAction<string>) => {
            state.value.eventIds = state.value.eventIds.filter(
                (id) => id !== action.payload,
            );
        },
    },
});

export const {
    login,
    logout,
    addFriend,
    removeFriend,
    addEventId,
    removeEventId,
} = userSlice.actions;
export default userSlice.reducer;
