import { connection as db } from "../../config/dbConfig.js";

export const get_student_feedbacks = (req, res) => {
    const { sid } = req.params;

    const sql = `
        SELECT 
        uc.*,
        c.course_name,
        COUNT(qm.idquestion_main) AS total_questions,
        SUM(CASE WHEN tm.marks IS NULL THEN 1 ELSE 0 END) AS total_unmarked_questions
    FROM 
        copo_table_main tm
    JOIN 
        copo_question_main qm ON tm.idquestion = qm.idquestion_main
    JOIN 
        copo_upload_main um ON qm.qid = um.idupload_main
    JOIN 
        copo_user_course uc ON um.usercourseid = uc.usercourse_id
    JOIN 
        copo_course c ON uc.course_id = c.courseid
    WHERE 
         (tm.sid = ? AND tm.marks IS NULL AND um.curriculum_no = 17 and um.status = 1)
    GROUP BY 
        uc.usercourse_id, c.course_name;
        `;
    db.query(sql, [sid], (error, results) => {
        if (error) {
        console.log(error);
        console.error("Error querying database:", err);
        
        return res.status(500).json({ error: "Internal server error" });
        }
        
        res.status(200).json(results);
    });
    };

    export const GetStudentFeedbackQuestions = (req, res) => {
        const { sid } = req.params;
        const { usercourseid } = req.query; // Correctly using req.query for usercourseid
    
        const sql = `SELECT 
            qm.idquestion_main,
            qm.qname,
            qm.qid,
            qm.qmarks
        FROM 
            copo_table_main tm
        JOIN 
            copo_question_main qm ON tm.idquestion = qm.idquestion_main
        JOIN 
            copo_upload_main um ON qm.qid = um.idupload_main
        WHERE 
            tm.sid = ? AND tm.marks IS NULL AND um.curriculum_no = 17 AND um.usercourseid = ?`;
    
        db.query(sql, [sid, usercourseid], (error, results) => {
            if (error) {
                console.error("Error querying database:", error);
                
                return res.status(500).json({ error: "Internal server error" });
            }
            
           return res.status(200).json(results);
        });
    };


    export const UpdateMarksForQuestions = (req, res) => {
        const { answers } = req.body;  // Get the array of answers from the request body
    
        // Validate that answers are provided
        if (!Array.isArray(answers) || answers.length === 0) {
            
            return res.status(400).json({ error: "No answers provided" });
        }
    
        // Prepare the SQL query for updating marks
        const sql = `UPDATE copo_table_main 
                     SET marks = ? 
                     WHERE idquestion = ? AND sid = ?`;
    
        // Use a transaction for multiple updates to ensure atomicity
        db.beginTransaction((err) => {
            if (err) {
                
                return res.status(500).json({ error: "Internal server error while starting transaction" });
            }
    
            // Loop through the answers and update marks for each question
            answers.forEach((answer, index) => {
                const { idquestion_main, marks, sid } = answer;
                db.query(sql, [marks, idquestion_main, sid], (error, results) => {
                    if (error) {
                        // Rollback the transaction if there's an error
                        
                        return db.rollback(() => {
                            console.error("Error updating marks:", error);
                            res.status(500).json({ error: "Internal server error while updating marks" });
                        });
                    }
    
                    // If it's the last answer, commit the transaction
                    if (index === answers.length - 1) {
                        db.commit((commitErr) => {
                            if (commitErr) {
                                
                                return res.status(500).json({ error: "Error committing transaction" });
                            }
                            
                           return res.status(200).json({ message: "Marks updated successfully" });
                        });
                    }
                });
            });
        });
    };
    