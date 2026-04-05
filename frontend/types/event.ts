import {User} from './user'


export type Event = {
  _id: string;
  title: string;
  startDate: string;
  endDate: string;
  startHour: string;
  memberIds: string[];
  location: string;
  adminId: string;
  photoEventUrl: string;
};

export type EventWithUsers = Omit<Event,'memberIds'> & {memberIds : User[]}
