import { connection as db } from "../../config/dbConfig.js";
import path from "path";
import multer from "multer";

export const get_all_classroom_by_sid = async (req, res) => {
    const { sid } = req.params; // Destructure sid from req.params
  
    const sql = `
      SELECT 
    classroom.classroom_id,
    classroom.room_name,
    classroom.branch,
    classroom.semester,
    classroom.academic_year,
    classroom.created_at,
    GROUP_CONCAT(users.userid ORDER BY users.userid SEPARATOR ', ') AS user_id,
    GROUP_CONCAT(users.teacher_name ORDER BY users.teacher_name SEPARATOR ', ') AS teacher_name
FROM 
    copo_class_students_table
JOIN 
    copo_classroom AS classroom ON copo_class_students_table.class_id = classroom.classroom_id
JOIN 
    copo_usercourse_users AS cuu ON classroom.classroom_id = cuu.usercourse_id
JOIN 
    copo_users AS users ON cuu.user_id = users.userid
WHERE 
    copo_class_students_table.sid = ?
GROUP BY 
    classroom.classroom_id, 
    classroom.room_name, 
    classroom.branch, 
    classroom.semester, 
    classroom.academic_year, 
    classroom.created_at
    `;
  
    try {
      const results = await new Promise((resolve, reject) => {
        db.query(sql, [sid], (error, results) => {
          if (error) {
            
            return reject(error); // Reject the promise if there's an error
          }
          resolve(results); // Resolve with results if successful
        });
      });
  
      res.status(200).json(results);
    } catch (error) {
      console.error('SQL Error:', error.message);
      res.status(500).json({ error: 'Failed to retrieve classrooms' });
    }
  };


// Ensure db connection is set up in config/db.js or adjust the path accordingly

// Controller function to get classroom activities
export const getClassroomActivities = (req, res) => {
  const { cid } = req.params; // classroom_id from route parameters
  const { student_id } = req.body;

  const classroomId = cid;
  console.log(student_id, cid);

  if (!student_id) {
    
    return res.status(400).json({ error: 'Student ID is required' });
  }

  const query = `
    SELECT 
      la.assignment_id,
      la.classroom_id,
      la.teacher_id,
      la.title,
      la.description,
      la.file_type_allowed,
      la.max_file_size,
      la.created_at,
      la.deadline,
      CASE WHEN s.submitted_at IS NOT NULL THEN TRUE ELSE FALSE END AS isSubmitted,
      laf.file_id,
      laf.file_name,
      laf.file_type,
      laf.file_size,
      laf.uploaded_date,
      laf.file_path
    FROM copo_lmsactivities la
    LEFT JOIN copo_submissions s 
      ON la.assignment_id = s.assignment_id 
      AND s.student_id = ?
    LEFT JOIN copo_lms_activities_file laf 
      ON la.assignment_id = laf.assignment_id
    WHERE la.classroom_id = ?
    ORDER BY la.created_at DESC
  `;

  db.query(query, [student_id, classroomId], (error, results) => {
    if (error) {
      console.error('Error fetching activities:', error);
      
      return res.status(500).json({ error: 'Database error' });
    }

    // Organize the results to prevent duplicate files
    const activities = results.reduce((acc, row) => {
      // Find the existing activity by assignment_id
      let activity = acc.find(a => a.assignment_id === row.assignment_id);

      if (!activity) {
        // If the activity does not exist, create a new one
        activity = {
          assignment_id: row.assignment_id,
          classroom_id: row.classroom_id,
          teacher_id: row.teacher_id,
          title: row.title,
          description: row.description,
          file_type_allowed: row.file_type_allowed,
          max_file_size: row.max_file_size,
          created_at: row.created_at,
          deadline: row.deadline,
          isSubmitted: row.isSubmitted,
          files: []
        };
        acc.push(activity);
      }

      // Check if the file_id is already in the files array for this activity
      const fileExists = activity.files.some(file => file.file_id === row.file_id);
      
      // Only add the file if it does not already exist in the files array
      if (row.file_id && !fileExists) {
        activity.files.push({
          file_id: row.file_id,
          file_name: row.file_name,
          file_type: row.file_type,
          file_size: row.file_size,
          uploaded_date: row.uploaded_date,
          file_path: row.file_path
        });
      }

      return acc;
    }, []);
    
    console.log(activities);
    res.status(200).json({ activities });
  });
};





// Configure storage for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(path.resolve(), 'uploads/submissions')); // Save files in uploads/submissions folder
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}-${file.originalname}`);
  }
});

// Multer middleware for handling multiple files
const upload = multer({ storage }).array('files', 10); // Allow up to 10 files


// Controller to handle submission creation
export const createSubmission = (req, res) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      
      return res.status(400).json({ message: 'Multer error while uploading files', error: err });
    } else if (err) {
      
      return res.status(500).json({ message: 'Server error while uploading files', error: err });
    }

    // Extract form data from the request
    const { student_id, classroom_id, assignment_id} = req.body;

    if (!student_id || !classroom_id || !assignment_id) {
      
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Insert submission metadata into the submissions table
    const insertSubmissionQuery = `
    INSERT INTO copo_submissions (classroom_id, assignment_id, student_id, submitted_at)
    VALUES (?, ?, ?, NOW())
  `;

    db.query(insertSubmissionQuery, [classroom_id, assignment_id, student_id], (err, result) => {
      if (err) {
        console.error('Error inserting submission:', err);
        
        return res.status(500).json({ message: 'Failed to create submission' });
      }

      const submissionId = result.insertId; // Get the newly created submission's ID

      // Check if files were uploaded
      if (req.files && req.files.length > 0) {
        const files = req.files.map((file) => [
          submissionId,                    // submission_id (foreign key)
          file.originalname,               // file_name
          file.mimetype,                   // file_type
          file.size,                       // file_size
          new Date(),                      // uploaded_date (current timestamp)
          `/uploads/submissions/${file.filename}` // file_path
        ]);

        // Insert file data into the submissions_file table
        const insertFileQuery = `
          INSERT INTO copo_submissions_file (submission_id, file_name, file_type, file_size, uploaded_date, file_path)
          VALUES ?
        `;

        db.query(insertFileQuery, [files], (err, fileResult) => {
          if (err) {
            console.error('Error inserting file details:', err);
            
            return res.status(500).json({ message: 'Failed to save file details' });
          }
          
          return res.status(201).json({
            message: 'Submission and files created successfully',
            submissionId
          });
        });
      } else {
        // No files uploaded, return success
        
        return res.status(201).json({
          message: 'Submission created successfully',
          submissionId
        });
      }
    });
  });
};


// Controller to retrieve submissions based on assignment_id and student_id passed in FormData
export const getSubmissionsByAssignmentAndStudent = (req, res) => {
  const { assignment_id, student_id } = req.body;
  console.log(req.body)

  // Validate inputs
  if (!assignment_id || !student_id) {
    
    return res.status(400).json({ message: 'Assignment ID and Student ID are required' });
  }

  // Query to retrieve submissions and associated files
  const query = `
    SELECT  sf.file_id, sf.file_name, sf.file_type, sf.file_size, sf.uploaded_date, sf.file_path
    FROM copo_submissions s
    inner join copo_submissions_file sf ON s.submission_id = sf.submission_id
    WHERE s.assignment_id = ? AND s.student_id = ?
  `;

  db.query(query, [assignment_id, student_id], (err, results) => {
    if (err) {
      console.error('Error retrieving submissions:', err);
      
      return res.status(500).json({ message: 'Failed to retrieve submissions' });
    }

    if (results.length === 0) {
      
      return res.status(404).json({ message: 'No submissions found for the given assignment and student' });
    }
    
    return res.status(200).json({ submissions: results });
  });
};



 // Import your database connection

export const downloadFileForSubmission = (req, res) => {
    const { fileId } = req.params; // Extract fileId from request parameters
    console.log(`Received request to download file with ID: ${fileId}`);

    // Query to get the file path, file name, and file type by file_id in submissions_file
    const query = 'SELECT file_path, file_name, file_type FROM copo_submissions_file WHERE file_id = ?';

    db.query(query, [fileId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.length === 0) {
            console.warn(`File with ID ${fileId} not found`);
            
            return res.status(404).json({ message: 'File not found' });
        }

        // Destructure the result to get file details
        const { file_path: filePath, file_name: fileName, file_type: fileType } = results[0];
        console.log(`Found file details - Path: ${filePath}, Name: ${fileName}, Type: ${fileType}`);

        // Clean and construct the full file path
        const cleanedFilePath = filePath.replace(/^\//, ''); // Remove leading slash if exists
        const fullFilePath = path.resolve(process.cwd(), cleanedFilePath); // Use process.cwd() for a dynamic base path

        console.log('Full file path:', fullFilePath);

        // Attempt to send the file to the client
        res.sendFile(fullFilePath, { 
            headers: { 
                'Content-Type': fileType || 'application/octet-stream', // Set content type; default to binary
                'Content-Disposition': `attachment; filename="${fileName}"` // Prompts download
            } 
        }, (err) => {
            if (err) {
                console.error('Error serving file:', err);
                
                return res.status(500).json({ message: 'Error serving file' });
            } else {
                console.log(`File ${fileName} sent successfully`);
            }
        });
    });
};



export const updateSubmissionMarks = (req, res) => {
  const { submissionId } = req.params;
  const { marks } = req.body;

  if (isNaN(marks)) {
      return res.status(400).json({ message: 'Marks should be a valid integer' });
  }

  const query = 'UPDATE copo_submissions SET marks = ? WHERE submission_id = ?';
  
  db.query(query, [marks, submissionId], (err, result) => {
      if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Database error' });
      }

      if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Submission not found' });
      }

      res.status(200).json({ message: 'Marks updated successfully' });
  });
};



// controllers/submissionController.js



// Function to get all submission details by submission ID
export const getAssignmentById = (req, res) => {
  const { assignmentId } = req.params;

  // Define SQL query to fetch all fields
  const query = `
    SELECT 
      submission_id,
      classroom_id,
      assignment_id,
      student_id,
      submitted_at,
      is_late,
      marks,
      message_to_teacher
    FROM 
      copo_submissions
    WHERE 
      assignment_id = ?
  `;

  // Execute the query with the submissionId parameter
  db.query(query, [assignmentId], (error, results) => {
    if (error) {
      console.error("Error fetching submission details:", error);
      return res.status(500).json({
        message: "Error fetching submission details",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    // Return the result
    res.status(200).json(results[0],);
  });
};



export const updateSubmissionTimestamp = (req, res) => {
  const { submission_id } = req.params;
  const submittedAt = new Date(); // Current timestamp

  // SQL query to update only the submitted_at field
  const query = `
      UPDATE copo_submissions 
      SET submitted_at = ? 
      WHERE submission_id = ?
  `;

  db.execute(query, [submittedAt, submission_id], (err, results) => {
      if (err) {
          console.error("Error updating submission:", err);
          return res.status(500).json({ error: "An error occurred while updating the submission" });
      }

      if (results.affectedRows > 0) {
          res.json({ message: "Submission timestamp updated successfully" });
      } else {
          res.status(404).json({ error: "Submission not found" });
      }
  });
};

