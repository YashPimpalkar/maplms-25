import { connection as db } from "../../config/dbConfig.js";

export const show_all_user = (req,res) =>{
  
    const sql = `select userid,teacher_name,depart,emailid from copo_users where isuser = 2`
    db.query(sql,  (err, result) => {
        if(err) {
          console.log(err)
          console.error("Error fetching COS records:", err);  
          return res.status(500).json({ error: "Database error" });
        }
        // console.log(result)       
        return res.status(200).json(result);
      });

}


export const admin_branch = (req,res)=> {
  
  const uid =req.params.uid;
  const sql= "select depart from copo_users where userid=?"
  db.query(sql,[uid],(error,results)=>{
    if (error) {
      console.log(error)
      console.error("Error fetching COS records:", err);
      
      return res.status(500).json({ error: "Database error" });
    }
    console.log(results)
    
    return res.status(200).json(results);
  })
}



export const academic_year = (req,res) =>{
  
  const uid =req.params.uid;
  const sql = `SELECT DISTINCT academic_year 
FROM copo_user_course 
WHERE branch IN (
  SELECT depart 
  FROM copo_users 
  WHERE userid = ?
)
`
db.query(sql,[uid],(error,result)=>{
      if (error) {
        console.error("Error fetching records:", err);
        
        return res.status(500).json({ error: "Database error" });
      }
      console.log(result)
      
      return res.status(200).json(result);
})
}

