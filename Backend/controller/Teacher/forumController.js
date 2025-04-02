import { connection as db} from "../../config/dbConfig.js"; 

// Get groups assigned to a mentor
export const getMentorGroups = async (req, res) => {
    const { mentor_id } = req.params;
    console.log(mentor_id);
    
    db.query('SELECT * FROM copo_mentor_table WHERE mentor_id = ?', [mentor_id], (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        res.json(results);
    });
};


// Get messages for a forum group
export const getForumMessages = async (req, res) => {
    const { mmr_id } = req.params;

    db.query(
        `SELECT f.msg, f.created_at, 
                COALESCE(s.student_name, u.teacher_name, 'Unknown') AS sender_name,
                f.mmr_id, f.t_id, f.sid
         FROM copo_mmr_forum f
         LEFT JOIN copo_copo_students_details s ON f.sid = s.sid
         LEFT JOIN copo_users u ON f.t_id = u.userid
         WHERE f.mmr_id = ?
         ORDER BY f.created_at ASC`,
        [mmr_id],
        (error, results) => {
            if (error) {
                console.error("Database Error:", error);
                return res.status(500).json({ error: error.message });
            }
            res.json(results);
        }
    );
};



// Fetch Mentees under a Specific Mentor Group
export const getMenteesByMentorGroup = async (req, res) => {
    const { mmr_id } = req.params;

    db.query(
        'SELECT * FROM copo_mentee_table WHERE mmr_id = ?',
        [mmr_id],
        (error, results) => {
            if (error) {
                return res.status(500).json({ error: error.message });
            }
            res.json(results);
        }
    );
};

// Send message
export const sendMessage = async (req, res) => {
    const { t_id, sid, mmr_id, msg } = req.body;

    db.query(
        `INSERT INTO copo_mmr_forum (t_id, sid, mmr_id, msg, created_at) 
         VALUES (?, ?, ?, ?, NOW())`,
        [t_id || null, sid || null, mmr_id, msg],
        (error, results) => {
            if (error) {
                return res.status(500).json({ error: error.message });
            }
            res.json({ message: "Message sent successfully" });
        }
    );
};


// menteee 

// Get groups assigned to a mentee
// Get groups assigned to a mentee with full group details
export const getMenteeGroups = async (req, res) => {
    const { sid } = req.params;
    
    const query = `
        SELECT 
            cm.mmr_id, 
            cm.grp_name, 
            cm.semester, 
            cm.year, 
            cm.academic_year
        FROM copo_mentor_table cm
        JOIN copo_mentee_table cmt ON cm.mmr_id = cmt.mmr_id
        WHERE cmt.sid = ?;
    `;

    db.query(query, [sid], (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        res.json(results);
    });
};

// Get messages for a forum group (Mentee Perspective)
export const getMenteeForumMessages = async (req, res) => {
    const { mmr_id, sid } = req.params; // sid represents the mentee ID

    console.log("Fetching messages for mmr_id:", mmr_id, "and sid:", sid);

    db.query(
        `SELECT f.*,
                COALESCE(s.student_name, u.teacher_name, 'Unknown') AS sender_name
         FROM copo_mmr_forum f
         LEFT JOIN copo_copo_students_details s ON f.sid = s.sid  -- 🔹 Fetch student name
         LEFT JOIN copo_users u ON f.t_id = u.userid         -- 🔹 Fetch teacher name
         WHERE f.mmr_id = ? 
         ORDER BY f.created_at ASC`,
        [mmr_id, sid],
        (error, results) => {
            if (error) {
                console.error("Database Error:", error);
                return res.status(500).json({ error: error.message });
            }
            console.log("Fetched messages:", results);
            res.json(results);
        }
    );
};


// Fetch all mentees of a specific forum group
export const getMenteesInForumGroup = async (req, res) => {
    const { mmr_id } = req.params;

    db.query(
        'SELECT sid FROM copo_mentee_table WHERE mmr_id = ?',
        [mmr_id],
        (error, results) => {
            if (error) {
                return res.status(500).json({ error: error.message });
            }
            res.json(results);
        }
    );
};

// Mentee sends a message in a forum
export const sendMenteeMessage = async (req, res) => {
    const { sid, mmr_id, msg } = req.body;

    console.log("Received request to send message:", { sid, mmr_id, msg }); // ✅ Debug log

    if (!sid || !mmr_id || !msg.trim()) {
        console.error("Validation Error: Missing required fields.");
        return res.status(400).json({ error: "All fields (sid, mmr_id, msg) are required." });
    }

    // ✅ Ensure mentee exists before inserting the message
    db.query('SELECT * FROM copo_mentee_table WHERE sid = ?', [sid], (err, results) => {
        if (err) {
            console.error("Database Error while checking mentee:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        if (results.length === 0) {
            console.error("Invalid Mentee: No such student exists.");
            return res.status(404).json({ error: "Mentee not found." });
        }

        // ✅ Insert the message
        db.query(
            'INSERT INTO copo_mmr_forum (sid, mmr_id, msg, created_at) VALUES (?, ?, ?, NOW())',
            [sid, mmr_id, msg],
            (error, results) => {
                if (error) {
                    console.error("Database Insert Error:", error);
                    return res.status(500).json({ error: "Error saving message" });
                }
                console.log("Message stored successfully:", { sid, mmr_id, msg });
                res.json({ message: "Message sent successfully", msg_id: results.insertId });
            }
        );
    });
};
