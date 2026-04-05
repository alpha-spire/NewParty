import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { EventWithUsers } from ".././types/event";
import { useSelector } from "react-redux";

export type EventState = {
  value: EventWithUsers | null;
};

const initialState: EventState = {
  value: null,
};

export const eventSlice = createSlice({
  name: "event",
  initialState,
  reducers: {
    addEvent: (state, action: PayloadAction<EventWithUsers>) => {
      state.value = action.payload;
    },
    removeEvent: (state) => {
      state.value = null;
    },
  },
});

export const { addEvent, removeEvent } = eventSlice.actions;
export default eventSlice.reducer;

export const useEventState = () => {
  return useSelector((state: { event: EventState }) => state.event.value);
};
