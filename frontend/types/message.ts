import { User } from "./user";

export type Message = {
    _id: string;
    _userId: string;
    message: string;
    eventId: string;
    isEdited: boolean;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
};

export type MessageWithUser = Omit<Message, "_userId"> & {
    user: Pick<User, "_id" | "username" | "userPhoto">;
};
