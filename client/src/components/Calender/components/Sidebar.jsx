import React from "react";
import CreateEventButton from "./CreateEventButton";
import SmallCalendar from "./SmallCalendar";
import Labels from "./Labels";
export default function Sidebar() {
  return (
    <aside className="border p-5 min-w-64">
      <CreateEventButton />
      <SmallCalendar />
      <Labels />
    </aside>
  );
}
