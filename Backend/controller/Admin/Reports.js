import expressAsyncHandler from "express-async-handler";
import { connection as db } from "../../config/dbConfig.js";








export const coursewise_set_reports = (req, res) => {
  
  const { uid } = req.params;
  const { selectedYear } = req.query;

  // Validate inputs
  if (!uid || !selectedYear) {
    
    return res
      .status(400)
      .json({ error: "User ID and Academic Year are required." });
  }

  const sql = `SELECT 
    cuc.usercourse_id,
    cuc.course_id,
    cc.coursecode,
    cc.course_name,
    cuc.semester,
    cuc.academic_year,
    cuc.branch,
    cuc.co_count,
    cuc.created_at,
    GROUP_CONCAT(DISTINCT cu.userid ORDER BY cu.userid SEPARATOR ', ') AS user_id,
    GROUP_CONCAT(DISTINCT cu.teacher_name ORDER BY cu.userid SEPARATOR ', ') AS teacher_name,
    cca.po_1, cca.po_2, cca.po_3, cca.po_4, cca.po_5, cca.po_6, 
    cca.po_7, cca.po_8, cca.po_9, cca.po_10, cca.po_11, cca.po_12,
    cca.pso_1, cca.pso_2, cca.pso_3, cca.pso_4,
    cca.isset
FROM copo_user_course cuc
JOIN copo_course cc ON cuc.course_id = cc.courseid
JOIN copo_usercourse_users cuu ON cuc.usercourse_id = cuu.usercourse_id
JOIN copo_users cu ON cuu.user_id = cu.userid
LEFT JOIN copo_co_po_averages cca ON cuc.usercourse_id = cca.usercourse_id
WHERE (cuc.academic_year = ?
       AND cuc.branch = (SELECT depart FROM copo_users WHERE userid = ?) 
       AND cca.isset = 0)
GROUP BY cuc.usercourse_id, cc.course_name, 
         cca.po_1, cca.po_2, cca.po_3, cca.po_4, cca.po_5, cca.po_6, 
         cca.po_7, cca.po_8, cca.po_9, cca.po_10, cca.po_11, cca.po_12,
         cca.pso_1, cca.pso_2, cca.pso_3, cca.pso_4, cca.isset
ORDER BY cuc.semester ASC, cc.coursecode ASC;

`;

  db.query(sql, [selectedYear, uid], (error, results) => {
    if (error) {
      console.error("Error fetching records:", error);
      
      return res.status(500).json({ error: "Database error" });
    }
    console.log(results);
    
    return res.status(200).json(results);
  });
};

export const coursewise_target_reports = (req, res) => {
  
  const { uid } = req.params;
  const { selectedYear } = req.query;
  // Validate inputs
  if (!uid || !selectedYear) {
    
    return res
      .status(400)
      .json({ error: "User ID and Academic Year are required." });
  }

  const sql = `SELECT 
    cuc.usercourse_id,
    cuc.course_id,
    cc.coursecode,
    cc.course_name,
    cuc.semester,
    cuc.academic_year,
    cuc.branch,
    cuc.co_count,
    cuc.created_at,
    GROUP_CONCAT(DISTINCT cu.userid ORDER BY cu.userid SEPARATOR ', ') AS user_id,
    GROUP_CONCAT(DISTINCT cu.teacher_name ORDER BY cu.userid SEPARATOR ', ') AS teacher_name,
    cca.po_1, cca.po_2, cca.po_3, cca.po_4, cca.po_5, cca.po_6, 
    cca.po_7, cca.po_8, cca.po_9, cca.po_10, cca.po_11, cca.po_12,
    cca.pso_1, cca.pso_2, cca.pso_3, cca.pso_4,
    cca.isset
FROM copo_user_course cuc
JOIN copo_course cc ON cuc.course_id = cc.courseid
JOIN copo_usercourse_users cuu ON cuc.usercourse_id = cuu.usercourse_id
JOIN copo_users cu ON cuu.user_id = cu.userid
LEFT JOIN copo_co_po_averages cca ON cuc.usercourse_id = cca.usercourse_id
WHERE (cuc.academic_year = ?
       AND cuc.branch = (SELECT depart FROM copo_users WHERE userid = ?) 
       AND cca.isset = 1)
GROUP BY cuc.usercourse_id, cc.course_name, 
         cca.po_1, cca.po_2, cca.po_3, cca.po_4, cca.po_5, cca.po_6, 
         cca.po_7, cca.po_8, cca.po_9, cca.po_10, cca.po_11, cca.po_12,
         cca.pso_1, cca.pso_2, cca.pso_3, cca.pso_4, cca.isset
ORDER BY cuc.semester ASC, cc.course_name ASC;
`;

  db.query(sql, [selectedYear, uid], (error, results) => {
  
    if (error) {
      console.error("Error fetching records:", error);
      
      return res.status(500).json({ error: "Database error" });
    }
    console.log(results);
    
    return res.status(200).json(results);
  });
};

export const CourseOutcomeWise_Report = (req, res) => {

  const { uid } = req.params;
  const { selectedYear } = req.query;
  const sql = `SELECT 
    u.teacher_name, 
    c.course_name, 
    uc.academic_year, 
    c.coursecode, 
    uc.semester, 
    cr.*
FROM copo_cos_result cr
JOIN copo_user_course uc ON cr.usercourse_id = uc.usercourse_id
JOIN copo_usercourse_users cuu ON uc.usercourse_id = cuu.usercourse_id
JOIN copo_users u ON cuu.user_id = u.userid
JOIN copo_course c ON uc.course_id = c.courseid
WHERE (uc.branch = (SELECT depart FROM copo_users WHERE userid = ? LIMIT 1))
  AND uc.academic_year = ?
ORDER BY uc.semester, c.course_name;
    `;
  db.query(sql, [uid, selectedYear], (error, results) => {
    if (error) {
      console.error("Error fetching records:", error);
       
      return res.status(500).json({ error: "Database error" });
    }
    console.log(results);
    
    return res.status(200).json(results);
  });
};

export const academic_year_wise_branch_users = (req, res) => {
  
  const { uid } = req.params;
  const { selectedYear } = req.query;

  const sql = `SELECT DISTINCT 
    u.teacher_name, 
    u.userid, 
    u.depart
FROM copo_users u
JOIN copo_usercourse_users cuu ON u.userid = cuu.user_id
JOIN copo_user_course uc ON cuu.usercourse_id = uc.usercourse_id
WHERE uc.branch = (SELECT depart FROM copo_users WHERE userid = ?)
  AND uc.academic_year = ?
  AND u.isuser = 2;
`;

  db.query(sql, [uid, selectedYear], (error, results) => {
    if (error) {
      console.error("Error fetching records:", error);
      
      return res.status(500).json({ error: "Database error" });
    }
    console.log(results);
    
    return res.status(200).json(results);
  });
};

export const teacher_report_acdemic_year_wise = (req, res) => {
  
  const { uid } = req.params;
  const { selectedYear } = req.query;

  const sql = `
SELECT 
    uc.academic_year,
    uc.semester,
    uc.usercourse_id,
    cu.userid AS user_id,  -- Corrected column name
    uc.course_id,
    uc.branch,
    uc.co_count,
    c.coursecode,
    c.course_name,
    c.created_time,
    cpa.po_1,
    cpa.po_2,
    cpa.po_3,
    cpa.po_4,
    cpa.po_5,
    cpa.po_6,
    cpa.po_7,
    cpa.po_8,
    cpa.po_9,
    cpa.po_10,
    cpa.po_11,
    cpa.po_12,
    cpa.pso_1,
    cpa.pso_2,
    cpa.pso_3,
    cpa.pso_4,
    cpa.isset
FROM copo_user_course uc
JOIN copo_course c ON uc.course_id = c.courseid
JOIN copo_usercourse_users cuu ON uc.usercourse_id = cuu.usercourse_id
JOIN copo_users cu ON cuu.user_id = cu.userid
LEFT JOIN copo_co_po_averages cpa ON uc.usercourse_id = cpa.usercourse_id
WHERE cu.userid = ?
  AND uc.academic_year = ?
ORDER BY uc.semester ASC, c.coursecode ASC;
 `;

  db.query(sql, [uid, selectedYear], (error, results) => {
    if (error) {
      console.error("Error fetching records:", error);
      
      return res.status(500).json({ error: "Database error" });
    }
    console.log(results);
    
    return res.status(200).json(results);
  });
};

export const progress_tracker = (req, res) => {
  
  const uid = req.params.uid;
  // console.log(uid)
  let counter = 0;
  let points = 0;

  const sqlCos = `SELECT * FROM copo_cos WHERE usercourse_id = ?`;
  const sqlTermwork = `SELECT tw_id FROM copo_termwork_table WHERE usercourseid = ?`;
  const sqlAttainment = `SELECT curriculum_id, COUNT(*) AS count FROM copo_attainment_table WHERE usercourse_id = ? GROUP BY curriculum_id`;
  const sqlCoPoAverages = `SELECT COUNT(*) AS isset_count FROM copo_co_po_averages WHERE usercourse_id = ? AND isset IS NOT NULL`;

  // Check 'cos' table
  db.query(sqlCos, [uid], (error, cosResult) => {
    if (error) {
      console.error("Error in cos query", error);
      
      return res.status(500).json({ message: "Error occurred in cos query." });
    }

    if (cosResult.length > 0) {
      points++;
    }
    counter++;
    db.query(sqlTermwork, [uid], (error, termworkResult) => {
      if (error) {
        console.error("Error in termwork query", error);
        
        return res
          .status(500)
          .json({ message: "Error occurred in termwork query." });
      }
      let twid = 0;
      counter++;
      //  console.log(termworkResult.length)
      if (termworkResult.length > 0) {
        points++;
        twid = termworkResult[0].tw_id;
      }

      //  console.log("twid",twid,"counter",counter,points)
      // For each row in 'termwork_table', apply points logic

      if (twid === 1) {
        counter += 4;
      } else if (twid === 2) {
        counter += 5;
      } else if ([3, 8, 5, 6, 12].includes(twid)) {
        counter += 2;
      } else if ([4, 7, 11, 13, 14].includes(twid)) {
        counter += 3;
      } else if (twid === 9) {
        counter += 5;
      } else {
        counter += 5;
      }

      // console.log(points,"points",counter,"conter")
      // Check 'attainment_table'
      db.query(sqlAttainment, [uid], (error, attainmentResult) => {
        if (error) {
          console.error("Error in attainment query", error);
          
          return res
            .status(500)
            .json({ message: "Error occurred in attainment query." });
        }

        if (attainmentResult.length > 0) {
          points += attainmentResult[0].count;
          console.log("points", points);
        }
        // Increase points by the count from 'attainment_table'

        // Check 'co_po_averages' table
        db.query(sqlCoPoAverages, [uid], (error, coPoAveragesResult) => {
          if (error) {
            console.error("Error in co_po_averages query", error);
            
            return res
              .status(500)
              .json({ message: "Error occurred in co_po_averages query." });
          }

          // Increase points based on the count of 'isset'
          if (coPoAveragesResult.length > 0) {
            points += coPoAveragesResult[0].isset_count;
          }

          // Finally, increase counter by 2
          counter += 2;

          // Send the final response with the calculated counter and points
          res.status(200).json({ counter, points });
        });
      });
    });
  });
};

export const get_usercourses_by_branch = (req, res) => {
  
  const { uid } = req.params;
  const { selectedYear } = req.query;
  console.log(uid, selectedYear);
  const sql = `SELECT
    uc.usercourse_id,
    uc.semester,
    c.course_name,
    c.coursecode,
    GROUP_CONCAT(DISTINCT u.teacher_name ORDER BY u.teacher_name SEPARATOR ', ') AS teacher_name
FROM
    copo_user_course uc
JOIN
    copo_course c ON uc.course_id = c.courseid
JOIN
    copo_usercourse_users cuu ON uc.usercourse_id = cuu.usercourse_id
JOIN
    copo_users u ON cuu.user_id = u.userid
WHERE
    uc.academic_year = ?
    AND (uc.branch = (SELECT depart FROM copo_users WHERE userid = ?))
GROUP BY
    uc.usercourse_id, uc.semester, c.course_name;
`;

  db.query(sql, [selectedYear, uid], (error, results) => {
    if (error) {
      console.error("Error fetching records:", error);
      
      return res.status(500).json({ error: "Database error" });
    }
    // console.log(results);
    
    return res.status(200).json(results);
  });
};



export const cosresultsreports = (req,res)=>{
  
    const uid =req.params.uid;
   console.log(uid)
    const sql=`select * from copo_co_po_result where usercourse_id = ?`

    db.query(sql, [uid], (error, results) => {
        if (error) {
          console.error("Error fetching records:", error);
          
          return res.status(500).json({ error: "Database error" });
        }
        console.log(results);
        
        return res.status(200).json(results);
      });
}


export const avarages_popso = (req,res)=>{
  
    const uid=req.params.uid;
    const sql= `select * from copo_co_po_averages where usercourse_id=?`
    db.query(sql, [uid], (error, results) => {
        if (error) {
          console.error("Error fetching records:", error);
          
          return res.status(500).json({ error: "Database error" });
        }
        console.log(results);
        
        return res.status(200).json(results);
      });
}


export const semsterwisereport = (req,res) =>{
  
  const { uid } = req.params;
  const { selectedYear } = req.query;
  const sql=`SELECT 
    uc.usercourse_id,
    uc.semester,
    uc.academic_year,
    uc.branch,
    c.coursecode,
    c.course_name,
    GROUP_CONCAT(DISTINCT u.teacher_name ORDER BY u.teacher_name SEPARATOR ', ') AS teacher_name
FROM 
    copo_user_course uc
JOIN 
    copo_usercourse_users cuu ON uc.usercourse_id = cuu.usercourse_id
JOIN 
    copo_users u ON cuu.user_id = u.userid
JOIN 
    copo_course c ON c.courseid = uc.course_id
WHERE 
    uc.academic_year = ?
    AND uc.branch = (
        SELECT depart 
        FROM copo_users 
        WHERE userid = ?
        LIMIT 1
    )
GROUP BY 
    uc.usercourse_id, uc.semester, uc.academic_year, uc.branch, c.coursecode, c.course_name
ORDER BY 
    uc.semester ASC, c.coursecode ASC;
`
db.query(sql,[selectedYear,uid],(error,results)=>{
  if (error) {
    console.error("Error fetching records:", error);
    
    return res.status(500).json({ error: "Database error" });
  }
  // console.log(results);
  
  return res.status(200).json(results);
})
}


