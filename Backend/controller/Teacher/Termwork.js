import { connection as db } from "../../config/dbConfig.js";
import expressAsyncHandler from "express-async-handler";
// Fetch termwork data (twbody) from the database
export const fetchTermworkLabels = (req, res) => {
  const userCourseId = req.params.userCourseId;

  // Query to get all termwork labels from termworkbase
  const getAllLabelsQuery = "SELECT twid, twbody FROM copo_termworkbase";

  // Query to get the selected twid for the given userCourseId from termwork_table
  const getSelectedTwidQuery =
    "SELECT tw_id FROM copo_termwork_table WHERE usercourseid = ?";

  // Execute both queries using Promises
  db.query(getAllLabelsQuery, (error, allLabelsResults) => {
    if (error) {
      
      return res
        .status(500)
        .json({ message: "Error fetching termwork data", error });
    }

    // Get the selected twid if exists in the termwork_table
    db.query(
      getSelectedTwidQuery,
      [userCourseId],
      (error, selectedTwidResults) => {
        if (error) {
          
          return res
            .status(500)
            .json({ message: "Error fetching selected termwork", error });
        }

        const selectedTwid =
          selectedTwidResults.length > 0 ? selectedTwidResults[0].tw_id : null;

        // Return both the termwork labels and the selected twid (if any)
        
      res.status(200).json({ labels: allLabelsResults, selectedTwid });
      }
    );
  });
};

export const submitTermworkId =expressAsyncHandler( async(req, res) => {
  const { userCourseId, tw_id } = req.body;

  // Check if the userCourseId already exists in the termwork_table
  const checkSql = "SELECT * FROM copo_termwork_table WHERE usercourseid = ?";
  db.query(checkSql, [userCourseId], (error, results) => {
    if (error) {
      
      return res.status(500).json({ message: "Database error", error });
    }

    if (results.length > 0) {
      // If it exists, update the tw_id
      const updateSql =
        "UPDATE copo_termwork_table SET tw_id = ? WHERE usercourseid = ?";
      db.query(updateSql, [tw_id, userCourseId], (updateError) => {
        if (updateError) {
          
          return res
            .status(500)
            .json({ message: "Failed to update termwork", error: updateError });
        }
        
        return res
          .status(200)
          .json({ updated: true, message: "Termwork updated successfully!" });
      });
    } else {
      // If it doesn't exist, insert a new record
      const insertSql =
        "INSERT INTO copo_termwork_table (tw_id, usercourseid) VALUES (?, ?)";
      db.query(insertSql, [tw_id, userCourseId], (insertError) => {
        if (insertError) {
          
          return res
            .status(500)
            .json({ message: "Failed to insert termwork", error: insertError });
        }
        
        return res
          .status(200)
          .json({ success: true, message: "Termwork saved successfully!" });
      });
    }
  });
});

export const getTermworkData = expressAsyncHandler(async(req, res) => {
  const { usercourseid } = req.params;
  console.log(usercourseid);
  // Check if there's a TW ID in the termwork_table for the given usercourse_id
  const sqlTermwork = "SELECT tw_id FROM copo_termwork_table WHERE usercourseid = ?";
  db.query(sqlTermwork, [usercourseid], (error, termworkResult) => {
    if (error) {
      console.error("Error fetching termwork ID:", error);
      
      return res.status(500).json({ error: "Internal server error" });
    }

    // If no TW ID exists, return an error
    console.log(termworkResult);
    if (!termworkResult.length || !termworkResult[0].tw_id) {
      
      return res.status(400).json({ error: "Term work not selected" });
    }

    const twid = termworkResult[0].tw_id;
    console.log(twid);
    // Fetch the corresponding data from termworkbase_table using the twid
    const sqlTermworkBase = "SELECT * FROM copo_termworkbase WHERE twid = ?";
    db.query(sqlTermworkBase, twid, (error, termworkBaseResult) => {
      if (error) {
        console.error("Error fetching termwork base data:", error);
        
        return res.status(500).json({ error: "Internal server error" });
      }

      if (!termworkBaseResult.length) {
        
        return res
          .status(404)
          .json({ error: "No termwork data found for the given TW ID" });
      }
      console.log(termworkBaseResult);
      // Send the termwo rk base data to the frontend
      
     return res.status(200).json(termworkBaseResult);
    });
  });
});

export const get_curriculum = expressAsyncHandler(async(req, res) => {
  const sql = "select * from copo_curriculum";
  db.query(sql, (error, result) => {
    if (error) {
      console.error("Error fetching termwork base data:", error);
      
      return res.status(500).json({ error: "Internal server error" });
    }
    
   return  res.status(200).json(result);
  });
});

export const get_termworkbasetable = expressAsyncHandler(async(req, res) => {
    const sql = "select * from copo_termworkbase";
    db.query(sql, (error, result) => {
      if (error) {
        console.error("Error fetching termwork base data:", error);
        
        return res.status(500).json({ error: "Internal server error" });
      }
      
     return res.status(200).json(result);
    });
  });



 // Assuming your db connection is here
 export const UploadQuestions = expressAsyncHandler(async (req, res) => {
  try {
    // If the request body is a stringified JSON, parse it
    const { t_id, userCourseId, curriculumId, questions ,maxMarksAll} = req.body.submissionData;
   
    console.log(userCourseId, curriculumId, questions,maxMarksAll ,t_id);
   

    // Validate required data
    if (!userCourseId || !curriculumId || !questions || !Array.isArray(questions)) {
      
      return res.status(400).json({ message: 'Invalid data provided' });
    }

    // Check if the combination of userCourseId and curriculumId already exists in upload_main table
    const checkExistingSql = `
      SELECT idupload_main FROM copo_upload_main 
      WHERE usercourseid = ? AND curriculum_no = ?
    `;
    db.query(checkExistingSql, [userCourseId, curriculumId], (error, existingResult) => {
      if (error) {
        console.error('Error checking existing data:', error);
        
        return res.status(500).json({ message: 'Error checking existing data' });
      }

      // If a record is found, return an error that the data already exists
      if (existingResult.length > 0) {
        
        return res.status(400).json({ message: 'Data already exists for the given userCourseId and curriculumId' });
      }

      // Insert into upload_main table if no existing record
      const uploadMainSql = `
        INSERT INTO copo_upload_main (usercourseid, noofquestions, curriculum_no, maxmarks) 
        VALUES (?, ?, ?, ?)
      `;
      // const maxMarks = questions.reduce((sum, q) => sum + q.maxMarks, 0); // Calculate total max marks
      db.query(uploadMainSql, [userCourseId, questions.length, curriculumId, maxMarksAll], (error, uploadMainResult) => {
        if (error) {
          console.error('Error inserting into upload_main:', error);
          
          return res.status(500).json({ message: 'Error inserting into upload_main' });
        }

        const uploadMainId = uploadMainResult.insertId; // Get the inserted upload_main ID

        // Loop through the questions and insert them into the question_main table
        let questionCount = 0;
        questions.forEach((question) => {
          const questionMainSql = `
            INSERT INTO copo_question_main (qname, qid,qmarks,t_id) 
            VALUES (?, ?,?,?)
          `;
          db.query(questionMainSql, [question.questionName, uploadMainId,question.maxMarks,t_id], (error, questionMainResult) => {
            if (error) {
              console.error('Error inserting into question_main:', error);
              
              return res.status(500).json({ message: 'Error inserting into question_main' });
            }

            const questionMainId = questionMainResult.insertId;

            // Insert data into co_main table for each CO associated with the question
            if (question.cos && question.cos.length > 0) {
              question.cos.forEach((co) => {
                const coMainSql = `
                  INSERT INTO copo_co_main (coname, co_id) 
                  VALUES (?, ?)
                `;
                db.query(coMainSql, [co, questionMainId], (error, coMainResult) => {
                  if (error) {
                    console.error('Error inserting into co_main:', error);
                    
                    return res.status(500).json({ message: 'Error inserting into co_main' });
                  }
                });
              });
            }

            questionCount++;
            if (questionCount === questions.length) {
              // After all questions are processed, commit the transaction
              
              return res.status(200).json({ message: 'Questions uploaded successfully' });
            }
          });
        });
      });
    });
  } catch (error) {
    console.error('Error uploading questions:', error);
    
    return res.status(500).json({ message: 'Internal server error' });
  }
});



export const GetStudentMarks = (req, res) => {
  const { userCourseId, selectedCurriculumId } = req.query;

  // Define the SQL query to call the stored procedure
  const sql = 'CALL copo_GetStudentMarks(?, ?)';
  const params = [userCourseId, selectedCurriculumId];

  // Execute the query with callback
  db.query(sql, params, (error, results, fields) => {
    if (error) {
      console.error(error);
      // Send a 500 error response with the error message
      
      return res.status(500).json({ message: 'An error occurred', error: error.message });
    }
 
    // Send the result as a response (assuming the first row contains the result)
   return  res.status(200).json(results[0]);
  });
};


export const GetQuestionsAndCos = (req,res) =>{

  const { userCourseId, selectedCurriculumId } = req.query;
  const sql = `SELECT 
    um.maxmarks,
    qm.idquestion_main,
    qm.qname,
    qm.qmarks,
    cm.coname
FROM 
    copo_upload_main AS um
JOIN 
    copo_question_main AS qm 
    ON um.idupload_main = qm.qid
JOIN 
    copo_co_main AS cm 
    ON qm.idquestion_main = cm.co_id
WHERE 
    um.usercourseid = ? AND 
    um.curriculum_no = ?;
`

const params = [userCourseId, selectedCurriculumId];

// Execute the query with callback
db.query(sql, params, (error, results, fields) => {
  if (error) {
    console.error(error);
    // Send a 500 error response with the error message
    
    return res.status(500).json({ message: 'An error occurred', error: error.message });
  }
  console.log(results)

  // Send the result as a response (assuming the first row contains the result)
  
  res.status(200).json(results);
});
}
export const UpdateSingleRowMarks = expressAsyncHandler(async (req, res) => {
  const { sid, marksWithQuestionId, t_id } = req.body.updatedRow;

  console.log("Received data:", sid, marksWithQuestionId);

  if (!sid || !Array.isArray(marksWithQuestionId)) {
    return res.status(400).json({ error: "Invalid input data" });
  }

  const isValidMark = (value) => {
    const trimmedValue = value.trim();
    const isNotBlank = trimmedValue !== "";
    const isNumeric = !isNaN(trimmedValue) && Number(trimmedValue) >= 0;
    const isValidString = trimmedValue === "N" || trimmedValue === "A";

    return isNotBlank && (isNumeric || isValidString);
  };

  for (const { marks } of marksWithQuestionId) {
    if (!isValidMark(marks)) {
      return res.status(400).json({ error: "Invalid marks input detected" });
    }
  }

  try {
    for (const { idquestion_main, marks } of marksWithQuestionId) {
      // Check if the row exists
      const checkQuery = `
        SELECT * FROM copo_table_main
        WHERE sid = ? AND idquestion = ? AND t_id = ?
      `;
      const [existingRow] = await db.promise().query(checkQuery, [sid, idquestion_main, t_id]);

      if (existingRow.length === 0) {
        return res.status(400).json({ error: "Invalid marks or teacher ID" });
      }

      // Update the marks
      const updateQuery = `
        UPDATE copo_table_main
        SET marks = ?
        WHERE sid = ? AND idquestion = ? AND t_id = ?
      `;
      await db.promise().query(updateQuery, [marks, sid, idquestion_main, t_id]);
    }

    console.log("All queries executed successfully.");
    res.status(200).json({ message: "Marks updated successfully" });
  } catch (error) {
    console.error("Error updating marks:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});




export const WithOutCosdata = (req,res) =>{
  const { userCourseId, selectedCurriculumId } = req.query;
  const sql = `SELECT 
    um.maxmarks,
    qm.idquestion_main,
    qm.qname,
    qm.qmarks
FROM 
    copo_upload_main AS um
JOIN 
    copo_question_main AS qm 
    ON um.idupload_main = qm.qid
WHERE 
    um.usercourseid = ? AND 
    um.curriculum_no = ?;
`

const params = [userCourseId, selectedCurriculumId];

// Execute the query with callback
db.query(sql, params, (error, results, fields) => {
  if (error) {
    console.error(error);
    // Send a 500 error response with the error message
    
    return res.status(500).json({ message: 'An error occurred', error: error.message });
  }
  console.log(results)

  // Send the result as a response (assuming the first row contains the result)
  
  res.status(200).json(results);
});
}



// export const importExcelMarks = expressAsyncHandler(async (req, res) => {
//   try {
//     const { updates,t_id } = req.body;

//     // Input validation
//     if (!updates || !Array.isArray(updates)) {
      
//       return res
//         .status(400)
//         .json({ message: "Invalid input: 'updates' must be an array." });
//     }

//     const sql = `UPDATE copo_table_main SET marks = ? WHERE idquestion = ? AND sid = ? AND t_id = ?`;

//     // Prepare the queries for batch execution
//     const promises = updates.map(({ idquestion, sid, marks }) => {
//       return new Promise((resolve, reject) => {
//         db.query(sql, [marks, idquestion, sid], (error, result) => {
//           if (error) {
//             reject(error);
//           } else {
//             resolve(result);
//           }
//         });
//       });
//     });

//     // Execute all queries in parallel
//     await Promise.all(promises);
    
//     return res.status(200).json({ message: "Marks updated successfully." });
//   } catch (error) {
//     console.error("Error updating marks:", error);
    
//     return res.status(500).json({ message: "Internal server error.", error: error.message });
//   }
// });



export const importExcelMarks = expressAsyncHandler(async (req, res) => {
  try {
    const { updates, t_id } = req.body;

    // Input validation
    if (!updates || !Array.isArray(updates)) {
      return res
        .status(400)
        .json({ message: "Invalid input: 'updates' must be an array." });
    }

    const checkSql = `SELECT COUNT(*) AS count FROM copo_table_main WHERE idquestion = ? AND sid = ? AND t_id = ?`;
    const updateSql = `UPDATE copo_table_main SET marks = ? WHERE idquestion = ? AND sid = ? AND t_id = ?`;

    // Prepare the queries for batch execution
    const promises = updates.map(({ idquestion, sid, marks }) => {
      return new Promise((resolve, reject) => {
        // First, check if the row exists
        db.query(checkSql, [idquestion, sid, t_id], (checkError, checkResult) => {
          if (checkError) {
            reject(checkError);
          } else if (checkResult[0].count > 0) {
            // If row exists, update it
            db.query(updateSql, [marks, idquestion, sid, t_id], (updateError, updateResult) => {
              if (updateError) {
                reject(updateError);
              } else {
                resolve(updateResult);
              }
            });
          } else {
            // Skip updating if the row does not exist
            resolve({ message: `Row with idquestion ${idquestion} and sid ${sid} does not exist. Skipping.` });
          }
        });
      });
    });

    // Execute all queries in parallel
    const results = await Promise.all(promises);

    return res.status(200).json({ message: "Marks update process completed.", details: results });
  } catch (error) {
    console.error("Error updating marks:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
});


export const fetchTermwork = (req, res) => {
  const usercourseid = req.params.uid;

  const sql = `
    SELECT 
      t.tid, 
      t.tw_id, 
      t.usercourseid, 
      b.twbody 
    FROM 
      copo_termwork_table AS t
    INNER JOIN 
      copo_termworkbase AS b 
    ON 
      t.tw_id = b.twid 
    WHERE 
      t.usercourseid = ?`;

  db.query(sql, [usercourseid], (error, results) => {
    if (error) {
      console.error("Error querying database:", error);
      
      return res.status(500).json({ message: "Internal server error" });
    }

    if (results.length > 0) {
      
      return res.status(200).json(results);
    } else {
      
      return res.status(200).json({ message: "No data available" });
    }
  });
};

