// fonctions pures sans état---------------------------------------------------
// Ces fonctions sont utilisées pour formater les dates et heures dans les composants d'affichage
// et dans les écrans de création/modification d'événements. Elles prennent en entrée des chaînes ISO ou des objets Date
// et retournent des chaînes formatées pour l'affichage ou pour le DateTimePicker.  


// Formate une date ISO en "JJ/MM/AAAA" pour l'affichage (heure locale)
// ex: "2026-04-06T12:00:46.000Z" → "06/04/2026"
export const formatDate = (isoString: string | null): string => {
    if (!isoString) return "—";
    const d = new Date(isoString);
    return [
        ("0" + d.getDate()).slice(-2),
        ("0" + (d.getMonth() + 1)).slice(-2),
        d.getFullYear(),
    ].join("/");
};

// Formate une heure ISO en "HH:MM" (heure locale — évite le décalage UTC)
// ex: "2026-04-06T14:00:00.000Z" → "16:00" en UTC+2
export const formatHour = (isoString: string | null): string => {
    if (!isoString) return "—";
    const d = new Date(isoString);
    return ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
};


// Convertit une valeur en Date valide — fallback sur new Date() si null/undefined/invalide
export const safeDate = (val: string | null | undefined): Date => {
    if (!val) return new Date();
    const d = new Date(val);
    return isNaN(d.getTime()) ? new Date() : d;
};

//  Formate un objet Date en "JJ/MM/AAAA"
//  ex: new Date() → "06/04/2026"
//  Utilisé dans CreateEventScreen et ModifyEventScreen pour le DateTimePicker
export const formatDateObj = (d: Date): string => {
    return [
        ("0" + d.getDate()).slice(-2),
        ("0" + (d.getMonth() + 1)).slice(-2),
        d.getFullYear(),
    ].join("/");
};


//  Formate un objet Date en "HH:MM"
//  ex: new Date() → "12:00"
//  Utilisé dans CreateEventScreen et ModifyEventScreen pour le DateTimePicker
export const formatHourObj = (d: Date): string => {
    return [
        ("0" + d.getHours()).slice(-2),
        ("0" + d.getMinutes()).slice(-2),
    ].join(":");
};