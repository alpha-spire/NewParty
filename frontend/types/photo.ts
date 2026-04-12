import { User } from "./user";

export type Photo = {
    _id: string;
    _userId: string;
    uri: string;
    eventId: string;
    caption: string;
    likes: string[];
    isDeleted: boolean;
    date: Date;
    createdAt: string;
    updatedAt: string;
};

export type PhotoWithUser = Omit<Photo, "_userId"> & {
    user: Pick<User, "_id" | "username" | "userPhoto">;
};
