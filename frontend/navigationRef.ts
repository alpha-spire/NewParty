import { createNavigationContainerRef } from "@react-navigation/native";

// Référence globale au NavigationContainer — permet de naviguer en dehors des composants React
// (ex: depuis apiFetch quand le token expire)
export const navigationRef = createNavigationContainerRef();

export function navigateTo(name: string) {
    if (navigationRef.isReady()) {
        navigationRef.navigate(name as never);
    }
}
