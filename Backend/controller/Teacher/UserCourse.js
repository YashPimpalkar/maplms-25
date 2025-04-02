import { connection as db } from "../../config/dbConfig.js";

// export const user_course_registration = (req, res) => {
//   const courses = req.body.formData; // Access the array of course objects
//   console.log("Received courses:", courses);

//   if (!Array.isArray(courses) || courses.length === 0) {
    
//     return res.status(400).json({ error: "No courses provided" });
//   }

//   // Validate each course object in the array
//   for (const course of courses) {
//     const { user_id, course_code, sem, academic_year, branch } =
//       course;
//     if (
//       !user_id ||
//       !course_code ||
//       !sem ||
//       !academic_year ||
//       !branch 
//     ) {
      
//       return res
//         .status(400)
//         .json({ error: "All fields are required for each course" });
//     }
//   }

//   // Simulate saving to a database (this is just an example, replace with actual DB logic)
//   const saveCourse = (course, callback) => {
//     const { user_id, course_code, sem, academic_year, branch } =
//       course;

//     const q = `SELECT courseid FROM copo_course WHERE coursecode = ?`;
//     db.query(q, course_code, (err, result) => {
//       if (err) {
//         console.error("Error querying the database:", err);
        
//         return callback(err);
//       }

//       const courseid = result[0]?.courseid;

//       if (!courseid) {
        
//         return callback(
//           new Error("Course ID not found for the given course code")
//         );
//       }

//       const values = [user_id, courseid, sem, academic_year, branch];
//       // console.log(values); // Log the values

//       const query = `
//         INSERT INTO copo_user_course (user_id, course_id, semester, academic_year, branch,created_at)
//         VALUES (?,?,?,?,?,?,NOW())`;

//       db.query(query, values, (err, result) => {
//         if (err) {
//           console.error("Error saving to database:", err);
          
//           return callback(err);
//         }
//         // console.log('New registration:', result);
//         callback(null, result);
//       });
//     });
//   };

//   // Process all courses
//   let errorOccurred = false;
//   const results = [];

//   const processCourse = (index) => {
//     if (index >= courses.length) {
//       if (errorOccurred) {
        
//         return res
//           .status(500)
//           .json({ error: "Database error occurred while processing courses" });
//       }
      
//       return res
//         .status(201)
//         .json({ message: "All registrations successful", results });
//     }

//     saveCourse(courses[index], (err, result) => {
//       if (err) {
//         errorOccurred = true;
//         return processCourse(index + 1);
//       }
//       results.push(result);
//       processCourse(index + 1);
//     });
//   };

//   processCourse(0);
// };

export const show_user_course = (req, res) => {
  const id = req.params.uid;
  const sql = `SELECT 
    u.usercourse_id, 
    uc.user_id, 
    c.coursecode, 
    c.course_name, 
    u.semester, 
    u.academic_year, 
    u.branch, 
    u.co_count 
FROM 
    copo_usercourse_users AS uc
INNER JOIN 
    copo_user_course AS u 
ON 
    uc.usercourse_id = u.usercourse_id
INNER JOIN 
    copo_course AS c 
ON 
    u.course_id = c.courseid 
WHERE 
    uc.user_id = ? 
ORDER BY 
    u.usercourse_id DESC;
 `;
  db.query(sql, id, (err, result) => {
    if (err) {
      console.error("Error saving to database:", err);
      
      return res.status(500).json({ error: "Database error" });
    }
    
     return res.status(201).json(result);
  });
};



export const show_specific_user_course = (req, res) => {
  const id = req.params.uid;
  const sql = `SELECT 
    u.usercourse_id, 
    uc.user_id, 
    c.courseid, 
    c.coursecode, 
    c.course_name, 
    u.semester, 
    u.academic_year, 
    u.branch, 
    u.co_count 
FROM 
    copo_usercourse_users AS uc
INNER JOIN 
    copo_user_course AS u 
ON 
    uc.usercourse_id = u.usercourse_id
INNER JOIN 
    copo_course AS c 
ON 
    u.course_id = c.courseid 
WHERE 
    u.usercourse_id = ?;
 `;
  db.query(sql, id, (err, result) => {
    if (err) {
      console.error("Error saving to database:", err);
      
      return res.status(500).json({ error: "Database error" });
    }
    
    return res.status(201).json(result);
  });
};

export const edit_specific_course = (req, res) => {
  console.log("Reached here");
  const { usercourse_id } = req.params;
  const { course_name, branch, semester, cocount, academic_year, courseid } =
    req.body;

  // SQL query to update the course details in user_course table based on usercourse_id
  const userCourseQuery = `
    UPDATE copo_user_course 
    SET 
      branch = ?, 
      semester = ?, 
      co_count = ?, 
      academic_year = ? 
    WHERE 
      usercourse_id = ?`;

  // SQL query to update the course_name in course table based on courseid
  const courseNameQuery = `
    UPDATE copo_course 
    SET 
      course_name = ? 
    WHERE 
      courseid = ?`;

  // Execute the first query to update user_course
  db.query(
    userCourseQuery,
    [branch, semester, cocount, academic_year, usercourse_id],
    (err, result) => {
      if (err) {
        console.error("Error updating the user_course:", err);
        
        return res
          .status(500)
          .json({ error: "An error occurred while updating the user course." });
      }

      // Execute the second query to update the course table with course_name
      db.query(courseNameQuery, [course_name, courseid], (err, result) => {
        if (err) {
          console.error("Error updating the course table:", err);
          
          return res
            .status(500)
            .json({
              error: "An error occurred while updating the course name.",
            });
        }
        
        return res.status(200).json({ message: "Course updated successfully!" });
      });
    }
  );
};

export const show_CoCount = (req, res) => {
  const id = req.params.uid;
  // console.log(id)
  const sql = `select * from copo_user_course where usercourse_id=? `;
  db.query(sql, id, (err, result) => {
    if (err) {
      console.error("Error saving to database:", err);
      
      return res.status(500).json({ error: "Database error" });
    }
    
    return res.status(201).json(result);
  });
};

export const coname = (req, res) => {
  const userCourseId = req.params.uid;
  console.log(userCourseId);
  const sql = "select * from copo_cos where usercourse_id = ?";
  db.query(sql, userCourseId, (Err, result) => {
    if (Err) {
      console.log(Err);
    }
    
    return res.status(200).json(result);
  });
};

export const userCourse_details = (req, res) => {
  const userCourseId = req.params.uid;

  const sql = `SELECT 
    uc.usercourse_id,
    uc.semester,
    uc.academic_year,
    uc.branch,
    uc.co_count,
    uc.created_at,
    GROUP_CONCAT(DISTINCT u.teacher_name ORDER BY u.teacher_name SEPARATOR ', ') AS teacher_names,
    u.depart AS user_department,
    GROUP_CONCAT(DISTINCT u.emailid ORDER BY u.emailid SEPARATOR ', ') AS user_emails,
    c.coursecode,
    c.course_name,
    c.created_time AS course_created_time
FROM 
    copo_usercourse_users ucu
JOIN 
    copo_user_course uc ON ucu.usercourse_id = uc.usercourse_id
JOIN 
    copo_users u ON ucu.user_id = u.userid
JOIN 
    copo_course c ON uc.course_id = c.courseid
WHERE 
    uc.usercourse_id = ?
GROUP BY 
    uc.usercourse_id, 
    uc.semester, 
    uc.academic_year, 
    uc.branch, 
    uc.co_count, 
    uc.created_at, 
    u.depart, 
    c.coursecode, 
    c.course_name, 
    c.created_time
ORDER BY 
    teacher_names
`;
  db.query(sql, [userCourseId], (Err, result) => {
    if (Err) {
      
      console.log(Err);
    }
    console.log(result)
   return  res.status(200).json(result);
  });
};



export const user_course_registration_admin_side = (req, res) => {
  const { formData } = req.body;

  console.log(formData);

  // Check if formData is valid
  if (!Array.isArray(formData) || formData.length === 0) {
    
    return res.status(400).json({ error: "Invalid or missing form data." });
  }

  // Validate required fields
  const requiredFields = ["academic_year", "branch", "course_code", "sem", "user_id"];
  for (const course of formData) {
    for (const field of requiredFields) {
      if (!course[field]) {
        
        return res.status(400).json({ error: `Missing field: ${field}` });
      }
    }
  }

  // SQL queries
  const courseSql = `
    SELECT courseid, course_name FROM copo_course WHERE coursecode = ?
  `;

  const checkDuplicateSql = `
  SELECT * FROM copo_user_course WHERE user_id = ? AND course_id = ?
`;
  const insertSql = `
    INSERT INTO copo_user_course 
    (user_id, course_id, semester, academic_year, branch, co_count, created_at) 
    VALUES (?, ?, ?, ?, ?, ?, NOW())
  `;

  // Helper function to query the database and return a promise
  const queryDb = (sql, params) => {
    return new Promise((resolve, reject) => {
      db.query(sql, params, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  };

  // Process each course in formData
  const promises = formData.map(async (course) => {
    try {
      // Fetch the course ID and name
      const courseResult = await queryDb(courseSql, [course.course_code]);
      if (courseResult.length === 0) {
        
        throw new Error(`Invalid course code: ${course.course_code}`);
      }

      const { courseid, course_name } = courseResult[0];
      const duplicateCheck = await queryDb(checkDuplicateSql, [course.user_id, courseid]);
      if (duplicateCheck.length > 0) {
        throw new Error(`Course already exists for user: ${course.course_code}`);
      }
      // Insert the course registration
      const values = [
        course.user_id,           // user_id
        courseid,                 // course_id
        course.sem,               // semester
        course.academic_year,     // academic_year
        course.branch,            // branch
        0                        // co_count (default value 1)
      ];

      await queryDb(insertSql, values);
      return { course_name, course_code: course.course_code, status: "success" };
    } catch (error) {
      console.error(`Error processing course ${course.course_code}:`, error);
      return { course_code: course.course_code, status: "error", error: error.message };
    }
  });

  // Execute all promises and handle the results
  Promise.all(promises)
    .then((results) => {
      const errors = results.filter((result) => result.status === "error");
      const successes = results.filter((result) => result.status === "success");

      if (errors.length > 0) {
        const failedCourses = errors.map((err) => err.course_code).join(", ");
        
       return res.status(400).json({
          error: `The following courses could not be added: ${failedCourses}`,
        });
      } else {
        const addedCourses = successes.map((success) => success.course_name).join(", ");
        
        return res.status(200).json({
          message: `All courses successfully added: ${addedCourses}`,
        });
      }
    })
    .catch((error) => {
      console.error("Unexpected error:", error);
      
      return res.status(500).json({ error: "An unexpected error occurred while processing the request." });
    });
};
