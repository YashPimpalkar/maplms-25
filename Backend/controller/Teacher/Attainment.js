
import expressAsyncHandler from "express-async-handler";
import { connection as db } from "../../config/dbConfig.js";// Replace with your database connection

// Save or update attainment data
export const saveOrUpdateAttainment = (req, res) => {
    const { userCourseId, selectedCurriculumId, attainmentData } = req.body;
  
    if (!userCourseId || !selectedCurriculumId || !attainmentData) {
      
      return res.status(400).json({ error: "Invalid input data" });
    }
  
    attainmentData.forEach((attainment) => {
      const { cosname, averagePercentage, categorization } = attainment;
  
      // Check if the record exists
      const selectQuery = `
        SELECT * FROM copo_attainment_table 
        WHERE usercourse_id = ? AND curriculum_id = ? AND coname = ?`;
  
      db.query(
        selectQuery,
        [userCourseId, selectedCurriculumId, cosname],
        (err, results) => {
          if (err) {
            console.error("Error querying database:", err);
            
            return res.status(500).json({ error: "Internal server error" });
          }
  
          if (results.length > 0) {
            // Update the existing record
            const updateQuery = `
              UPDATE copo_attainment_table 
              SET attainment = ?, categorization = ? 
              WHERE idattainment_table = ?`;
  
            db.query(
              updateQuery,
              [averagePercentage, categorization, results[0].idattainment_table],
              (err) => {
                if (err) {
                  console.error("Error updating database:", err);
                  
                  return res.status(500).json({ error: "Internal server error" });
                }
              }
            );
          } else {
            // Insert a new record
            const insertQuery = `
              INSERT INTO copo_attainment_table 
              (coname, attainment, categorization, usercourse_id, curriculum_id) 
              VALUES (?, ?, ?, ?, ?)`;
  
            db.query(
              insertQuery,
              [cosname, averagePercentage, categorization, userCourseId, selectedCurriculumId],
              (err) => {
                if (err) {
                  console.error("Error inserting into database:", err);
                  
                  return res.status(500).json({ error: "Internal server error" });
                }
              }
            );
          }
        }
      );
    });
    
   return  res.status(200).json({ message: "Data saved successfully" });
  };
  
 
  