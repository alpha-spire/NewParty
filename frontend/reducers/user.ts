import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type UserState = {
    value: {
        email: string | null;
        username: string | null;
        token: string | null;
        friendIds: string[];
        userPhoto: string | null;
    };
};

const initialState: UserState = {
    value: {
        email: null,
        username: null,
        token: null,
        friendIds: [],
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
                email: string;
                username: string;
                token: string;
                userPhoto: string;
            }>,
        ) => {
            state.value.token = action.payload.token;
            state.value.email = action.payload.email;
            state.value.username = action.payload.username;
            state.value.userPhoto = action.payload.userPhoto;
        },
        logout: (state) => {
            state.value.token = null;
            state.value.email = null;
            state.value.username = null;
            state.value.userPhoto = null;
        },
        addFriend: (state, action: PayloadAction<string>) => {
            state.value.friendIds.push(action.payload);
        },
        removeFriend: (state, action: PayloadAction<string>) => {
            state.value.friendIds = state.value.friendIds.filter(
                (friend: string) => friend !== action.payload,
            );
        },
    },
});

export const { login, logout, addFriend, removeFriend } = userSlice.actions;
export default userSlice.reducer;
