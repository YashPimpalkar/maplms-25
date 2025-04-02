import { connection as db} from "../../../config/dbConfig.js"; 

export const createCohort = (req, res) => {
    const { user_id, cohort_name, branch, semester, classname, academic_year } = req.body;
    const sql = 'INSERT INTO copo_cohort (user_id, cohort_name, branch, semester, classname, academic_year) VALUES (?, ?, ?, ?, ?, ?)';
    
    db.query(sql, [user_id, cohort_name, branch, semester, classname, academic_year], (error, result) => {
      if (error) {
        console.error('Error creating cohort:', error);
        
        return res.status(500).json({ error: 'Failed to create cohort' });
      }
      
     return res.status(201).json({ message: 'Cohort created successfully', cohortId: result.insertId });
    });
  };


  export const getAllCohortsbyUID = (req, res) => {
    const uid = req.params.uid
    const sql = 'SELECT c.*,b.bname FROM copo_cohort as c inner join branch as b on c.branch = b.branch_id where user_id = ? order by created_time';
    
    db.query(sql, [uid], (error, rows) => {
      if (error) {
        console.error('Error fetching cohorts:', error);
        
        return res.status(500).json({ error: 'Failed to fetch cohorts' });
      }
      
    return  res.status(200).json(rows);
    });
  };



  export const get_cohort_name = (req, res) => {
    const { cohort_id } = req.params; // Destructure cohort_id from req.params
    // console.log(cohort_id); // Verify the cohort_id is being received correctly
  
    const sql = "SELECT c FROM copo_cohort  WHERE cohort_id = ?";
  
    db.query(sql, [cohort_id], (error, results) => {
      if (error) {
        console.error('Error fetching cohort: ', error);
        
        return res.status(500).json({ message: 'Internal Server Error' });
      }
  
      if (results.length > 0) {
        
       return  res.status(200).json(results);
      } else {
        
       return res.status(404).json({ message: 'Cohort not found' });
      }
    });
  };








  export const Get_All_Students = (req, res) => {
    // console.log("Fetching students...");
    const sql = `SELECT 
    csd.sid,
    csd.student_name,
    csd.stud_clg_id,
    csd.branch,
    csd.academic_year,
    csdd.semester,
    csdd.email
FROM 
    copo_copo_students_details csd
INNER JOIN 
    copo_copo_students_detail csdd
ON 
    csd.sid = csdd.sid;
`;
  
    db.query(sql, (error, results) => {
      if (error) {
        console.error('Error fetching students:', error);
        
        return res.status(500).json(  'Internal Server Error' );
      }
      
     return  res.status(200).json(results);
    });
  };



  export const assignStudentsToCohort = (req, res) => {
    const { cohort_id } = req.params; // Cohort ID from URL
    const { selectedStudents } = req.body; // Array of selected student IDs
    const cohortIdAsInt = parseInt(cohort_id); 
    // Insert each student into the student_cohort table
    const values = selectedStudents.map(sid => [sid, cohortIdAsInt]);
    const sql = 'INSERT INTO copo_student_cohort (student_id, cohort_id) VALUES ?';
  
    db.query(sql, [values], (error) => {
      if (error) {
        console.error('Error inserting students into cohort:', error);
        
        return res.status(500).json({ message: 'Internal Server Error' });
      }
      
     return  res.status(200).json({ message: 'Students assigned to cohort successfully' });
    });
  };




  
  export const getCohortStudents = (req, res) => {
    const { cohort_id } = req.params;
  
    const sql = `
      SELECT 
    csd.sid ,
    csd.student_name,
    csd.stud_clg_id,
    csd.branch,
    csd.academic_year,
    csdd.semester,
    csdd.email
FROM 
    copo_student_cohort sc
INNER JOIN 
    copo_copo_students_details csd
ON 
    sc.student_id = csd.sid
INNER JOIN 
    copo_copo_students_detail csdd
ON 
    csd.sid = csdd.sid
 WHERE sc.cohort_id = ?
    `;
  
    db.query(sql, [cohort_id], (error, results) => {
      if (error) {
        console.error('Error fetching cohort students:', error);
        
        return res.status(500).json({ message: 'Internal Server Error' });
      }
      
      return res.status(200).json(results);
    });
  };
  


    // Remove a single student from the cohort
    export const removeStudentFromCohort = (req, res) => {
        const { cohortId, studentId } = req.params;
      
        // Check if cohortId and studentId exist
        if (!cohortId || !studentId) {
          return res.status(400).json({ message: 'Cohort ID and Student ID are required' });
        }
      
        const sql = 'DELETE FROM copo_student_cohort WHERE (student_id = ? AND cohort_id = ?)';
      
        // Reverse the order of studentId and cohortId here
        db.query(sql, [studentId, cohortId], (error, results) => {
          if (error) {
            console.log(error)
            console.error('Error removing student from cohort:', error);
            
            return res.status(500).json({ message: 'Error removing student from cohort', error });
          }
      
          // Check if any rows were affected by the delete query
          if (results.affectedRows > 0) {
            
            return res.status(200).json({ message: 'Student removed successfully from the cohort' });
          } else {
            
            return res.status(404).json({ message: 'Student not found in this cohort' });
          }
        });
      };



        
  // Remove all students from a specific cohort
export const removeAllStudentsFromCohort = (req, res) => {
    const { cohortId } = req.params;
  
    const query = 'DELETE FROM copo_student_cohort WHERE cohort_id = ?';
  
    db.query(query, [cohortId], (error, results) => {
      if (error) {
        console.error('Error removing all students from cohort:', error);
        
        return res.status(500).json({ message: 'Error removing all students from cohort' });
      }
  
      if (results.affectedRows > 0) {
        
        return res.status(200).json({ message: 'All students removed successfully from the cohort' });
      } else {
        
        return res.status(404).json({ message: 'No students found in this cohort' });
      }
    });
  };




  export const updateCohort = (req, res) => {
    const { id } = req.params;
    const { user_id, cohort_name, branch, semester, classname, academic_year } = req.body;
    const sql = 'UPDATE copo_cohort SET  cohort_name = ?, branch = ?, semester = ?, classname = ?, academic_year = ? WHERE cohort_id = ?';
    
    db.query(sql, [ cohort_name, branch, semester, classname, academic_year, id], (error, result) => {
      if (error) {
        console.error('Error updating cohort:', error);
        
        return res.status(500).json({ error: 'Failed to update cohort' });
      }
      if (result.affectedRows === 0) {
        
        return res.status(404).json({ error: 'Cohort not found' });
      }
      
      return res.status(200).json({ message: 'Cohort updated successfully' });
    });
  };

  
  export const deleteCohort = (req, res) => {
    const { id } = req.params; // Cohort ID
    const deleteStudentCohortSQL = 'DELETE FROM copo_student_cohort WHERE cohort_id = ?';
    const deleteCohortSQL = 'DELETE FROM copo_cohort WHERE cohort_id = ?';
  
    // Delete from student_cohort first
    db.query(deleteStudentCohortSQL, [id], (error, result) => {
      if (error) {
        console.error('Error deleting student-cohort associations:', error);
        
        return res.status(500).json({ error: 'Failed to delete student-cohort associations' });
      }
  
      // Delete from cohort table
      db.query(deleteCohortSQL, [id], (error, result) => {
        if (error) {
          console.error('Error deleting cohort:', error);
          
          return res.status(500).json({ error: 'Failed to delete cohort' });
        }
        if (result.affectedRows === 0) {
          
          return res.status(404).json({ error: 'Cohort not found' });
        }
        
        return res.status(200).json({ message: 'Cohort and associated records deleted successfully' });
      });
    });
  };


  export const getCohortById = (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM copo_cohort WHERE cohort_id = ?';
    
    db.query(sql, [id], (error, rows) => {
      if (error) {
        console.error('Error fetching cohort:', error);
        
        return res.status(500).json({ error: 'Failed to fetch cohort' });
      }
      if (rows.length === 0) {
        
        return res.status(404).json({ error: 'Cohort not found' });
      }
      
     return  res.status(200).json(rows[0]);
    });
  };
  
  
  
