import expressAsyncHandler from 'express-async-handler';
import {connection as db} from '../../config/dbConfig.js'; // Assuming your database connection is in this file

export const UploadFeedbackQuestions = expressAsyncHandler(async (req, res) => {
  try {
    const { userCourseId, curriculumId, questions } = req.body.submissionData;

    console.log(userCourseId, curriculumId, questions);

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
        INSERT INTO copo_upload_main (usercourseid, noofquestions, curriculum_no,maxmarks) 
        VALUES (?, ?, ?,3)
      `;
      db.query(uploadMainSql, [userCourseId, questions.length, curriculumId], (error, uploadMainResult) => {
        if (error) {
          console.error('Error inserting into upload_main:', error);
          
          return res.status(500).json({ message: 'Error inserting into upload_main' });
        }

        const uploadMainId = uploadMainResult.insertId; // Get the inserted upload_main ID

        // Loop through the questions and insert them into the question_main table
        let questionCount = 0;
        questions.forEach((question) => {
          const questionMainSql = `
            INSERT INTO copo_question_main (qname, qid,qmarks) 
            VALUES (?, ?,3)
          `;
          db.query(questionMainSql, [question.questionName, uploadMainId], (error, questionMainResult) => {
            if (error) {
              console.error('Error inserting into question_main:', error);
              
              return res.status(500).json({ message: 'Error inserting into question_main' });
            }

            const questionMainId = questionMainResult.insertId;

            // Insert data into co_main table for each CO associated with the question
            if (question.coNames && question.coNames.length > 0) {
              question.coNames.forEach((co) => {
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
              // After all questions are processed, return success
              
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


export const getFeedbackStatus = (req, res) => {
  const { usercourseid } = req.params;

  const sql = "SELECT status FROM copo_upload_main WHERE usercourseid = ? and curriculum_no = 17";
  db.query(sql, [usercourseid], (err, result) => {
    if (err) {
      console.error("Error fetching status:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: "Record not found" });
    }

    return res.status(200).json({ status: result[0].status });
  });
};


export const UpdateFeedbackStatus= (req, res) => {
  const { usercourseid } = req.params;
  const { newStatus } = req.body; // New status from frontend

  const sql = "UPDATE copo_upload_main SET status = ? WHERE usercourseid = ? and curriculum_no = 17";
  db.query(sql, [newStatus, usercourseid], (err, result) => {
    if (err) {
      console.error("Error updating status:", err);
      return res.status(500).json({ error: "Database update failed" });
    }

    return res.status(200).json({ success: true, newStatus });
  });
};