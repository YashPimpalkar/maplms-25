import { connection as db } from "../../config/dbConfig.js";
import asyncHand from "express-async-handler";

export const getEvents = asyncHand(async (req, res) => {
  const userId = req.params.userId;
  
  const query = "SELECT * FROM copo_calendar_events WHERE user_id = ?";
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching events:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

export const createEvent = asyncHand(async (req, res) => {
  const { userId, title, description, eventDate, label } = req.body;
  
  const query = `INSERT INTO copo_calendar_events 
    (user_id, title, description, event_date, label) 
    VALUES (?, ?, ?, ?, ?)`;
    
  db.query(query, [userId, title, description, eventDate, label], (err, result) => {
    if (err) {
      console.error("Error creating event:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.status(201).json({ 
      id: result.insertId,
      message: "Event created successfully" 
    });
  });
});

export const updateEvent = asyncHand(async (req, res) => {
  const { eventId } = req.params;
  const { title, description, eventDate, label } = req.body;
  
  const query = `UPDATE copo_calendar_events 
    SET title = ?, description = ?, event_date = ?, label = ? 
    WHERE event_id = ?`;
    
  db.query(query, [title, description, eventDate, label, eventId], (err) => {
    if (err) {
      console.error("Error updating event:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ message: "Event updated successfully" });
  });
});

export const deleteEvent = asyncHand(async (req, res) => {
  const { eventId } = req.params;
  
  const query = "DELETE FROM copo_calendar_events WHERE event_id = ?";
  db.query(query, [eventId], (err) => {
    if (err) {
      console.error("Error deleting event:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ message: "Event deleted successfully" });
  });
});