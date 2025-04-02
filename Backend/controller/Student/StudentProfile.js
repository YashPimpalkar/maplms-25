import { connection as db } from "../../config/dbConfig.js";
import expressAsyncHandler from "express-async-handler";
import multer from "multer";
import path from "path";
import fs from "fs";

// Multer storage setup for profile images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./uploads/Student_Profiles";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `student_${req.params.sid}_${Date.now()}${path.extname(file.originalname)}`);
  },
});

export const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only .jpeg, .jpg and .png files are allowed!"));
  }
}).single("profileImage");

// Get student basic details and mentor information
export const getStudentDetails = expressAsyncHandler(async (req, res) => {
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
        d.email
      FROM copo_copo_students_details s
      INNER JOIN copo_copo_students_detail d ON s.sid = d.sid
      WHERE s.sid = ?
    `;

    // Get mentor details from copo_mentee_table and copo_mentor_table
    const mentorQuery = `
      SELECT 
        m.mmr_id,
        u.teacher_name as mentor_name
      FROM copo_mentee_table mt
      JOIN copo_mentor_table m ON mt.mmr_id = m.mmr_id
      JOIN copo_users u ON m.mentor_id = u.userid
      WHERE mt.sid = ?
    `;

    db.query(studentQuery, [sid], (err, studentResults) => {
      if (err) {
        console.error("Error fetching student details:", err);
        return res.status(500).json({ message: "Error fetching student details" });
      }

      if (studentResults.length === 0) {
        return res.status(404).json({ message: "Student not found" });
      }

      db.query(mentorQuery, [sid], (err, mentorResults) => {
        if (err) {
          console.error("Error fetching mentor details:", err);
          return res.status(500).json({ message: "Error fetching mentor details" });
        }

        const studentData = {
          ...studentResults[0],
          mentor: mentorResults.length > 0 ? mentorResults[0] : null
        };

        res.status(200).json(studentData);
      });
    });
  } catch (error) {
    console.error("Error in getStudentDetails:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get student profile data
export const getStudentProfile = expressAsyncHandler(async (req, res) => {
  const { sid } = req.params;

  try {
    const query = `SELECT * FROM student_profile WHERE sid = ?`;
    
    db.query(query, [sid], (err, results) => {
      if (err) {
        console.error("Error fetching student profile:", err);
        return res.status(500).json({ message: "Error fetching student profile" });
      }

      if (results.length === 0) {
        return res.status(200).json({ message: "Profile not found", exists: false });
      }

      res.status(200).json({ profile: results[0], exists: true });
    });
  } catch (error) {
    console.error("Error in getStudentProfile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create or update student profile
// Add this to your existing Profile.js controller

// Add this to your existing Profile.js controller

export const updateStudentProfile = expressAsyncHandler(async (req, res) => {
    const { sid } = req.params;
    const { 
      dateOfBirth, gender, currentAddress, permanentAddress, 
      mobileNo, emailId, fatherName, fatherMobile, fatherEmail,
      motherName, motherMobile, motherEmail, facultyMentor 
    } = req.body;
    
    try {
      // First, get student details from copo_copo_students_details
      const studentQuery = `
        SELECT student_name, academic_year, branch 
        FROM copo_copo_students_details 
        WHERE sid = ?
      `;
      
      db.query(studentQuery, [sid], async (err, studentResults) => {
        if (err) {
          console.error("Error fetching student details:", err);
          return res.status(500).json({ error: "Database error" });
        }
        
        if (studentResults.length === 0) {
          return res.status(404).json({ message: "Student not found" });
        }
        
        const { student_name, academic_year, branch } = studentResults[0];
        
        // Check if profile exists
        const checkQuery = "SELECT * FROM student_profile WHERE sid = ?";
        db.query(checkQuery, [sid], async (err, results) => {
          if (err) {
            console.error("Error checking profile:", err);
            return res.status(500).json({ error: "Database error" });
          }
          
          let profileImagePath = null;
          if (req.file) {
            profileImagePath = `/uploads/Student_Profiles/${req.file.filename}`;
          }
          
          if (results.length > 0) {
            // Update existing profile
            const updateQuery = `
              UPDATE student_profile SET
                student_name = ?,
                academic_year = ?,
                branch = ?,
                profile_image = COALESCE(?, profile_image),
                date_of_birth = ?,
                gender = ?,
                current_address = ?,
                permanent_address = ?,
                mobile_no = ?,
                email_id = ?,
                father_name = ?,
                father_mobile = ?,
                father_email = ?,
                mother_name = ?,
                mother_mobile = ?,
                mother_email = ?,
                faculty_mentor = ?
              WHERE sid = ?
            `;
            
            db.query(updateQuery, [
              student_name, academic_year, branch,
              profileImagePath, dateOfBirth, gender, currentAddress, 
              permanentAddress, mobileNo, emailId, fatherName, 
              fatherMobile, fatherEmail, motherName, motherMobile, 
              motherEmail, facultyMentor, sid
            ], (err, result) => {
              if (err) {
                console.error("Error updating profile:", err);
                return res.status(500).json({ error: "Database error" });
              }
              res.json({ message: "Profile updated successfully" });
            });
          } else {
            // Create new profile
            const insertQuery = `
              INSERT INTO student_profile (
                sid, student_name, academic_year, branch,
                profile_image, date_of_birth, gender, current_address, 
                permanent_address, mobile_no, email_id, father_name, 
                father_mobile, father_email, mother_name, mother_mobile, 
                mother_email, faculty_mentor
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            db.query(insertQuery, [
              sid, student_name, academic_year, branch,
              profileImagePath, dateOfBirth, gender, currentAddress, 
              permanentAddress, mobileNo, emailId, fatherName, 
              fatherMobile, fatherEmail, motherName, motherMobile, 
              motherEmail, facultyMentor
            ], (err, result) => {
              if (err) {
                console.error("Error creating profile:", err);
                return res.status(500).json({ error: "Database error" });
              }
              res.json({ message: "Profile created successfully" });
            });
          }
        });
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Server error" });
    }
  });