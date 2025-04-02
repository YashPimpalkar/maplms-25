import { connection as db } from "../../../config/dbConfig.js";
import expressAsyncHandler from "express-async-handler";


export const get_total_no_users = (req,res) =>{
    const { uid } = req.params;
    const sql = `SELECT COUNT(*) as total_users FROM copo_users where depart=(select depart from copo_users where userid=? ) and isuser=2 `;
    db.query(sql, [uid],(error, result) => {
        if (error) {
            console.error('Error checking attendance:', error);
            return res.status(500).json({ message: 'Failed to check attendance', error });
        }
        return res.json({ total_users: result[0].total_users });
    }); 
}


export const count_total_no_users_courses = expressAsyncHandler(async (req, res) => {
const {uid}= req.params;
console.log(uid);
const sql = `SELECT COUNT(*) as total_users_courses FROM copo_user_course where branch=(select depart from copo_users where userid=? )  `;
db.query(sql, [uid],(error, result) => {
    if (error) {
        console.error('Error checking attendance:', error);
        return res.status(500).json({ message: 'Failed to check attendance', error });
    }
    return res.json(result);
}); 

})


