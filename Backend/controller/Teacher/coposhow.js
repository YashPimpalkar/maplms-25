import expressAsyncHandler from "express-async-handler";
import { connection as db } from "../../config/dbConfig.js";

// Show course
export const showCourse = (req, res) => {
  const { uid} = req.params;

  const sql = `SELECT 
    uc.usercourse_id, 
    ucu.user_id, 
    c.course_name, 
    uc.course_id, 
    uc.academic_year
FROM 
    copo_usercourse_users ucu
inner JOIN 
    copo_user_course uc ON ucu.usercourse_id = uc.usercourse_id
inner JOIN 
    copo_course c ON uc.course_id = c.courseid
WHERE 
    ucu.user_id = ?`;
  db.query(sql, uid, (err, result) => {
    if (err) {
      console.error("Error fetching CO-PO records:", err);
      
      return res.status(500).json({ error: "Database error" });
    }
    
    return res.status(200).json(result);
  });
};

//show co po 
export const showCopo = (req, res) => {
    const { uid} = req.params;
     const sql = `select u.idcos,u.usercourse_id,u.co_name,c.co_id,c.po_1,c.po_2,c.po_3,c.po_4,c.po_5,c.po_6,c.po_7,c.po_8,c.po_9,c.po_10,c.po_11,c.po_12,c.pso_1,c.pso_2,c.co_po_id from copo_cos as u inner join copo_co_po as c on u.idcos=c.co_id where u.usercourse_id=?`;
    db.query(sql, uid, (err, result) => {
      if (err) {
        console.error("Error fetching CO-PO records:", err);
        
        return res.status(500).json({ error: "Database error" });
      }
      
      return res.status(200).json(result);
    });
  };

//UPdate co po 
export const updateCopo = (req, res) => {
    const { co_id } = req.params;
    const {
      po_1, po_2, po_3, po_4, po_5, po_6, po_7, po_8, po_9, po_10, po_11, po_12,
      pso_1, pso_2
    } = req.body;
  
    console.log(req.body)
    const sql = `UPDATE copo_co_po SET 
      po_1 = ?, po_2 = ?, po_3 = ?, po_4 = ?, po_5 = ?, po_6 = ?, po_7 = ?, po_8 = ?, po_9 = ?, po_10 = ?, po_11 = ?, po_12 = ?, 
      pso_1 = ?, pso_2 = ? 
      WHERE co_id = ?;`;
  
    db.query(sql, [
      po_1, po_2, po_3, po_4, po_5, po_6, po_7, po_8, po_9, po_10, po_11, po_12,
      pso_1, pso_2,  co_id
    ], (err, result) => {
      if (err) {
        console.error("Error updating CO-PO records:", err);
        
        return res.status(500).json({ error: "Database error" });
      }
      
      return res.status(200).json(result);
    });
  };


  export const updateCopo_set_averages = expressAsyncHandler(async (req, res) => {
    const { uid } = req.params;
    const {averages} = req.body;
  
    // console.log("Averages:", averages, "UID:", uid);
  
    // SQL queries
    const checkSql = `SELECT idcopo_averages FROM copo_co_po_averages WHERE usercourse_id = ? AND isset = 0`;
    const updateSql = `
      UPDATE copo_co_po_averages 
      SET 
        po_1 = ?, 
        po_2 = ?, 
        po_3 = ?, 
        po_4 = ?, 
        po_5 = ?, 
        po_6 = ?, 
        po_7 = ?, 
        po_8 = ?, 
        po_9 = ?, 
        po_10 = ?, 
        po_11 = ?, 
        po_12 = ?, 
        pso_1 = ?, 
        pso_2 = ? 
      WHERE
        usercourse_id = ? AND isset = 0;
    `;
    const insertSql = `
      INSERT INTO copo_co_po_averages (
        po_1, po_2, po_3, po_4, po_5, po_6, po_7, po_8, po_9, po_10, po_11, po_12, pso_1, pso_2, usercourse_id, isset
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0);
    `;
  
    // Check if record exists and isset is 0
    const [result] = await db.promise().query(checkSql, [uid]);
  
    const values = [
      averages.po_1 || 0,
      averages.po_2 || 0,
      averages.po_3 || 0,
      averages.po_4 || 0,
      averages.po_5 || 0,
      averages.po_6 || 0,
      averages.po_7 || 0,
      averages.po_8 || 0,
      averages.po_9 || 0,
      averages.po_10 || 0,
      averages.po_11 || 0,
      averages.po_12 || 0,
      averages.pso_1 || 0,
      averages.pso_2 || 0,
      uid
    ];
  
    if (result.length > 0) {
      // Update the record
      try {
        await db.promise().query(updateSql, values);
        
        return res.status(200).json({ message: "CO-PO averages updated successfully." });
      } catch (updateError) {
        console.error("Error updating CO-PO records:", updateError);
        
        return res.status(500).json({ error: "Database error during update" });
      }
    } else {
      // Insert a new record
      try {
        await db.promise().query(insertSql, [...values, 0]);
        
        return res.status(201).json({ message: "CO-PO averages inserted successfully." });
      } catch (insertError) {
        console.error("Error inserting CO-PO records:", insertError);
        
        return res.status(500).json({ error: "Database error during insert" });
      }
    }
  });



  export const updateCopo_averages = expressAsyncHandler(async (req, res) => {
    const { uid } = req.params;
    const {averages} = req.body;
  
    // console.log("Averages:", averages, "UID:", uid);
  
    // SQL queries
    const checkSql = `SELECT idcopo_averages FROM copo_co_po_averages WHERE usercourse_id = ? AND isset = 0`;
    const updateSql = `
      UPDATE copo_co_po_averages 
      SET 
        po_1 = ?, 
        po_2 = ?, 
        po_3 = ?, 
        po_4 = ?, 
        po_5 = ?, 
        po_6 = ?, 
        po_7 = ?, 
        po_8 = ?, 
        po_9 = ?, 
        po_10 = ?, 
        po_11 = ?, 
        po_12 = ?, 
        pso_1 = ?, 
        pso_2 = ? 
      WHERE
        usercourse_id = ? AND isset = 0;
    `;
    const insertSql = `
      INSERT INTO copo_co_po_averages (
        po_1, po_2, po_3, po_4, po_5, po_6, po_7, po_8, po_9, po_10, po_11, po_12, pso_1, pso_2, usercourse_id, isset
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0);
    `;
  
    // Check if record exists and isset is 0
    const [result] = await db.promise().query(checkSql, [uid]);
  
    const values = [
      averages.po_1 || 0,
      averages.po_2 || 0,
      averages.po_3 || 0,
      averages.po_4 || 0,
      averages.po_5 || 0,
      averages.po_6 || 0,
      averages.po_7 || 0,
      averages.po_8 || 0,
      averages.po_9 || 0,
      averages.po_10 || 0,
      averages.po_11 || 0,
      averages.po_12 || 0,
      averages.pso_1 || 0,
      averages.pso_2 || 0,
      uid
    ];
  
    if (result.length > 0) {
      // Update the record
      try {
        await db.promise().query(updateSql, values);
        
        return res.status(200).json({ message: "CO-PO averages updated successfully." });
      } catch (updateError) {
        console.error("Error updating CO-PO records:", updateError);
        
        return res.status(500).json({ error: "Database error during update" });
      }
    } else {
      // Insert a new record
      try {
        await db.promise().query(insertSql, [...values, 0]);
        
        return res.status(201).json({ message: "CO-PO averages inserted successfully." });
      } catch (insertError) {
        console.error("Error inserting CO-PO records:", insertError);
        
        return res.status(500).json({ error: "Database error during insert" });
      }
    }
  });
  