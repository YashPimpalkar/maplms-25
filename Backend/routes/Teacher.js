import express from "express";

const router = express.Router();

// Function to generate a room name in the format: VPPCOE-Room-<random-number>
const generateRoomName = () => {
  const randomNumber = Math.floor(100000 + Math.random() * 900000); // 6-digit random number
  return `VPPCOE-Room-${randomNumber}`;
};

router.get("/start-meeting", (req, res) => {
  try {
    const roomName = req.query.name || generateRoomName();
    const url = `https://meet.jit.si/${roomName}`;
    
    res.json({ url, roomName });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate meeting URL" });
  }
});

export default router;
