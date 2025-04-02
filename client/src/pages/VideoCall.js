import React, { useEffect, useRef, useState } from "react";

const VideoCall = ({ roomName = "default-room", displayName = "Guest" }) => {
  const jitsiContainer = useRef(null);
  const [jitsiApi, setJitsiApi] = useState(null);

  useEffect(() => {
    if (!window.JitsiMeetExternalAPI) {
      console.error("JitsiMeetExternalAPI is not loaded. Ensure the script is included in index.html.");
      return;
    }

    const domain = "meet.jit.si";
    const options = {
      roomName,
      width: "100%",
      height: "100%",
      parentNode: jitsiContainer.current,
      userInfo: { displayName },
    };

    const api = new window.JitsiMeetExternalAPI(domain, options);
    setJitsiApi(api);

    return () => {
      api.dispose(); // Dispose properly
    };
  }, [roomName, displayName]); // Only re-run when roomName or displayName changes

  return <div ref={jitsiContainer} style={{ width: "100%", height: "500px", minHeight: "500px" }} />;
};

export default VideoCall;
