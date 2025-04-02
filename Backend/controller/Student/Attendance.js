import { connection as db } from "../../config/dbConfig.js";
import expressAsyncHandler from "express-async-handler";

// Get overall attendance for a student
export const getStudentOverallAttendance = expressAsyncHandler(async (req, res) => {
  const { sid } = req.params;
  
  if (!sid) {
    return res.status(400).json({ message: "Student ID is required" });
  }

  // SQL query to get overall attendance
  const overallAttendanceQuery = `
    SELECT 
      COUNT(DISTINCT la.attendance_id) AS total_classes,
      SUM(CASE WHEN las.status = 1 THEN 1 ELSE 0 END) AS attended_classes
    FROM 
      copo_lms_attendance la
    JOIN 
      copo_lms_attendance_students las ON la.attendance_id = las.lms_attendance_id
    WHERE 
      las.sid = ?
  `;

  // SQL query to get subject-wise attendance
  const subjectAttendanceQuery = `
    SELECT 
      c.course_name AS name,
      COUNT(DISTINCT la.attendance_id) AS total_classes,
      SUM(CASE WHEN las.status = 1 THEN 1 ELSE 0 END) AS attended_classes
    FROM 
      copo_lms_attendance la
    JOIN 
      copo_lms_attendance_students las ON la.attendance_id = las.lms_attendance_id
    JOIN 
      copo_user_course uc ON la.class_id = uc.usercourse_id
    JOIN 
      copo_course c ON uc.course_id = c.courseid
    WHERE 
      las.sid = ?
    GROUP BY 
      c.course_name
  `;

  try {
    // Get overall attendance
    db.query(overallAttendanceQuery, [sid], (err, overallResults) => {
      if (err) {
        console.error("Error fetching overall attendance:", err);
        return res.status(500).json({ message: "Failed to fetch attendance data", error: err });
      }

      // Get subject-wise attendance
      db.query(subjectAttendanceQuery, [sid], (err, subjectResults) => {
        if (err) {
          console.error("Error fetching subject-wise attendance:", err);
          return res.status(500).json({ message: "Failed to fetch subject attendance data", error: err });
        }

        // Calculate overall attendance percentage
        const totalClasses = overallResults[0].total_classes || 0;
        const attendedClasses = overallResults[0].attended_classes || 0;
        const overallPercentage = totalClasses > 0 
          ? Math.round((attendedClasses / totalClasses) * 100) 
          : 0;

        // Calculate subject-wise attendance percentages
        const subjects = subjectResults.map(subject => {
          const subjectTotalClasses = subject.total_classes || 0;
          const subjectAttendedClasses = subject.attended_classes || 0;
          const percentage = subjectTotalClasses > 0 
            ? Math.round((subjectAttendedClasses / subjectTotalClasses) * 100) 
            : 0;

          return {
            name: subject.name,
            totalClasses: subjectTotalClasses,
            attendedClasses: subjectAttendedClasses,
            percentage
          };
        });

        // Return the attendance data
        return res.status(200).json({
          overall: overallPercentage,
          totalClasses,
          attendedClasses,
          subjects
        });
      });
    });
  } catch (error) {
    console.error("Error in attendance calculation:", error);
    return res.status(500).json({ message: "Server error", error });
  }
});