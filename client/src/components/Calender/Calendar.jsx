import React, { useState, useContext, useEffect } from "react";
import { getMonth } from "./util";
import CalendarHeader from "./components/CalendarHeader";
import Sidebar from "./components/Sidebar";
import Month from "./components/Month";
import GlobalContext from "./context/GlobalContext";
import EventModal from "./components/EventModal";
import ContextWrapper from "./context/ContextWrapper";

function Calendar(props) {
  // Extract the uid from props
  const { uid } = props;
  
  // Wrap the calendar content with ContextWrapper and pass uid
  return (
    <ContextWrapper uid={uid}>
      <CalendarContent />
    </ContextWrapper>
  );
}

// Separate the calendar content to use the context
function CalendarContent() {
  const [currenMonth, setCurrentMonth] = useState(getMonth());
  const { monthIndex, showEventModal } = useContext(GlobalContext);

  useEffect(() => {
    setCurrentMonth(getMonth(monthIndex));
  }, [monthIndex]);

  return (
    <>
      {showEventModal && <EventModal />}
      <div className="flex flex-col w-full md:h-[95vh]">
        <CalendarHeader />
        <div className="flex flex-1 md:flex-row flex-col">
          <Sidebar />
          <Month month={currenMonth} />
        </div>
      </div>
    </>
  );
}

export default Calendar;