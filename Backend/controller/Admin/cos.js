import { configDotenv } from "dotenv";
import { connection as db } from "../../config/dbConfig/js"

export const addcos = (req, res) => {

  const formData = req.body.formData;
  const user_course_id = req.body.usercourse_id;

  if (!formData || !user_course_id) {
    
    return res.status(400).json({ error: "Invalid data" });
  }

  // Check for existing records
  const checkSql = `
    SELECT co_name, co_body
    FROM copo_cos
    WHERE usercourse_id = ?
    AND (co_name, co_body) IN (?)
  `;

  // Prepare values for the check query
  const checkValues = formData.map(cos => [cos.cos_name, cos.cos_body]);

  db.query(checkSql, [user_course_id, checkValues], (err, existingRecords) => {
    if (err) {
      console.error("Error checking existing COS records:", err);
      
      return res.status(500).json({ error: "Database error" });
    }

    // Create a set of existing records for easy lookup
    const existingSet = new Set(existingRecords.map(record => `${record.co_name}|${record.co_body}`));

    // Check for duplicates in the formData
    const duplicates = formData.filter(cos => existingSet.has(`${cos.cos_name}|${cos.cos_body}`));

    if (duplicates.length > 0) {
      
      return res.status(400).json({ error: "Some COS records already exist", duplicates });
    }

    // Proceed with insertion if no duplicates
    const sql = "INSERT INTO copo_cos (usercourse_id, co_name, co_body, created_time) VALUES ?";
    const values = formData.map(cos => [user_course_id, cos.cos_name, cos.cos_body, new Date()]);

    db.query(sql, [values], (err, result) => {
      if (err) {
        console.error("Error inserting COS records:", err);
        
        return res.status(500).json({ error: "Database error" });
      }
      
      return res.status(200).json({ message: "COS records added successfully", result });
    });
  });
};


export const show_cos = (req, res) => {
  
  const user_course_id = req.params.uid;
  console.log(user_course_id);
  // console.log(user_course_id)// Use req.query for GET requests
  const sql = "SELECT * FROM copo_cos WHERE usercourse_id=?";
  db.query(sql, user_course_id, (err, result) => {
    if (err) {
      console.error("Error fetching COS records:", err); 
      
      return res.status(500).json({ error: "Database error" });
    }
    
    return res.status(200).json(result);
  });
};

export const get_courses = (req, res) => {
  
  const sql = "select u.usercourse_id,u.user_id,c.coursecode,c.course_name,u.semester,u.academic_year,u.branch,u.co_count from copo_user_course as u inner join copo_course as c on u.course_id = c.courseid ";

  db.query(sql, (error, results) => {
    if (error) {
      console.error("Error fetching COS records:", err);
      
      return res.status(500).json({ error: "Database error" });
    }
     
    return res.status(200).json(results);
  })
}

export const show_cos_for_admin = (req, res) => {
  
  const user_course_id = req.params.uid;
  const sql = "SELECT * FROM copo_cos WHERE usercourse_id=?";
  db.query(sql, user_course_id, (err, result) => {
    if (err) {
       
      console.error("Error fetching COS records:", err);
      return res.status(500).json({ error: "Database error" });
    }
    db.close() ;
    return res.status(200).json(result);
  });
};

export const add_cos_from_admin = (req, res) => {
  
  console.log("Reaching here");
  const user_course_id = req.body.usercourse_id;
  const cosToAdd = req.body.newCOs; // Array of { co_name, co_body } objects
  console.log(cosToAdd, cosToAdd[0].co_name, cosToAdd[0].co_body);
  const cosLength = cosToAdd.length;

  // console.log(user_course_id, cosToAdd, cosLength);

  if (!cosToAdd || !user_course_id) {
      
    return res.status(400).json({ error: "Invalid data" });
  }

  // Query to get existing COs for the user course
  const checkExistingCos = `SELECT co_name FROM copo_cos WHERE usercourse_id = ?;`;

  db.query(checkExistingCos, [user_course_id], (error, results) => {
    if (error) {
      console.error("Error fetching existing COS records:", error);
      
      return res.status(500).json({ error: "Database error" });
    }

    // Insert only new CO records
    const insertSql = `
      INSERT INTO copo_cos (usercourse_id, co_name, co_body, created_time)
      VALUES (?, ?, ?, ?);`;

    db.query(insertSql, [user_course_id, cosToAdd[0].co_name, cosToAdd[0].co_body, cosToAdd[0].created_time], (err, result) => {
      if (err) {
        console.error("Error adding COS records:", err);
       
        return res.status(500).json({ error: "Database error" });
      }

      // Update the co_count in user_course table
      const updateCoCountSql = `UPDATE copo_user_course SET co_count = co_count + ? WHERE usercourse_id = ?;`;

      db.query(updateCoCountSql, [cosLength, user_course_id], (updateErr, updateResult) => {
        if (updateErr) {
          console.error("Error updating co_count:", updateErr);
          
          return res.status(500).json({ error: "Failed to update co_count" });
        }
         
        return res.status(200).json({
          message: "New COS records added and co_count updated successfully",
          result,
          updatedRows: updateResult.affectedRows
        });
      });
    });
  });
};



export const update_Cos = (req, res) => {
  
  const { usercourse_id, updatedCos } = req.body;

  if (!usercourse_id || !Array.isArray(updatedCos) || updatedCos.length === 0) {
    return res.status(400).json({ error: "Invalid data provided" });
  }

  // Prepare SQL query to update each CO record individually
  let completedUpdates = 0;
  let errorOccurred = false;

  updatedCos.forEach((cos) => {
    const updateSql = `
      UPDATE copo_cos
      SET co_body = ?, created_time = ?
      WHERE usercourse_id = ? AND co_name = ?
    `;

    const updateValues = [
      cos.co_body,
      new Date(),
      usercourse_id,
      cos.co_name,
    ];

    db.query(updateSql, updateValues, (err, result) => {
      
      if (err) {
        console.error("Error updating CO record:", err);
        if (!errorOccurred) {
          errorOccurred = true;
          console.log(errorOccurred)
          return res.status(500).json({ error: "Database error" });

        }
      } else {
        completedUpdates += 1;

        // Check if all updates are completed
        if (completedUpdates === updatedCos.length && !errorOccurred) {
          res.status(200).json({ message: "CO records updated successfully" });
        }
      }
    });
  });
};


export const remove_cos_from_admin = (req, res) => {
  
  console.log("Removal reached here");
  
  // Extract data from the request
  const { usercourse_id, deleteCOs } = req.body; // Assuming data is sent in the body

  if (!deleteCOs || !usercourse_id) {
    return res.status(400).json({ error: "Invalid data" });
  }

  // Query to get existing COs for the user course
  const checkExistingCos = `SELECT * FROM copo_cos WHERE usercourse_id = ?;`;

  db.query(checkExistingCos, [usercourse_id], (error, results) => {
    if (error) {
      console.error("Error fetching COS records:", error);
      return res.status(500).json({ error: "Database error" });
    }

    // Prepare a batch deletion process
    const deleteQueries = deleteCOs.map((cos) => {
      return new Promise((resolve, reject) => {
        const deleteSql = `DELETE FROM copo_cos WHERE usercourse_id = ? AND co_name = ? AND co_body = ?;`;
        db.query(deleteSql, [usercourse_id, cos.co_name, cos.co_body], (err, result) => {
          if (err) {
            console.error("Error deleting COS record:", err);
            reject(err);
          } else {
            resolve(result);
          }
        });
      });
    });

    // Execute all delete queries in parallel
    Promise.all(deleteQueries)
      .then((deleteResults) => {
        // Update the co_count in user_course table
        const coCountUpdateSql = `UPDATE copo_user_course SET co_count = co_count - ? WHERE usercourse_id = ?;`;
        
        db.query(coCountUpdateSql, [deleteCOs.length, usercourse_id], (updateErr, updateResult) => {
          if (updateErr) {
            console.error("Error updating co_count:", updateErr);
            return res.status(500).json({ error: "Failed to update co_count" });
          }

          return res.status(200).json({
            message: "COS records removed and co_count updated successfully",
            deletedRecords: deleteResults.length,
            updatedRows: updateResult.affectedRows
          });
        });
      })
      .catch((err) => {
        console.error("Error in deletion process:", err);
        return res.status(500).json({ error: "Failed to delete one or more COS records" });
      });
  });
};