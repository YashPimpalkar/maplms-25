import { connection as db } from "../../config/dbConfig.js";
import expressAsyncHandler from "express-async-handler";
import multer from "multer"
import path from "path";


// Multer storage setup for PDF uploads
const storage = multer.diskStorage({
  destination: "./uploads/Mentee_Internships",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});

const storage2 = multer.diskStorage({
  destination: "./uploads/Mentee_Certifications",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});

const storage3 = multer.diskStorage({
  destination: "./uploads/Mentee_Resume",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});
const storage4 = multer.diskStorage({
  destination: "./uploads/Mentee_Marksheet",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});



//Get Student Profile
// Add this function to your existing MentorMentee.js file

export const getStudentProfile = expressAsyncHandler(async (req, res) => {
  const { sid } = req.params;

  try {
    // Get student details from copo_copo_students_details
    const studentQuery = `
      SELECT 
        s.sid, 
        s.student_name, 
        s.stud_clg_id, 
        s.programm_id, 
        s.branch, 
        s.academic_year,
        d.semester,
        d.email
      FROM copo_copo_students_details s
      INNER JOIN copo_copo_students_detail d ON s.sid = d.sid
      WHERE s.sid = ?
    `;

    // Get student profile data
    const profileQuery = `
      SELECT * FROM student_profile WHERE sid = ?
    `;

    db.query(studentQuery, [sid], (err, studentResults) => {
      if (err) {
        console.error("Error fetching student details:", err);
        return res.status(500).json({ message: "Error fetching student details" });
      }

      if (studentResults.length === 0) {
        return res.status(404).json({ message: "Student not found" });
      }

      db.query(profileQuery, [sid], (err, profileResults) => {
        if (err) {
          console.error("Error fetching student profile:", err);
          return res.status(500).json({ message: "Error fetching student profile" });
        }

        const studentData = {
          ...studentResults[0],
          profile: profileResults.length > 0 ? profileResults[0] : null
        };

        res.status(200).json(studentData);
      });
    });
  } catch (error) {
    console.error("Error in getStudentProfile:", error);
    res.status(500).json({ message: "Server error" });
  }
});



export const fetch_all_branch_students  =  (req,res)=>{
   const uid = req.params.uid;
   const sql = `
 SELECT 
    s.sid, 
    s.student_name, 
    s.stud_clg_id, 
    s.programm_id, 
    s.branch, 
    s.academic_year, 
    d.semester
FROM copo_copo_students_details s
INNER JOIN copo_copo_students_detail d ON s.sid = d.sid
WHERE s.branch_id = (SELECT depart FROM copo_users WHERE userid = ?)
ORDER BY s.academic_year DESC, s.stud_clg_id ASC`;
    db.query(sql,[uid], (err, result) => {
        if (err) {
          console.log(err);
        } else {
          res.send(result);
        }
      });
}

// Adjust based on your DB setup

export const assignMentor =expressAsyncHandler( async (req, res) => {
  const { teacherId, studentIds, academicYear, semester, year, groupName } = req.body;

  if (!teacherId || !studentIds || studentIds.length === 0) {
      return res.status(400).json({ message: "Missing required fields" });
  }

  // Insert into copo_mentor_table
  const mentorSql = `INSERT INTO copo_mentor_table (mentor_id, academic_year, semester, year, grp_name) VALUES (?, ?, ?, ?, ?)`;
  const mentorValues = [teacherId, academicYear, semester, year, groupName];

  db.query(mentorSql, mentorValues, (err, result) => {
      if (err) {
          console.error("Error inserting mentor:", err);
          return res.status(500).json({ message: "Error inserting mentor" });
      }

      const mmrId = result.insertId; // Get the inserted mmr_id
      console.log("Mentor inserted successfully with mmr_id:", mmrId);
      // Insert students into copo_mentee_table
      const menteeSql = `INSERT INTO copo_mentee_table (sid, mmr_id) VALUES ?`;
      const menteeValues = studentIds.map(studentId => [studentId, mmrId]);

      db.query(menteeSql, [menteeValues], (err, result) => {
          if (err) {
              console.error("Error inserting mentees:", err);
              return res.status(500).json({ message: "Error inserting mentees" });
          }

          res.status(201).json({ message: "Mentor assigned successfully!" });
      });
  });
});



// Submit Academic Data
// Submit Academic Data
// Submit Academic Data
// export const submitAcademicData = async (req, res) => {
//   try {
//       const { sid, formData, sgpa } = req.body.requestBody;

//       if (!sid || !formData || !sgpa) {
//           return res.status(400).json({ message: "Missing required fields." });
//       }

//       const queryPromises = [];

//       // Loop through formData to insert/update records
//       for (const semesterKey of Object.keys(formData)) {
//           const semester = parseInt(semesterKey.replace(/\D/g, ""), 10); // Extract number from "Semester 1" -> 1

//           if (isNaN(semester)) {
//               return res.status(400).json({ message: `Invalid semester format: ${semesterKey}` });
//           }

//           // Extract SGPA for the current semester
//           const semesterSGPA = sgpa[semesterKey] || null; // Get SGPA value, default null if not found

//           for (const key of Object.keys(formData[semesterKey])) {
//               const entry = formData[semesterKey][key];

//               const {
//                   Subject,
//                   Attempt,
//                   AcademicYear,
//                   IA1,
//                   IA2,
//                   TW,
//                   ORPR,
//                   UniversityExam,
//                   PassFail,
//               } = entry;

//               // SQL Query for Inserting or Updating
//               const query = `
//                   INSERT INTO copo_student_academic_performance 
//                   (student_id, semester, subject, attempt, academic_year, IA1, IA2, TW, ORPR, university_exam, pass_fail, sgpa, created_at)
//                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
//                   ON DUPLICATE KEY UPDATE
//                   academic_year = VALUES(academic_year),
//                   IA1 = VALUES(IA1),
//                   IA2 = VALUES(IA2),
//                   TW = VALUES(TW),
//                   ORPR = VALUES(ORPR),
//                   university_exam = VALUES(university_exam),
//                   pass_fail = VALUES(pass_fail),
//                   sgpa = VALUES(sgpa),
//                   created_at = NOW();
//               `;

//               // Push query promise for execution
//               queryPromises.push(
//                   db.promise().query(query, [
//                       sid,
//                       semester, // Store semester as an integer
//                       Subject,
//                       Attempt,
//                       AcademicYear || null,
//                       IA1 || null,
//                       IA2 || null,
//                       TW || null,
//                       ORPR || null,
//                       UniversityExam || null,
//                       PassFail,
//                       semesterSGPA || null, // Pass only the numeric SGPA value
//                   ])
//               );
//           }
//       }

//       // Execute all queries in parallel
//       await Promise.all(queryPromises);

//       return res.status(200).json({ message: "Data submitted successfully!" });

//   } catch (error) {
//       console.error("Error submitting academic data:", error);
//       return res.status(500).json({ message: "Internal server error." });
//   }
// };


// Insert or Update Student Academic Performance Data
export const submitAcademicData = (req, res) => {
  try {
    const sid = req.params.sid;
    const { semesterIndex, sgpa, subjects, ktSubjects } = req.body.payload;

    if (!sid || semesterIndex === undefined) {
      return res.status(400).json({ error: "Student ID and Semester are required" });
    }

    const semester = semesterIndex ; // Convert index to 1-based semester
    const academic_year = null; // Default academic year

    const processSubject = (subj, isKT) => {
      return new Promise((resolve, reject) => {
        const attempt = isKT ? parseInt(subj.attemptNo) : 1;

        // Check if record exists
        const checkQuery = `
          SELECT id FROM copo_student_academic_performance 
          WHERE student_id = ? AND semester = ? AND subject = ? AND attempt = ?
        `;
        db.query(checkQuery, [sid, semester, subj.subject, attempt], (checkErr, results) => {
          if (checkErr) {
            console.error("Error checking existing record:", checkErr);
            return reject(checkErr);
          }

          const subjectData = {
            student_id: sid,
            semester: semester,
            subject: subj.subject,
            attempt: attempt,
            academic_year: isKT ? subj.year : academic_year,
            IA1: parseFloat(subj.ia1),
            IA2: parseFloat(subj.ia2),
            TW: parseFloat(subj.tw),
            ORPR: parseFloat(subj.orpr),
            university_exam: parseFloat(subj.universityExam),
            pass_fail: subj.passFail,
            kt: isKT ? 1 : 0,
            sgpa: parseFloat(sgpa),
            created_at: new Date(),
          };

          if (results.length > 0) {
            // Update if record exists
            const updateQuery = `
              UPDATE copo_student_academic_performance
              SET academic_year = ?, IA1 = ?, IA2 = ?, TW = ?, ORPR = ?, university_exam = ?, pass_fail = ?, kt = ?, sgpa = ?, created_at = ?
              WHERE student_id = ? AND semester = ? AND subject = ? AND attempt = ?
            `;
            const updateValues = [
              subjectData.academic_year,
              subjectData.IA1,
              subjectData.IA2,
              subjectData.TW,
              subjectData.ORPR,
              subjectData.university_exam,
              subjectData.pass_fail,
              subjectData.kt,
              subjectData.sgpa,
              subjectData.created_at,
              sid,
              semester,
              subj.subject,
              attempt,
            ];

            db.query(updateQuery, updateValues, (updateErr, updateResult) => {
              if (updateErr) {
                console.error("Error updating record:", updateErr);
                return reject(updateErr);
              }
              resolve(updateResult);
            });
          } else {
            // Insert if record doesn't exist
            const insertQuery = `
              INSERT INTO copo_student_academic_performance
              (student_id, semester, subject, attempt, academic_year, IA1, IA2, TW, ORPR, university_exam, pass_fail, kt, sgpa, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const insertValues = [
              subjectData.student_id,
              subjectData.semester,
              subjectData.subject,
              subjectData.attempt,
              subjectData.academic_year,
              subjectData.IA1,
              subjectData.IA2,
              subjectData.TW,
              subjectData.ORPR,
              subjectData.university_exam,
              subjectData.pass_fail,
              subjectData.kt,
              subjectData.sgpa,
              subjectData.created_at,
            ];

            db.query(insertQuery, insertValues, (insertErr, insertResult) => {
              if (insertErr) {
                console.error("Error inserting record:", insertErr);
                return reject(insertErr);
              }
              resolve(insertResult);
            });
          }
        });
      });
    };

    // Process both subjects and KT subjects
    Promise.all([
      ...subjects.map((subj) => processSubject(subj, false)),
      ...ktSubjects.map((kt) => processSubject(kt, true)),
    ])
      .then(() => {
        res.status(201).json({ message: "Student academic performance data inserted/updated successfully" });
      })
      .catch((error) => {
        console.error("Error processing data:", error);
        res.status(500).json({ error: "Internal Server Error" });
      });
  } catch (error) {
    console.error("Unexpected Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};



export const getAcademicData = async (req, res) => {
  try {
      const { sid } = req.params; // Student ID from URL

      if (!sid) {
          return res.status(400).json({ message: "Student ID is required." });
      }

      // Query to fetch student academic records
      const query = `
          SELECT id, student_id, semester, subject, attempt, academic_year, IA1, IA2, TW, ORPR, 
                 university_exam, pass_fail, sgpa,kt, created_at
          FROM copo_student_academic_performance
          WHERE student_id = ?
          ORDER BY semester, subject, attempt;
      `;

      const [results] = await db.promise().query(query, [sid]);

      if (results.length === 0) {
          return res.status(404).json({ message: "No academic data found for this student." });
      }

      return res.status(200).json(results);

  } catch (error) {
      console.error("Error fetching academic data:", error);
      return res.status(500).json({ message: "Internal server error." });
  }
};

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"));
  }
};
export const upload = multer({ storage: storage, fileFilter: fileFilter });
export const upload2 = multer({ storage: storage2, fileFilter: fileFilter });
export const upload3 = multer({ storage: storage3, fileFilter: fileFilter });
export const upload4 = multer({ storage: storage4, fileFilter: fileFilter });
export const upload_mentee_interships = expressAsyncHandler((req, res) => {
 

    const student_id = req.params.sid;
    const { semester, company, jobRole, description, from, to, duration } = req.body;

    const filePath = req.file ? `/uploads/Mentee_Internships/${req.file.filename}` : null;
    
    console.log("Received Data:", { student_id, semester, company, jobRole, description, from, to, duration, filePath });

    if (!student_id || !semester || !company || !jobRole || !from || !to) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const query = `
      INSERT INTO copo_mentee_internships 
      (student_id, semester, company_name, job_role, description, from_date, to_date, duration, file_path)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      query,
      [student_id, semester, company, jobRole, description, from, to, duration, filePath],
      (err, result) => {
        if (err) {
          console.error("Database Error:", err);
          return res.status(500).json({ error: "Database error" });
        }
        res.json({ message: "Internship data saved successfully", id: result.insertId });
      }
    );
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




export const upload_mentee_certifications = expressAsyncHandler((req, res) => {
    const student_id = req.params.sid;
    const { semester, certificateName, description, completionDate} = req.body;

    const filePath = req.file ? `/uploads/Mentee_Certifications/${req.file.filename}` : null;

    console.log("Received Data:", { student_id, semester, certificateName, description, completionDate, filePath });

    if (!student_id || !semester || !certificateName || !completionDate) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const query = `
      INSERT INTO copo_mentee_certifications 
      (student_id, semester, certificate_name, description, completion_date, file_path)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
        query,
        [student_id, semester, certificateName, description, completionDate, filePath],
        (err, result) => {
            if (err) {
                console.error("Database Error:", err);
                return res.status(500).json({ error: "Database error" });
            }
            res.json({ message: "Certification data saved successfully", id: result.insertId });
        }
    );
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



// Ensure correct DB config import

// Upload Mentee Resume
export const upload_mentee_resume = expressAsyncHandler((req, res) => {
    const student_id = req.params.sid;
    const { jobRole, description } = req.body;

    const resumePath = req.file ? `/uploads/Mentee_Resume/${req.file.filename}` : null;

    console.log("Received Data:", { student_id, jobRole, description, resumePath });

    if (!student_id || !jobRole || !description || !resumePath) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const query = `
      INSERT INTO copo_mentee_resumes (student_id, job_role, description, resume_path)
      VALUES (?, ?, ?, ?)
    `;

    db.query(query, [student_id, jobRole, description, resumePath], (err, result) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json({ message: "Resume uploaded successfully", id: result.insertId });
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


 // Adjust path based on your setup

// Upload mentee marksheet
export const upload_mentee_marksheet = expressAsyncHandler((req, res) => {
    const student_id = req.params.sid;
    const { semester, marksheetName, description, completionDate } = req.body;

    const filePath = req.file ? `/uploads/Mentee_Marksheet/${req.file.filename}` : null;

    console.log("Received Data:", { student_id, semester, marksheetName, description, completionDate, filePath });

    if (!student_id || !semester || !marksheetName || !completionDate) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const query = `
      INSERT INTO copo_mentee_marksheets 
      (student_id, semester, marksheet_name, description, completion_date, file_path)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
        query,
        [student_id, semester, marksheetName, description, completionDate, filePath],
        (err, result) => {
            if (err) {
                console.error("Database Error:", err);
                return res.status(500).json({ error: "Database error" });
            }
            res.json({ message: "Marksheet data saved successfully", id: result.insertId });
        }
    );
});

// Get mentee marksheets
export const get_mentee_marksheets = expressAsyncHandler((req, res) => {
    const student_id = req.params.sid;

    const query = `
        SELECT id, semester, marksheet_name, description, completion_date, file_path, created_at
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

// Download mentee marksheet file
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



