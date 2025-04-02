import expressAsyncHandler from "express-async-handler";
import { connection as db} from "../../../config/dbConfig.js"; 

export const show_classroom  = (req, res) => {
    const { uid } = req.params; // Extract `userid` from request parameters
    const sql = `
       SELECT 
    uc.usercourse_id AS classroom_id,
    ucu.user_id,  -- Now fetching user_id from copo_usercourse_users
    uc.course_id,
    uc.semester,
    uc.academic_year,
    b.bname AS branch,
    uc.co_count,
    uc.created_at,
    u.teacher_name,
    c.course_name AS room_name,
    c.coursecode
FROM 
    copo_user_course uc
JOIN 
    copo_usercourse_users ucu ON uc.usercourse_id = ucu.usercourse_id  -- New join
JOIN 
    copo_users u ON ucu.user_id = u.userid  -- Fetch user_id from new table
JOIN 
    copo_course c ON uc.course_id = c.courseid
JOIN 
    branch b ON uc.branch = b.branch_id
WHERE 
    ucu.user_id = ?;  
    `;

    db.query(sql, [uid], (error, rows) => {
        if (error) {
            console.error('Error fetching user courses:', error);
            
            return res.status(500).json({ error: 'Failed to fetch user courses' });
        }
        if (rows.length === 0) {
            
            return res.status(404).json({ error: 'No user courses found' });
        }
        
        return res.status(200).json(rows);
    });
};





export const fetch_cohorts_byuser =expressAsyncHandler ((req, res) => {
    const { uid } = req.params;
    // Adjust the SQL query to fetch all cohorts ordered from latest to oldest
    const sql = "SELECT * FROM copo_cohort WHERE user_id = ? ORDER BY created_time DESC"; // Change 'created_at' to your actual timestamp column name
    try {
        db.query(sql, uid, (error, results) => {
            if (error) {
                console.error('Error fetching cohorts:', error);
                
                return res.status(500).json({ error: error.message });
            }
            
           return  res.status(200).json(results);
        });
    } catch (err) {
        console.error('Error fetching cohorts:', err);
        
        res.status(500).json({ error: 'Error fetching cohorts' });
    }
});





// Add Students to Class
export const addStudentsToClass = (req, res) => {
    const { classId } = req.params;
    const { selectedStudents,t_id } = req.body;

    // Validate input
    if (!selectedStudents || !Array.isArray(selectedStudents) || selectedStudents.length === 0) {
        
        return res.status(400).json({ message: 'No students provided' });
    }
    if (!t_id) {
        return res.status(400).json({ message: 'Teacher ID is required' });
    }

    // Prepare values for insertion
    const values = selectedStudents.map(sid => `(${sid}, ${classId}, ${t_id})`).join(',');

    const query = `INSERT INTO copo_class_students_table (sid, class_id,t_id) VALUES ${values} 
                   ON DUPLICATE KEY UPDATE student_class_id = LAST_INSERT_ID(student_class_id)`;

    // Execute the query
    db.query(query, (error, result) => {
        if (error) {
            console.error('Error adding students:', error);
            
            return res.status(500).json({ message: 'Error adding students' });
        }
        
        return  res.status(201).json({ message: 'Students added successfully' });
    });
};

// Delete All Students from Class
// Delete All Students from Class
// Delete All Students from Class
export const deleteAllStudentsFromClass = (req, res) => {

    try {
        const { classId ,tid} = req.params;

        const query = `DELETE FROM copo_class_students_table WHERE class_id = ? and t_id=?`;

        // Execute the query
        db.query(query, [classId,tid], (error, result) => {
            if (error) {
                console.error('Error deleting students:', error);
                
                return res.status(500).json({ message: 'Error deleting students' });
            }

            // Check if any rows were affected
            if (result.affectedRows === 0) {
                
                return res.status(200).json({ message: 'No students found in the class' });
            }
            
            return   res.status(200).json({ message: 'All students removed from the class successfully', affectedRows: result.affectedRows });
        });

    } catch (error) {
        console.log(error)
    }
};



// Delete One Student from Class
// Delete a Student from Class
export const deleteStudentFromClass = async (req, res) => {
    const { classId, sid,tid } = req.params;
    const classIdAsInt = parseInt(classId); // Convert cohortId to an integer
    const sidAsInt = parseInt(sid); // Convert cohortId to an integer
    console.log("classId:", classId, "sid:", sid);  // Log the parameters

    const query = `DELETE FROM copo_class_students_table WHERE class_id = ? AND sid = ? AND t_id=?`;
    console.log(typeof classIdAsInt);
    try {
        // Execute the query
        db.query(query, [classIdAsInt, sidAsInt,tid], (error, result) => {
            if (error) {
                console.error('Error deleting students:', error);
                
                return res.status(500).json({ message: 'Error deleting students' });
            }

            // Log the query result for debugging
            console.log('Query Result:', result);

            // Check if any rows were affected (i.e., student was found and deleted)
            if (result.affectedRows === 0) {
                
                return res.status(404).json({ message: 'Student not found in the class' });
            }
            
           return res.status(200).json({ message: 'Student removed from the class successfully', affectedRows: result.affectedRows });
        });

    } catch (error) {
        console.error('Error deleting student:', error.message); 
         // Log the error
        return res.status(500).json({ message: 'Error deleting student' });
    }
};



export const getClassroomStudents = (req, res) => {
    const { classId } = req.params; // Assuming classId is passed as a parameter

    const sql = `
      SELECT 
    csd.sid,
    csd.student_name,
    csd.stud_clg_id,
    csd.branch,
    csd.academic_year,
    csdd.semester,
    csdd.email,
    cst.t_id
FROM 
    copo_class_students_table cst
INNER JOIN 
    copo_copo_students_details csd
ON 
    cst.sid = csd.sid
INNER JOIN 
    copo_copo_students_detail csdd
ON 
    csd.sid = csdd.sid
WHERE 
    cst.class_id = ?;

    `;

    db.query(sql, [classId], (error, results) => {
        if (error) {
            console.error('Error fetching classroom students:', error);
            
            return res.status(500).json({ message: 'Internal Server Error' });
        }
        
    return  res.status(200).json(results);
    });
};


export const getClassroomDetails = expressAsyncHandler(async (req, res) => {
    const { classroom_id } = req.params;
  
    const query = `
     

 SELECT 
    uc.usercourse_id AS classroom_id,
    GROUP_CONCAT(DISTINCT ucu.user_id ORDER BY ucu.user_id ASC SEPARATOR ', ') AS user_ids,  -- Concatenates multiple user IDs
    uc.course_id,
    uc.semester,
    uc.academic_year,
    b.bname AS branch,
    uc.co_count,
    uc.created_at,
    GROUP_CONCAT(DISTINCT u.teacher_name ORDER BY u.teacher_name ASC SEPARATOR ', ') AS teacher_names,  -- Concatenates multiple teacher names
    c.course_name AS room_name,
    c.coursecode
FROM 
    copo_user_course uc
JOIN 
    copo_usercourse_users ucu ON uc.usercourse_id = ucu.usercourse_id  -- New join to get user_id
JOIN 
    copo_users u ON ucu.user_id = u.userid  -- Fetching user details using new mapping table
JOIN 
    copo_course c ON uc.course_id = c.courseid
JOIN 
    branch b ON uc.branch = b.branch_id
WHERE 
    uc.usercourse_id = ?  -- Filtering by usercourse_id
GROUP BY 
    uc.usercourse_id, uc.course_id, uc.semester, uc.academic_year, b.bname, uc.co_count, uc.created_at, c.course_name, c.coursecode;  -- Grouping to avoid duplicates

    `;
  
    db.query(query, [classroom_id], (error, results) => {
      if (error) {
        console.error('Error fetching classroom details:', error);
        
        return res.status(500).json({ message: 'Failed to retrieve classroom details', error });
      }
  
      if (results.length > 0) {
        
        return res.status(200).json(results[0]);
      } else {
        
        res.status(404).json({ message: 'Classroom not found' });
      }
    });
  });


