// fonctions pures sans état---------------------------------------------------
// Ces fonctions sont utilisées pour formater les dates et heures dans les composants d'affichage
// et dans les écrans de création/modification d'événements. Elles prennent en entrée des chaînes ISO ou des objets Date
// et retournent des chaînes formatées pour l'affichage ou pour le DateTimePicker.  


// Formate une date ISO en "JJ/MM/AAAA" pour l'affichage
// ex: "2026-04-06T12:00:46.000Z" → "06/04/2026"
export const formatDate = (isoString: string | null): string => {
    if (!isoString) return "—"; // gère le cas null/undefined
    return isoString.slice(8, 10) + "/" + isoString.slice(5, 7) + "/" + isoString.slice(0, 4);
};

// Formate une heure ISO en "HH:MM"
// ex: "2026-04-06T12:00:46.000Z" → "12:00"
export const formatHour = (isoString: string | null): string => {
    if (!isoString) return "—";
    return isoString.slice(11, 16);
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