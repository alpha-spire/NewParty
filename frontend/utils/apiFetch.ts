import store from "../store";
import { logout } from "../reducers/user";
import { navigateTo } from "../navigationRef";

// Remplace fetch() dans toute l'app.
// Si le serveur répond 401 (token expiré ou invalide) :
//   - efface la session Redux (logout)
//   - renvoie l'user sur l'écran de connexion
// Sinon se comporte exactement comme fetch() normal.
export async function apiFetch(url: string, options?: RequestInit): Promise<Response> {
    const response = await fetch(url, options);

    // Ne déclenche le logout que si l'user était connecté (token présent)
    // Évite de perturber signin/signup dont le backend répond aussi 401 sur mauvais identifiants
    if (response.status === 401 && store.getState().user.value.token) {
        store.dispatch(logout());
        navigateTo("Home");
    }

    return response;
}
