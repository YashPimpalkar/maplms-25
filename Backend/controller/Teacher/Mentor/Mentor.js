import { connection as db} from "../../../config/dbConfig.js"

import expressAsyncHandler from "express-async-handler";

import multer from "multer";
import path from "path";
// Multer storage setup for PDF uploads








export const getMentorDetails = expressAsyncHandler((req, res) => {
  const uid = req.params.mentorId;

  if (!uid) {
    return res.status(400).json({ error: "Mentor ID is required" });
  }

  const query = `
    SELECT mmr_id, mentor_id, semester, academic_year, grp_name, year 
    FROM copo_mentor_table 
    WHERE mentor_id = ?
    ORDER BY academic_year DESC, semester DESC
  `;

  db.query(query, [uid], (err, results) => {
    if (err) {
      console.error("Database Error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});


export const getStudentsByMmrId = (req, res) => {
  const { mmr_id } = req.params;

  const sql = `
    SELECT 
      csd.student_name, 
      csd.stud_clg_id, 
      csd.sid, 
      csd.academic_year, 
      csd_detail.semester, 
      cm.mmr_id 
    FROM copo_mentee_table cm
    JOIN copo_copo_students_details csd ON cm.sid = csd.sid
    JOIN copo_copo_students_detail csd_detail ON cm.sid = csd_detail.sid
    WHERE cm.mmr_id = ?`;

  db.query(sql, [mmr_id], (error, result) => {
    if (error) {
      console.error("Error fetching student details:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "No students found for this mmr_id" });
    }

    res.status(200).json(result);
  });
};



export const getStudentDetails =expressAsyncHandler(async (req, res) => { 
 
    const { student_id } = req.params;
    const query = 'SELECT * FROM copo_student_academic_performance WHERE student_id = ?';
    
    db.query(query, [student_id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.json(results);
    });
});




  export const get_mentee_internships = expressAsyncHandler((req, res) => {
    const student_id = req.params.sid;

    const query = `
        SELECT id, semester, company_name, job_role, description, from_date, to_date, duration, file_path, created_at
        FROM copo_mentee_internships
        WHERE student_id = ?
        ORDER BY created_at DESC
    `;

    db.query(query, [student_id], (err, results) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json(results);
    });
});





// 📌 Download Internship Certificate Controller
export const downloadMenteeInternshipFile = expressAsyncHandler((req, res) => {
    let { filePath } = req.params; // Get file path from request parameters
   
    if (!filePath) {
        return res.status(400).json({ message: "File path is required" });
    }
     
    // Ensure filePath does not start with a slash to prevent absolute path issues
    filePath = filePath.replace(/^\/+/, "");

    // Construct the full file path dynamically
    const fullFilePath = path.resolve(process.cwd(), filePath);

    console.log(`Serving file: ${fullFilePath}`);

    // Send file to client for download
    res.sendFile(fullFilePath, path.basename(fullFilePath), (err) => {
        if (err) {
            console.error("Error serving file:", err);
            return res.status(500).json({ message: "Error serving file" });
        } else {
            console.log(`File ${filePath} sent successfully`);
        }
    });
});


export const get_mentee_certifications = expressAsyncHandler((req, res) => {
  const student_id = req.params.sid;

  const query = `
      SELECT id, semester, certificate_name, description, completion_date, file_path, created_at
      FROM copo_mentee_certifications
      WHERE student_id = ?
      ORDER BY created_at DESC
  `;

  db.query(query, [student_id], (err, results) => {
      if (err) {
          console.error("Database Error:", err);
          return res.status(500).json({ error: "Database error" });
      }
      res.json(results);
  });
});


export const downloadMenteeCertificationFile = expressAsyncHandler((req, res) => {
  let { filePath } = req.params;

  if (!filePath) {
      return res.status(400).json({ message: "File path is required" });
  }

  // Ensure filePath does not start with a slash
  filePath = filePath.replace(/^\/+/, "");

  // Construct the full file path dynamically
  const fullFilePath = path.resolve(process.cwd(), filePath);

  console.log(`Serving file: ${fullFilePath}`);

  // Send file to client for download
  res.sendFile(fullFilePath, (err) => {
      if (err) {
          console.error("Error serving file:", err);
          return res.status(500).json({ message: "Error serving file" });
      } else {
          console.log(`File ${filePath} sent successfully`);
      }
  });

});


// Get Mentee Resumes
export const get_mentee_resumes = expressAsyncHandler((req, res) => {
    const student_id = req.params.sid;

    const query = `
        SELECT id, job_role, description, resume_path, created_at
        FROM copo_mentee_resumes
        WHERE student_id = ?
        ORDER BY created_at DESC
    `;

    db.query(query, [student_id], (err, results) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json(results);
    });
});

// Download Resume File
export const downloadMenteeResumeFile = expressAsyncHandler((req, res) => {
    let { filePath } = req.params;

    if (!filePath) {
        return res.status(400).json({ message: "File path is required" });
    }

    // Ensure filePath does not start with a slash
    filePath = filePath.replace(/^\/+/, "");

    // Construct the full file path dynamically
    const fullFilePath = path.resolve(process.cwd(), filePath);

    console.log(`Serving file: ${fullFilePath}`);

    // Send file to client for download
    res.sendFile(fullFilePath, (err) => {
        if (err) {
            console.error("Error serving file:", err);
            return res.status(500).json({ message: "Error serving file" });
        } else {
            console.log(`File ${filePath} sent successfully`);
        }
    });
});




export const get_mentee_marksheets = expressAsyncHandler((req, res) => {
  const student_id = req.params.sid;

  const query = `
      SELECT *
      FROM copo_mentee_marksheets
      WHERE student_id = ?
      ORDER BY created_at DESC
  `;

  db.query(query, [student_id], (err, results) => {
      if (err) {
          console.error("Database Error:", err);
          return res.status(500).json({ error: "Database error" });
      }
      res.json(results);
  });
});

// 📌 Download Mentee Marksheet File
export const downloadMenteeMarksheetFile = expressAsyncHandler((req, res) => {
  let { filePath } = req.params;

  if (!filePath) {
      return res.status(400).json({ message: "File path is required" });
  }

  // Ensure filePath does not start with a slash
  filePath = filePath.replace(/^\/+/, "");

  // Construct the full file path dynamically
  const fullFilePath = path.resolve(process.cwd(), filePath);

  console.log(`Serving file: ${fullFilePath}`);

  // Send file to client for download
  res.sendFile(fullFilePath, (err) => {
      if (err) {
          console.error("Error serving file:", err);
          return res.status(500).json({ message: "Error serving file" });
      } else {
          console.log(`File ${filePath} sent successfully`);
      }
  });
});


