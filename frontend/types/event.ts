import { User } from "./user";

export type Event = {
    _id: string;
    title: string;
    description: string;
    location: string;
    photoEventUrl: string;
    startDate: string;
    endDate: string;
    startHour: string;
    isPrivate: boolean;
    adminId: string;
    memberIds: string[];
    createdAt: string;
    updatedAt: string;
};

export type EventWithUsers = Omit<Event, "adminId" | "memberIds"> & {
    // Omit prend Event et supprime adminId et memberIds
    // & fusionne le résultat de Omit avec un nouveau type qui contient les champs adminId et memberIds avec les types modifiés
    adminId: Pick<User, "_id" | "username" | "userPhoto">; // pick créé un nouveau type : uniquement les champs populés dans le backend
    memberIds: Pick<User, "_id" | "username" | "userPhoto">[];
};
