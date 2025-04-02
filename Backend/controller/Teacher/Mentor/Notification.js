import { connection as db} from "../../../config/dbConfig.js"



export const createNotification = (req, res) => {
  try {
    const { mmr_id, message, eventDate,uid } = req.body.notificationData; // Use req.body directly
    console.log("Received Notification Data:", req.body);

    if (!mmr_id || !message || !eventDate || !uid) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const query = `
      INSERT INTO copo_notifications (mmrid, message, event_date,mentor_id, created_at, status) 
      VALUES (?, ?, ?,?, NOW(), 1)
    `;

    const values = [mmr_id, message, eventDate,uid];

    db.query(query, values, (error, result) => {
      if (error) {
        console.error("Database error:", error);
        return res.status(500).json({ error: "Internal server error" });
      }

      res.status(201).json({ success: true, message: "Notification created", nid: result.insertId });
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


// Get All Notifications
export const getNotifications = (req, res) => {
    try {
      const { uid, mmr_id } = req.body.notificationData ; // Extract from request body
       console.log("Received Notification Data:", req.body);
      if (!uid || !mmr_id) {
        return res.status(400).json({ error: "mentor_id and mmr_id are required" });
      }
  
      const sql = `
        SELECT * FROM copo_notifications 
        WHERE mentor_id = ? AND mmrid = ? 
        ORDER BY created_at DESC
      `;
  
      db.query(sql, [uid, mmr_id], (error, results) => {
        if (error) {
          console.error("Database error:", error);
          return res.status(500).json({ error: "Internal server error" });
        }
        res.json(results);
      });
  
    } catch (error) {
      console.error("Server error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };


  
  
