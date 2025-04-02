import { connection as db } from "../../config/dbConfig.js";

export const user_course_registration = (req, res) => {
  const course = req.body.formData[0]; // Access the single course object
  console.log("Received course:", course);

  if (!course) {
    return res.status(400).json({ error: "No course provided" });
  }

  // Validate required fields
  const { user_ids, course_code, sem, academic_year, branch } = course;
  if (!user_ids || user_ids.length === 0 || !course_code || !sem || !academic_year || !branch) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Step 1: Get Course ID
  const queryCourse = `SELECT courseid FROM copo_course WHERE coursecode = ?`;

  db.query(queryCourse, [course_code], (err, result) => {
    if (err) {
      console.error("Error querying the database:", err);
      return res.status(500).json({ error: "Database error while fetching course ID" });
    }

    const course_id = result[0]?.courseid;
    if (!course_id) {
      return res.status(400).json({ error: "Course ID not found for the given course code" });
    }

    // Step 2: Check if course already exists in copo_user_course
    const queryCheckCourse = `
      SELECT usercourse_id FROM copo_user_course 
      WHERE course_id = ? AND academic_year = ? LIMIT 1`;

    db.query(queryCheckCourse, [course_id, academic_year], (err, checkResult) => {
      if (err) {
        console.error("Error checking course existence:", err);
        return res.status(500).json({ error: "Database error while checking existing course" });
      }

      if (checkResult.length > 0) {
        // If course already exists, return an error (do not proceed)
        return res.status(400).json({ error: "Course already exists for this academic year" });
      }

      // Step 3: Insert new course into copo_user_course
      const queryInsertCourse = `
        INSERT INTO copo_user_course (course_id, semester, academic_year, branch, co_count, created_at)
        VALUES (?, ?, ?, ?, 0, NOW())`;

      db.query(queryInsertCourse, [course_id, sem, academic_year, branch], (err, courseResult) => {
        if (err) {
          console.error("Error inserting course:", err);
          return res.status(500).json({ error: "Database error while saving course" });
        }

        const usercourse_id = courseResult.insertId; // Get the inserted usercourse_id
        insertUsers(usercourse_id, user_ids, res);
      });
    });
  });
};

// Function to insert users while avoiding duplicates
const insertUsers = (usercourse_id, user_ids, res) => {
  const queryInsertUsers = `
    INSERT INTO copo_usercourse_users (usercourse_id, user_id)
    VALUES ?`;

  const values = user_ids.map(({ id }) => [usercourse_id, id]);

  db.query(queryInsertUsers, [values], (err, userResult) => {
    if (err) {
      console.error("Error inserting users:", err);
      return res.status(500).json({ error: "Database error while saving users" });
    }

    return res.status(201).json({
      message: "Course registration successful",
      usercourse_id,
      inserted_users: user_ids.map(({ id, name }) => ({ id, name })),
    });
  });
};





export const Show_Usercourse = (req, res) => {
  const uid = req.params.uid;
  const  { academic_year} = req.body ;
  console.log(uid,academic_year,req.body)
  if (!academic_year || !uid) {
    return res.status(400).json({ error: "Academic year and user ID are required" });
  }

  const sql = `
    SELECT 
      csc.usercourse_id, 
      c.course_name, 
      csc.semester, 
      csc.academic_year, 
      b.branchname, 
      csc.co_count, 
      csc.created_at, 
      GROUP_CONCAT(DISTINCT cuu.user_id ORDER BY cuu.user_id SEPARATOR ', ') AS user_ids,
      GROUP_CONCAT(DISTINCT cu.teacher_name ORDER BY cuu.user_id SEPARATOR ', ') AS teacher_names
    FROM copo_user_course AS csc
    INNER JOIN copo_branch AS b ON csc.branch = b.idbranch
    INNER JOIN copo_course AS c ON csc.course_id = c.courseid
    LEFT JOIN copo_usercourse_users AS cuu ON csc.usercourse_id = cuu.usercourse_id
    LEFT JOIN copo_users AS cu ON cuu.user_id = cu.userid
    WHERE csc.academic_year = ?
    AND csc.branch = (SELECT depart FROM copo_users WHERE userid = ?)
    GROUP BY csc.usercourse_id, c.course_name, csc.semester, csc.academic_year, 
             b.branchname, csc.co_count, csc.created_at;
  `;

  db.query(sql, [academic_year, uid], (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ error: "Database error while fetching user courses" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "No courses found for the given academic year" });
    }

    res.status(200).json(results);
  });
};



export  const Academic_year = (req, res) => { 
    const sql =   `SELECT DISTINCT academic_year from copo_user_course`;
    db.query(sql, (err, result) => {
        if(err) {
          console.error("Error fetching records:", err);  
          return res.status(500).json({ error: "Database error" });
        }
        return res.status(200).json(result);
    });

}




