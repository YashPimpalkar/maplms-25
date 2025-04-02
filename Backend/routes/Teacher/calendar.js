import express from "express";
import { getEvents, createEvent, updateEvent, deleteEvent } from "../../controller/Teacher/Events.js";

const router = express.Router();

router.get("/events/:userId", getEvents);
router.post("/events", createEvent);
router.put("/events/:eventId", updateEvent);
router.delete("/events/:eventId", deleteEvent);

export default router;