import React, { useState, useEffect, useReducer, useMemo } from "react";
import GlobalContext from "./GlobalContext";
import dayjs from "dayjs";
import api from "../../../api";

function savedEventsReducer(state, { type, payload }) {
  switch (type) {
    case "push":
      return [...state, payload];
    case "update":
      return state.map((evt) =>
        evt.id === payload.id ? payload : evt
      );
    case "delete":
      return state.filter((evt) => evt.id !== payload.id);
    case "set":
      return payload;
    default:
      throw new Error();
  }
}

export default function ContextWrapper(props) {
  const [monthIndex, setMonthIndex] = useState(dayjs().month());
  const [smallCalendarMonth, setSmallCalendarMonth] = useState(null);
  const [daySelected, setDaySelected] = useState(dayjs());
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [labels, setLabels] = useState([]);
  const [savedEvents, dispatchCalEvent] = useReducer(savedEventsReducer, []);
  const userId = props.uid 

  // Fetch events from database on component mount
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get(`/api/calendar/events/${userId}`);
        const events = response.data.map(event => ({
          id: event.event_id,
          title: event.title,
          description: event.description,
          label: event.label,
          day: event.event_date
        }));
        dispatchCalEvent({ type: "set", payload: events });
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };
    if (userId) {
      fetchEvents();
    }
  }, [userId]);

  // Save event to database
  const saveEvent = async (event) => {
    try {
      const response = await api.post("/api/calendar/events", {
        userId,
        title: event.title,
        description: event.description,
        eventDate: event.day,
        label: event.label
      });
      return response.data.id;
    } catch (error) {
      console.error("Error saving event:", error);
      throw error;
    }
  };

  // Update event in database
  const updateEvent = async (event) => {
    try {
      await api.put(`/api/calendar/events/${event.id}`, {
        title: event.title,
        description: event.description,
        eventDate: event.day,
        label: event.label
      });
    } catch (error) {
      console.error("Error updating event:", error);
      throw error;
    }
  };

  // Delete event from database
  const deleteEvent = async (eventId) => {
    try {
      await api.delete(`/api/calendar/events/${eventId}`);
    } catch (error) {
      console.error("Error deleting event:", error);
      throw error;
    }
  };

  const handleDispatchCalEvent = async (action) => {
    try {
      if (action.type === "push") {
        const eventId = await saveEvent(action.payload);
        action.payload.id = eventId;
      } else if (action.type === "update") {
        await updateEvent(action.payload);
      } else if (action.type === "delete") {
        await deleteEvent(action.payload.id);
      }
      dispatchCalEvent(action);
    } catch (error) {
      console.error("Error handling calendar event:", error);
    }
  };

  // ... rest of your existing code ...

  const filteredEvents = useMemo(() => {
    return savedEvents.filter((evt) =>
      labels
        .filter((lbl) => lbl.checked)
        .map((lbl) => lbl.label)
        .includes(evt.label)
    );
  }, [savedEvents, labels]);

  useEffect(() => {
    localStorage.setItem("savedEvents", JSON.stringify(savedEvents));
  }, [savedEvents]);

  useEffect(() => {
    setLabels((prevLabels) => {
      return [...new Set(savedEvents.map((evt) => evt.label))].map(
        (label) => {
          const currentLabel = prevLabels.find(
            (lbl) => lbl.label === label
          );
          return {
            label,
            checked: currentLabel ? currentLabel.checked : true,
          };
        }
      );
    });
  }, [savedEvents]);

  useEffect(() => {
    if (smallCalendarMonth !== null) {
      setMonthIndex(smallCalendarMonth);
    }
  }, [smallCalendarMonth]);

  useEffect(() => {
    if (!showEventModal) {
      setSelectedEvent(null);
    }
  }, [showEventModal]);

  function updateLabel(label) {
    setLabels(
      labels.map((lbl) => (lbl.label === label.label ? label : lbl))
    );
  }


  return (
    <GlobalContext.Provider
      value={{
        monthIndex,
        setMonthIndex,
        smallCalendarMonth,
        setSmallCalendarMonth,
        daySelected,
        setDaySelected,
        showEventModal,
        setShowEventModal,
        dispatchCalEvent: handleDispatchCalEvent,
        selectedEvent,
        setSelectedEvent,
        savedEvents,
        setLabels,
        labels,
        updateLabel,
        filteredEvents,
      }}
    >
      {props.children}
    </GlobalContext.Provider>
  );
}
