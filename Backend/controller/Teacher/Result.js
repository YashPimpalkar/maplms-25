import { connection as db } from "../../config/dbConfig.js";
import expressAsyncHandler from "express-async-handler";

// Fetch data for IA1
export const Ia1 = expressAsyncHandler(async (req, res) => {
  const  usercourseid  = req.params.uid;
//  console.log(usercourseid)
  const sql = `SELECT * FROM copo_attainment_table WHERE usercourse_id = ? AND curriculum_id = 1`;
  
  db.query(sql, [usercourseid], (err, results) => {
    if (err) {
      console.error("Error querying database:", err);
      
      return res.status(500).json({ error: "Internal server error" });
    }
    
    return res.status(200).json(results);
  });
});

// Fetch data for IA2
export const Ia2 = expressAsyncHandler(async (req, res) => {
  const  usercourseid  = req.params.uid;
  const sql = `SELECT * FROM copo_attainment_table WHERE usercourse_id = ? AND curriculum_id = 2`;
  
  db.query(sql, [usercourseid], (err, results) => {
    if (err) {
      console.error("Error querying database:", err);
      
      return res.status(500).json({ error: "Internal server error" });
    }
    
   return res.status(200).json(results);
  });
});

// Fetch data for Semester
export const Semester = expressAsyncHandler(async (req, res) => {
  const  usercourseid  = req.params.uid;
  const sql = `SELECT * FROM copo_attainment_table WHERE usercourse_id = ? AND curriculum_id = 3`;
  
  db.query(sql, [usercourseid], (err, results) => {
    if (err) {
      console.error("Error querying database:", err);
      
      return res.status(500).json({ error: "Internal server error" });
    }
    
    return res.status(200).json(results);
  });
});

// Fetch data for Term Work
export const TermWork = expressAsyncHandler(async (req, res) => {
  const  usercourseid  = req.params.uid;
  const sql = `SELECT * FROM copo_attainment_table WHERE usercourse_id = ? AND curriculum_id = 4`;
  
  db.query(sql, [usercourseid], (err, results) => {
    if (err) {
      console.error("Error querying database:", err);
      
      return res.status(500).json({ error: "Internal server error" });
    }
    
   return  res.status(200).json(results);
  });
});

// Fetch combined IA data
export const CombineIa = expressAsyncHandler(async (req, res) => {
  const  usercourseid  = req.params.uid;
  const sql = `SELECT * FROM copo_avg_ia_attainment_view WHERE usercourse_id = ?`;

  db.query(sql, [usercourseid], (err, results) => {
    if (err) {
      console.error("Error querying database:", err);
      
      return res.status(500).json({ error: "Internal server error" });
    }
    
    return res.status(200).json(results);
  });
});



export const Popso = async (req, res) => {
  const userCourseId = req.params.uid;

  // Check if the coId parameter is provided
  if (!userCourseId) {
    
      return res.status(400).json({ error: "Usercourse ID is required" });
  }

  const sql = `
    SELECT co_po.*, cos.usercourse_id 
    FROM copo_co_po as co_po
    JOIN copo_cos as cos ON co_po.co_id = cos.idcos
    WHERE cos.usercourse_id = ? AND 
    (po_1 IS NOT NULL OR po_2 IS NOT NULL OR po_3 IS NOT NULL OR 
     po_4 IS NOT NULL OR po_5 IS NOT NULL OR po_6 IS NOT NULL OR 
     po_7 IS NOT NULL OR po_8 IS NOT NULL OR po_9 IS NOT NULL OR 
     po_10 IS NOT NULL OR po_11 IS NOT NULL OR po_12 IS NOT NULL OR 
     pso_1 IS NOT NULL OR pso_2 IS NOT NULL OR pso_3 IS NOT NULL OR 
     pso_4 IS NOT NULL)
  `;

  try {
      const result = await new Promise((resolve, reject) => {
          db.query(sql, [userCourseId], (error, result) => {
              if (error) {
                  console.error('Error executing the query:', error);
                  reject(new Error('Internal server error'));
              } else {
                  resolve(result);
              }
          });
      });

      // Create the response based on the result from the database
      const response = result.map(row => ({
          co_id: row.co_id, // Return the CO ID directly
          po: [
              row.po_1, row.po_2, row.po_3, row.po_4, row.po_5,
              row.po_6, row.po_7, row.po_8, row.po_9, row.po_10,
              row.po_11, row.po_12
          ],
          pso: [
              row.pso_1, row.pso_2
          ],
          avg: row.avg
      }));
      
      return res.status(200).json(response);

  } catch (err) {
      console.error("Error fetching COs data:", err.message);
      
      return res.status(500).json({ error: "Error fetching COs data" });
  }
};


export const Feedback = expressAsyncHandler(async (req, res) => {
  const  usercourseid  = req.params.uid;
  const sql = `SELECT * FROM copo_attainment_table WHERE usercourse_id = ? AND curriculum_id = 5`;
  
  db.query(sql, [usercourseid], (err, results) => {
    if (err) {
      console.error("Error querying database:", err);
      
      return res.status(500).json({ error: "Internal server error" });
    }
    
    return res.status(200).json(results);
  });
});



export const StorePsodata = expressAsyncHandler(async (req, res) => {
  const { userCourseId, data } = req.body;

  // Loop through the data and prepare values for insertion or update
  const values = data.map((item) => [
    item.coname,
    ...item.poPso.map((entry) => (entry.value !== "-" ? parseFloat(entry.value) : null)),
    userCourseId,
  ]);

  // Use an array to collect promises for insert and update operations
  const promises = values.map(async (value) => {
    const coname = value[0];

    const checkQuery = `
      SELECT idco_po_result FROM copo_co_po_result WHERE usercourse_id = ? AND co_name = ?
    `;
    
    // Check if data for this userCourseId and coname exists
    const [checkResult] = await db.promise().query(checkQuery, [userCourseId, coname]);

    if (checkResult.length > 0) {
      // Data exists, perform an update
      const updateQuery = `
        UPDATE copo_co_po_result
        SET 
          po_1 = ?, po_2 = ?, po_3 = ?, po_4 = ?, po_5 = ?, po_6 = ?, 
          po_7 = ?, po_8 = ?, po_9 = ?, po_10 = ?, po_11 = ?, po_12 = ?, 
          pso_1 = ?, pso_2 = ?
        WHERE usercourse_id = ? AND co_name = ?
      `;
      
      await db.promise().query(updateQuery, [
        ...value.slice(1, 13), // PO values (indexes 1-12)
        ...value.slice(13, 15), // PSO values (indexes 13-14)
        userCourseId, 
        coname
      ]);

      console.log(`Data for ${coname} updated successfully!`);
    } else {
      // Data doesn't exist, perform an insert
      const insertQuery = `
        INSERT INTO copo_co_po_result (
          co_name, po_1, po_2, po_3, po_4, po_5, po_6, po_7, po_8, po_9, po_10, po_11, po_12, 
          pso_1, pso_2, usercourse_id
        ) VALUES ?
      `;
      
      await db.promise().query(insertQuery, [[value]]);
      console.log(`Data for ${coname} inserted successfully!`);
    }
  });

  try {
    // Wait for all insert or update operations to complete
    await Promise.all(promises);
    
   return  res.status(200).json({ message: "Data stored/updated successfully!" });
  } catch (err) {
    console.error("Error processing data:", err);
    
    return res.status(500).json({ error: "Failed to process data" });
  }
});





export const StorePsoAveragesResult= expressAsyncHandler(async (req, res) => {
  const { mergedAverages,userCourseId } = req.body;

  // Extract PO and PSO values from mergedAverages
  const poValues = [];
  const psoValues = [];

  // Loop through mergedAverages to organize PO and PSO values
  mergedAverages.poPso.forEach((item) => {
    if (item.type.startsWith("po_")) {
      const poIndex = parseInt(item.type.split("_")[1]) - 1; // Extract PO index (1-based to 0-based)
      poValues[poIndex] = parseFloat(item.value) || 0; // Set PO value or default to 0
    } else if (item.type.startsWith("pso_")) {
      const psoIndex = parseInt(item.type.split("_")[1]) - 1; // Extract PSO index (1-based to 0-based)
      psoValues[psoIndex] = parseFloat(item.value) || 0; // Set PSO value or default to 0
    }
  });
 console.log(userCourseId)
  // SQL queries
  const checkSql = `SELECT idcopo_averages FROM copo_co_po_averages WHERE usercourse_id = ? AND isset = 1`;
  const updateSql = `
    UPDATE copo_co_po_averages
    SET 
      po_1 = ?, po_2 = ?, po_3 = ?, po_4 = ?, po_5 = ?, po_6 = ?, po_7 = ?, po_8 = ?, po_9 = ?, po_10 = ?, po_11 = ?, po_12 = ?, 
      pso_1 = ?, pso_2 = ?
    WHERE usercourse_id = ? AND isset = 1;
  `;
  const insertSql = `
    INSERT INTO copo_co_po_averages (
      po_1, po_2, po_3, po_4, po_5, po_6, po_7, po_8, po_9, po_10, po_11, po_12, pso_1, pso_2, usercourse_id, isset
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1);
  `;

  // Check if record exists and isset is 0
  const [result] = await db.promise().query(checkSql, [userCourseId]);

  const values = [
    ...poValues,    // PO values po_1 to po_12
    ...psoValues,   // PSO values pso_1 to pso_2
    userCourseId,            // User course ID
  ];

  if (result.length > 0) {
    // If the record exists, update it
    try {
      await db.promise().query(updateSql, values);
      return res.status(200).json({ message: "CO-PO averages updated successfully." });
    } catch (updateError) {
      console.error("Error updating CO-PO records:", updateError);
      return res.status(500).json({ error: "Database error during update" });
    }
  } else {
    // If the record doesn't exist, insert a new one
    try {
      await db.promise().query(insertSql, values);
      return res.status(201).json({ message: "CO-PO averages inserted successfully." });
    } catch (insertError) {
      console.error("Error inserting CO-PO records:", insertError);
      return res.status(500).json({ error: "Database error during insert" });
    }
  }
});




export const storeCoResult = (req, res) => {
  const { coData, userCourseId } = req.body;

  if (!coData || !userCourseId) {
    return res.status(400).json({ message: "Invalid request data" });
  }

  // Loop through each CO data entry
  for (const co of coData) {
    const { coname, total } = co;

    // Check if the record already exists
    db.query(
      `SELECT * FROM copo_cos_result WHERE co_name = ? AND usercourse_id = ?`,
      [coname, userCourseId],
      (error, existingRecord) => {
        if (error) {
          console.error(error);
          return res.status(500).json({ message: "An error occurred while checking existing records." });
        }

        if (existingRecord.length > 0) {
          // If the record exists, update it
          db.query(
            `UPDATE copo_cos_result SET co_attainment = ? WHERE co_name = ? AND usercourse_id = ?`,
            [total, coname, userCourseId],
            (updateError, updateResult) => {
              if (updateError) {
                console.error(updateError);
                return res.status(500).json({ message: "An error occurred while updating the record." });
              }
            }
          );
        } else {
          // If the record doesn't exist, insert a new one
          db.query(
            `INSERT INTO copo_cos_result (co_name, co_attainment, usercourse_id) VALUES (?, ?, ?)`,
            [coname, total, userCourseId],
            (insertError, insertResult) => {
              if (insertError) {
                console.error(insertError);
                return res.status(500).json({ message: "An error occurred while inserting the record." });
              }
            }
          );
        }
      }
    );
  }

  res.status(200).json({ message: "CO result data stored successfully!" });
};




export const storeCoAttainmentResult = (req, res) => {
  const { TotalAttainment, userCourseId } = req.body;

  if (!TotalAttainment || !userCourseId) {
    return res.status(400).json({ message: "Invalid request data" });
  }

  // Check if the record already exists
  db.query(
    `SELECT * FROM copo_co_attainment WHERE usercourse_id = ?`,
    [userCourseId],
    (error, existingRecord) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ message: "An error occurred while checking existing records." });
      }

      if (existingRecord.length > 0) {
        // If the record exists, update it
        db.query(
          `UPDATE copo_co_attainment SET attainment = ? WHERE usercourse_id = ?`,
          [TotalAttainment, userCourseId],
          (updateError, updateResult) => {
            if (updateError) {
              console.error(updateError);
              return res.status(500).json({ message: "An error occurred while updating the record." });
            }

            // Send success response after updating
            return res.status(200).json({ message: "CO result data updated successfully!" });
          }
        );
      } else {
        // If the record doesn't exist, insert a new one
        db.query(
          `INSERT INTO copo_co_attainment (attainment, usercourse_id) VALUES (?, ?)`,
          [TotalAttainment, userCourseId],
          (insertError, insertResult) => {
            if (insertError) {
              console.error(insertError);
              return res.status(500).json({ message: "An error occurred while inserting the record." });
            }

            // Send success response after insertion
            return res.status(200).json({ message: "CO result data inserted successfully!" });
          }
        );
      }
    }
  );
};



