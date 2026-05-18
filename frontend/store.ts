import { configureStore } from "@reduxjs/toolkit";
import user from "./reducers/user";
import event from "./reducers/event";

// Store exporté séparément pour pouvoir y accéder en dehors des composants React
// (ex: dans apiFetch pour dispatcher logout() quand le token expire)
const store = configureStore({
    reducer: { user, event },
});

export type RootState = ReturnType<typeof store.getState>;
export default store;
