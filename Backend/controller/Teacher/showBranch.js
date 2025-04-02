import { connection as db } from "../../config/dbConfig.js";

import expressAsyncHandler from "express-async-handler";
export const showBranch =expressAsyncHandler( async(req, res) => {
  const sql = "SELECT branch_id as idbranch,bname as branchname   FROM branch";
 db.query(sql, (err, result) => {
    if (err) {
      console.error(err);
      
      return res.status(500).json({ message: "Internal server error" });
    }
    
    return res.status(200).json(result);
  });
});


export const shownormalBranch =expressAsyncHandler( async(req, res) => {
  const sql = "SELECT  * FROM branch";
 db.query(sql, (err, result) => {
    if (err) {
      console.error(err);
      
      return res.status(500).json({ message: "Internal server error" });
    }
    
    return res.status(200).json(result);
  });
});
