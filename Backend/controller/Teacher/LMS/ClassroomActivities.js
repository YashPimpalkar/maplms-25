import { connection as db } from "../../../config/dbConfig.js";
import path from "path";
import multer from "multer";

// import { fileURLToPath } from 'url';
// import { dirname, resolve } from 'path';

// Configure multer for file uploads
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// Set up storage configuration for Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(path.resolve(), 'uploads/activities')); // Save files in uploads/activities folder
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}-${file.originalname}`);
  }
});

// Multer middleware for handling multiple files
const upload = multer({ storage }).array('files', 10); // Allow up to 10 files

// Controller to handle the creation of a new activity
export const createActivity = (req, res) => {

  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      
      return res.status(400).json({ message: 'Multer error while uploading files', error: err });
    } else if (err) {
      
      return res.status(500).json({ message: 'Server error while uploading files', error: err });
    }

    // Extract form data from the request
    const { title, description, max_file_size, deadline, file_type_allowed, teacher_id } = req.body;
    const { classroom_id } = req.params;


    const checkClassroomQuery = `SELECT 
    cuc.usercourse_id, 
    cuc.course_id, 
    cuc.semester, 
    cuc.academic_year, 
    cuc.branch, 
    cuc.co_count, 
    cuc.created_at,
    cuu.user_id
FROM copo_user_course cuc
JOIN copo_usercourse_users cuu 
    ON cuc.usercourse_id = cuu.usercourse_id
WHERE ( cuu.usercourse_id = ? AND cuu.user_id = ? );
`;
    const list = [classroom_id,teacher_id]
    db.query(checkClassroomQuery, list, (err, results) => {
      if (err) {
        console.error('Database error:', err);
        
        return res.status(500).json({ message: 'Database error' });
      }
      console.log(results);
  
      // If no matching record is found, return error
      if (results.length === 0) {
        
        return res.status(403).json({ message: 'Invalid teacher or classroom' });
      } 
   
    // Insert new activity data into the database
    const insertActivityQuery = `
      INSERT INTO copo_lmsactivities (classroom_id, teacher_id, title, description, file_type_allowed, max_file_size, deadline)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const fileTypeArray = JSON.parse(file_type_allowed).join(',');; // Convert the file types from JSON string
  


    db.query(insertActivityQuery, [classroom_id, teacher_id, title, description, fileTypeArray, max_file_size, deadline], (err, result) => {
      if (err) {
        console.error('Error inserting activity:', err);
        
        return res.status(500).json({ message: 'Failed to create activity' });
      }
      
      const activityId = result.insertId; // Get the newly created activity's ID

      // Check if files were uploaded
      if (req.files && req.files.length > 0) {
        const files = req.files.map((file) => [
          activityId,                      // activity_id (foreign key)
          file.originalname,               // file_name
          file.mimetype,                   // file_type
          file.size,                       // file_size
          `/uploads/activities/${file.filename}`, // file_path
        ]);
        console.log(files)
        // Insert file data into the database
        const insertFileQuery = `
          INSERT INTO copo_lms_activities_file (assignment_id, file_name, file_type, file_size, file_path)
          VALUES ?
        `;

        db.query(insertFileQuery, [files], (err, fileResult) => {
          if (err) {
            console.error('Error inserting file details:', err);
            
            return res.status(500).json({ message: 'Failed to save file details' });
          }
          
          return res.status(201).json({
            message: 'Activity and files created successfully',
            activityId
          });
        });
        
      } else {
        // No files uploaded, return success
        
        return res.status(201).json({
          message: 'Activity created successfully',
          activityId
        });
      }
    });
})
  });
};

export const getActivitiesByClassroom = (req, res) => {
    const { classroom_id } = req.params;
  
    // Query to fetch activities and related file details for the given classroom
    const query = `
      SELECT 
        a.assignment_id, a.title, a.description, a.file_type_allowed, a.max_file_size, 
        a.created_at, a.deadline,f.file_id, f.file_name, f.file_type, f.file_size, f.file_path, f.uploaded_date
      FROM copo_lmsactivities a
      LEFT JOIN copo_lms_activities_file f ON a.assignment_id = f.assignment_id
      WHERE a.classroom_id = ?
    `;
  
    db.query(query, [classroom_id], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        
        return res.status(500).json({ message: 'Database error' });
      }
  
      // Process the results to map files to their assignments
      const activities = [];
      
      // Using a Map to group files by assignment_id
      const activityMap = new Map();
  
      results.forEach(activity => {
        const assignmentId = activity.assignment_id;
  
        // Check if the assignment already exists in the map
        if (!activityMap.has(assignmentId)) {
          // Create a new entry for the assignment
          activityMap.set(assignmentId, {
            assignment_id: assignmentId,
            title: activity.title,
            description: activity.description,
            file_type_allowed: activity.file_type_allowed,
            max_file_size: activity.max_file_size,
            created_at: activity.created_at,
            deadline: activity.deadline,
            files: [] // Initialize an empty array for files
          });
        }
  
        // Add the file details to the files array
        if (activity.file_name) {
          activityMap.get(assignmentId).files.push({
            file_id:activity.file_id,
            file_name: activity.file_name,
            file_type: activity.file_type,
            file_size: activity.file_size,
            file_path: activity.file_path,
            uploaded_date: activity.uploaded_date
          });
        }
      });
  
      // Convert the Map back to an array
      activities.push(...activityMap.values());
  
      // Send the results back as JSON
      
      return res.json(activities);
    });
  };
  

// Adjust the path to your database module as needed
  
// Adjust the import path as necessary

export const downloadFile = (req, res) => {
    const { fileId } = req.params; // Extract fileId from request parameters
    console.log(`Received request to download file with ID: ${fileId}`); // Log the received fileId

    // Query to get the file path, file name, and file type by file_id
    const query = 'SELECT file_path, file_name, file_type FROM copo_lms_activities_file WHERE file_id = ?';

    db.query(query, [fileId], (err, results) => {
        if (err) {
            console.error('Database error:', err); 
            // Log database errors
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.length === 0) {
            console.warn(`File with ID ${fileId} not found`);
             // Warn if file not found
            return res.status(404).json({ message: 'File not found' });
        }

        // Destructure the result to get file details
        const { file_path: filePath, file_name: fileName, file_type: fileType } = results[0];
        console.log(`Found file details - Path: ${filePath}, Name: ${fileName}, Type: ${fileType}`); // Log file details

        // Clean and construct the full file path
        const cleanedFilePath = filePath.replace(/^\//, ''); // Remove leading slash if exists
        const fullFilePath = path.resolve(process.cwd(), cleanedFilePath); // Use process.cwd() for a dynamic base path

        console.log('Full file path:', fullFilePath); // Log the full file path for debugging

        // Attempt to send the file to the client
        
       return res.status(200).sendFile(fullFilePath, 
          { 
            headers: { 
              'Content-Type': fileType || 'application/octet-stream', // Set the appropriate content type; default to binary
              'Content-Disposition': `inline; filename="${fileName}"` // 'inline' displays the file in the browser
          } 
        },
         (err) => {
            if (err) {
                console.error('Error serving file:', err); 
                // Log errors if the file fails to send
                return res.status(500).json({ message: 'Error serving file' });
            } else {
              
                console.log(`File ${fileName} sent successfully`); // Log success
            }
        });
    });
};


export const loadFile = (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(process.cwd(), 'documents', filename); // Adjust path as needed

    res.download(filePath,filename, err => {
        if (err) {
            console.error(err);
            
          return  res.status(404).send('File not found');
        }

    });
};


 // Import the database connection pool

// Controller function to get submissions by assignment ID
export const getSubmissionsByAssignment = async (req, res) => {
  const { assignmentId } = req.params;

  const query = `
    SELECT 
      s.submission_id,
      s.classroom_id,
      s.student_id,
      st.student_name,
      st.stud_clg_id,
      s.submitted_at,
      s.is_late,
      s.marks,
      s.message_to_teacher,
      sf.file_id,
      sf.file_name,
      sf.file_type,
      sf.file_size,
      sf.uploaded_date,
      sf.file_path
    FROM 
      copo_submissions s
    LEFT JOIN 
      copo_submissions_file sf ON s.submission_id = sf.submission_id
    LEFT JOIN 
      copo_copo_students_details st ON s.student_id = st.sid
    WHERE 
      s.assignment_id = ?
    ORDER BY 
      s.submitted_at DESC;
  `;

  db.query(query, [assignmentId], (error, results) => {
    if (error) {
      console.error('Error fetching submissions:', error);
      
      return res.status(500).json({ message: 'Internal server error', error });
    }

    // Organize files into an array under each submission
    const submissions = [];
    const submissionsMap = new Map();

    results.forEach(row => {
      // Check if the submission already exists in the map
      let submission = submissionsMap.get(row.submission_id);

      // If the submission does not exist, create a new one
      if (!submission) {
        submission = {
          submission_id: row.submission_id,
          classroom_id: row.classroom_id,
          student_id: row.student_id,
          student_name: row.student_name,
          stud_clg_id: row.stud_clg_id,
          submitted_at: row.submitted_at,
          is_late: row.is_late,
          marks: row.marks,
          message_to_teacher: row.message_to_teacher,
          files: []
        };
        submissionsMap.set(row.submission_id, submission);
        submissions.push(submission);
      }

      // Add file to the files array if it exists
      if (row.file_id) {
        submission.files.push({
          file_id: row.file_id,
          file_name: row.file_name,
          file_type: row.file_type,
          file_size: row.file_size,
          uploaded_date: row.uploaded_date,
          file_path: row.file_path
        });
      }
    });
    
   return  res.status(200).json(submissions);
  });
};





// controllers/activityController.js

// Function to get activity details based on teacherId
export const getActivityDetails = async (req, res) => {
  const { assignmentId } = req.params;

  try {
    // Define raw SQL query
    const query = `
      SELECT 
        users.teacher_name,
        classroom.room_name,
        lmsactivities.classroom_id,
        lmsactivities.title
      FROM 
        copo_lmsactivities as lmsactivities
      JOIN 
        copo_classroom as classroom  ON lmsactivities.classroom_id = classroom.classroom_id
      JOIN 
        copo_users as users ON lmsactivities.teacher_id = users.userid
      WHERE 
        lmsactivities.assignment_id = ?
    `;

    // Execute the query with the assignmentId parameter
    db.query(query, [assignmentId], (error, results) => {
      if (error) {
        console.error("Error fetching activities:", error);
        
        return res.status(500).json({
          success: false,
          message: "Error fetching activities",
        });
      }

      // Return the result
      
      res.status(200).json(results);
    });
  } catch (error) {
    console.error("Error:", error);
    
   return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


export const createQuizForm = (req, res) => {
  const { title,uid,classroomId,questions} = req.body;
  console.log(req.body);

  if (!title || !uid || !classroomId || !questions) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  // Insert form into `copo_quiz_forms`
  const formSql =
    "INSERT INTO copo_quiz_forms (title, uid, classroom_id) VALUES (?, ?, ?)";
  db.query(formSql, [title, uid, classroomId], (err, formResult) => {
    if (err) {
      console.error("Error inserting form:", err);
      return res.status(500).json({ message: "Database Error" });
    }

    const formId = formResult.insertId;

    // Insert questions
    questions.forEach((question) => {
      const { text, type, marks, options, correctAnswers } = question;
      const questionSql =
        "INSERT INTO copo_quiz_questions (form_id, text, type, marks) VALUES (?, ?, ?, ?)";
      db.query(
        questionSql,
        [formId, text, type, marks],
        (err, questionResult) => {
          if (err) {
            console.error("Error inserting question:", err);
            return;
          }

          const questionId = questionResult.insertId;
          let optionIds = [];

          // Insert options
          options.forEach((optionText, index) => {
            const optionSql =
              "INSERT INTO copo_quiz_options (question_id, option_text) VALUES (?, ?)";
            db.query(optionSql, [questionId, optionText], (err, optionResult) => {
              if (err) {
                console.error("Error inserting option:", err);
                return;
              }

              optionIds[index] = optionResult.insertId;

              // Insert correct answers
              if (correctAnswers.includes(index)) {
                const answerSql =
                  "INSERT INTO copo_quiz_correct_answers (question_id, option_id) VALUES (?, ?)";
                db.query(
                  answerSql,
                  [questionId, optionIds[index]],
                  (err) => {
                    if (err) {
                      console.error("Error inserting correct answer:", err);
                    }
                  }
                );
              }
            });
          });
        }
      );
    });

    res
      .status(201)
      .json({ message: "Quiz form created successfully!", formId });
  });
};


// export const getQuizzes = (req, res) => {
//   const { classroomId,sid } = req.params;

//   if (!classroomId) {
//     return res.status(400).json({ message: "Classroom ID is required!" });
//   }

//   // Fetch all forms (quizzes) for the given classroom
//   const formSql = "SELECT * FROM copo_quiz_forms WHERE classroom_id = ?";
//   db.query(formSql, [classroomId], (err, forms) => {
//     if (err) {
//       console.error("Error fetching forms:", err);
//       return res.status(500).json({ message: "Database Error" });
//     }

//     if (forms.length === 0) {
//       return res.status(404).json({ message: "No quizzes found!" });
//     }

//     let quizzes = [];

//     // Process each form to fetch its questions
//     let formProcessed = 0;
//     forms.forEach((form) => {
//       const quiz = {
//         formId: form.form_id,
//         title: form.title,
//         uid: form.uid,
//         classroomId: form.classroom_id,
//         createdAt: form.created_at,
//         questions: [],
//       };

//       const questionSql = "SELECT * FROM copo_quiz_questions WHERE form_id = ?";
//       db.query(questionSql, [form.form_id], (err, questions) => {
//         if (err) {
//           console.error("Error fetching questions:", err);
//           return;
//         }

//         let questionProcessed = 0;

//         if (questions.length === 0) {
//           quizzes.push(quiz);
//           formProcessed++;
//           if (formProcessed === forms.length) {
//             res.status(200).json(quizzes);
//           }
//           return;
//         }

//         questions.forEach((question) => {
//           const questionObj = {
//             questionId: question.question_id,
//             text: question.text,
//             type: question.type,
//             marks: question.marks,
//             options: [],
//             correctAnswers: [],
//           };

//           const optionSql =
//             "SELECT * FROM copo_quiz_options WHERE question_id = ?";
//           db.query(optionSql, [question.question_id], (err, options) => {
//             if (err) {
//               console.error("Error fetching options:", err);
//               return;
//             }

//             questionObj.options = options.map((opt) => ({
//               optionId: opt.option_id,
//               text: opt.option_text,
//             }));

//             const answerSql =
//               "SELECT option_id FROM copo_quiz_correct_answers WHERE question_id = ?";
//             db.query(answerSql, [question.question_id], (err, correctAnswers) => {
//               if (err) {
//                 console.error("Error fetching correct answers:", err);
//                 return;
//               }

//               questionObj.correctAnswers = correctAnswers.map(
//                 (ans) => ans.option_id
//               );

//               quiz.questions.push(questionObj);
//               questionProcessed++;

//               if (questionProcessed === questions.length) {
//                 quizzes.push(quiz);
//                 formProcessed++;

//                 if (formProcessed === forms.length) {
//                   res.status(200).json(quizzes);
//                 }
//               }
//             });
//           });
//         });
//       });
//     });
//   });
// };


export const getQuizzes = (req, res) => {
  const { classroomId, sid } = req.params;

  if (!classroomId || !sid) {
    return res.status(400).json({ message: "Classroom ID and Student ID are required!" });
  }

  // Fetch all forms that the student has NOT attempted
  const formSql = `
    SELECT * FROM copo_quiz_forms cqf
    WHERE cqf.classroom_id = ? 
    AND cqf.form_id NOT IN (
      SELECT form_id FROM copo_quiz_students_forms WHERE sid = ? AND classroom_id = ?
    )
  `;

  db.query(formSql, [classroomId, sid, classroomId], (err, forms) => {
    if (err) {
      console.error("Error fetching forms:", err);
      return res.status(500).json({ message: "Database Error" });
    }

    if (forms.length === 0) {
      return res.status(404).json({ message: "No quizzes available!" });
    }

    let quizzes = [];
    let formProcessed = 0;

    forms.forEach((form) => {
      const quiz = {
        formId: form.form_id,
        title: form.title,
        uid: form.uid,
        classroomId: form.classroom_id,
        createdAt: form.created_at,
        questions: [],
      };

      const questionSql = "SELECT * FROM copo_quiz_questions WHERE form_id = ?";
      db.query(questionSql, [form.form_id], (err, questions) => {
        if (err) {
          console.error("Error fetching questions:", err);
          return;
        }

        let questionProcessed = 0;

        if (questions.length === 0) {
          quizzes.push(quiz);
          formProcessed++;
          if (formProcessed === forms.length) {
            res.status(200).json(quizzes);
          }
          return;
        }

        questions.forEach((question) => {
          const questionObj = {
            questionId: question.question_id,
            text: question.text,
            type: question.type,
            marks: question.marks,
            options: [],
            correctAnswers: [],
          };

          const optionSql = "SELECT * FROM copo_quiz_options WHERE question_id = ?";
          db.query(optionSql, [question.question_id], (err, options) => {
            if (err) {
              console.error("Error fetching options:", err);
              return;
            }

            questionObj.options = options.map((opt) => ({
              optionId: opt.option_id,
              text: opt.option_text,
            }));

            const answerSql = "SELECT option_id FROM copo_quiz_correct_answers WHERE question_id = ?";
            db.query(answerSql, [question.question_id], (err, correctAnswers) => {
              if (err) {
                console.error("Error fetching correct answers:", err);
                return;
              }

              questionObj.correctAnswers = correctAnswers.map((ans) => ans.option_id);
              quiz.questions.push(questionObj);
              questionProcessed++;

              if (questionProcessed === questions.length) {
                quizzes.push(quiz);
                formProcessed++;

                if (formProcessed === forms.length) {
                  res.status(200).json(quizzes);
                }
              }
            });
          });
        });
      });
    });
  });
};




export const insertQuizStudentForm = (req, res) => {
    const { form_id, classroomId, sid, score } = req.body;

    if (!form_id || !classroomId || !sid || score === undefined) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    if (!Array.isArray(form_id)) {
        return res.status(400).json({ message: "form_id should be an array" });
    }

    form_id.forEach((id) => {
        // Check if the record already exists
        const checkSql = "SELECT * FROM copo_quiz_students_forms WHERE form_id = ? AND classroom_id = ? AND sid = ?";
        const checkValues = [id, classroomId, sid];

        db.query(checkSql, checkValues, (checkError, checkResult) => {
            if (checkError) {
                console.error("Error checking data:", checkError);
                return res.status(500).json({ message: "Internal Server Error" });
            }

            if (checkResult.length > 0) {
                console.log(`Record already exists for form_id: ${id}, classroom_id: ${classroomId}, sid: ${sid}`);
                return; // Skip insertion if record exists
            }

            // Insert only if the record does not exist
            const insertSql = "INSERT INTO copo_quiz_students_forms (form_id, classroom_id, sid, marks) VALUES (?, ?, ?, ?)";
            const insertValues = [id, classroomId, sid, score];

            db.query(insertSql, insertValues, (insertError, insertResult) => {
                if (insertError) {
                    console.error("Error inserting data:", insertError);
                    return res.status(500).json({ message: "Internal Server Error" });
                }
                console.log("Data inserted successfully:", insertResult);
            });
        });
    });

    return res.status(201).json({ message: "Data processing completed" });
};


export const getQuizStudentDetailsByClassroom = (req, res) => {
  const { classroomId } = req.params; // Get classroom ID from request params

  if (!classroomId) {
      return res.status(400).json({ message: "Classroom ID is required" });
  }

  const sql = `
      SELECT 
          cqsf.id, 
          cqsf.form_id, 
          cqf.title, 
          cqsf.classroom_id, 
          cqsf.sid, 
          ccsd.student_name, 
          ccsd.stud_clg_id, 
          cqsf.marks
      FROM copo_quiz_students_forms cqsf
      JOIN copo_copo_students_details ccsd ON cqsf.sid = ccsd.sid
      JOIN copo_quiz_forms cqf ON cqsf.form_id = cqf.form_id
      WHERE cqsf.classroom_id = ?;
  `;

  db.query(sql, [classroomId], (error, result) => {
      if (error) {
          console.error("Error fetching data:", error);
          return res.status(500).json({ message: "Internal Server Error" });
      }

      return res.status(200).json(result);
  });
};
