import { connection as db } from "../../config/dbConfig.js";

export const nextSemester = (req, res) => {
  
    const sql = 'UPDATE copo_copo_students_detail SET semester = semester + 1 WHERE semester < 8'; // Increment semester for students not in the final semester (8)
  
    db.query(sql, (err, result) => {
      if (err) {
        console.error("Error updating student semesters:", err);
        
        return res.status(500).json({ error: 'Failed to update student semesters' });
      }
  
      // Check how many rows were affected
      if (result.affectedRows > 0) {
        
        return res.status(200).json({ message: 'Student semesters updated successfully' });
      } else {
        
        return res.status(400).json({ message: 'No records updated. All students might already be in semester 8.' });
      }
    });
  };