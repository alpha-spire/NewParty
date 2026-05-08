import { User } from "./user";

export type Invitation = {
    _id: string;
    senderId: Pick<User, "_id" | "username" | "userPhoto">;
    receiverId: string;
    status: "pending" | "accepted" | "refused";
    createdAt: string;
    updatedAt: string;
};
