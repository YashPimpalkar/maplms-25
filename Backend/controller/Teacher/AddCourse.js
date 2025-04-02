import { connection as db} from "../../config/dbConfig.js"; 

export const addCourses = (req, res) => {
    const courses = req.body;
    const currentDate = new Date();

    if (!Array.isArray(courses) || courses.length === 0) {
        
        return res.status(400).json({ error: 'Invalid course data' });
    }

    const checkQuery = 'SELECT coursecode FROM  copo_course WHERE coursecode IN (?)';
    const courseCodes = courses.map(course => course.course_code);

    db.query(checkQuery, [courseCodes], (checkError, checkResults) => {
        if (checkError) {
            console.error('SQL Error:', checkError.message);
            
            return res.status(500).json({ error: 'Failed to check existing courses' });
        }

        if (checkResults.length > 0) {
            const existingCourses = checkResults.map(result => result.coursecode);
            
            return res.status(400).json({ error: 'This course already exist', existingCourses });
        }

        const query = 'INSERT INTO copo_course (coursecode, course_name, created_time) VALUES ?';
        const values = courses.map(course => [course.course_code, course.course_name, currentDate]);

        db.query(query, [values], (insertError, insertResults) => {
            if (insertError) {
                console.error('SQL Error:', insertError.message);
                
                return res.status(500).json({ error: 'Failed to add courses' });
            }
            
           return  res.json({ message: 'Courses added successfully', insertedRows: insertResults.affectedRows });
        });
    });
};
