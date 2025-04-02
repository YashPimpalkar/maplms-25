import { connection as db } from "../../config/dbConfig.js";


export const getNotificationsBySid = (req, res) => {
    try {
      const { sid } = req.params; // Extract sid from request body
  
      if (!sid) {
        return res.status(400).json({ error: "sid is required" });
      }
  
      const sql = `
      SELECT cn.*, cu.teacher_name
FROM copo_notifications cn
JOIN copo_mentee_table cmt ON cn.mmrid = cmt.mmr_id
JOIN copo_users cu ON cn.mmrid = cu.userid
WHERE cmt.sid = ? AND cn.status = 1
ORDER BY cn.created_at DESC;

      `;
  
      db.query(sql, [sid], (error, results) => {
        if (error) {
          console.error("Database error:", error);
          return res.status(500).json({ error: "Internal server error" });
        }
        res.json(results); // Return all matching notifications
      });
  
    } catch (error) {
      console.error("Server error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  