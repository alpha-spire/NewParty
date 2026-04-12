export type User = {
    _id: string;
    username: string;
    email: string;
    userPhoto: string | null;
    friendIds: string[]; //array of userIds
    eventIds: string[]; //array of eventIds
};
