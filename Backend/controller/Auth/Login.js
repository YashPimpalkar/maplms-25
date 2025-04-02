import { request } from "express";
import { connection as db} from "../../config/dbConfig.js"; 
import jwt from "jsonwebtoken";
import asyncHand from "express-async-handler";
import bcrypt from "bcrypt";

export const login=(req,res)=>{
  
    const email=req.body.email
    const password=req.body.password
  console.log(email,password)
     const additional_query=`SELECT * FROM copo_users WHERE emailid = (?) AND (
             password IS NULL OR
             depart IS NULL OR
             isuser IS NULL 
              )`;


const sql="SELECT * FROM copo_users WHERE emailid = (?)";
db.query(sql, email, (err, data) => {

    if (err)    {
       
      return res.json(err);}
    if (data.length == 0){    return res.status(404).json("User not found");}
    const user = data[0];
    const isPassCorrect = bcrypt.compareSync(password, user.password);

    if (!isPassCorrect) {    return res.status(400).json("Wrong email or password"); }
     
    db.query(additional_query, email, async (err, additionalResult) => {
      if (err) {
        console.error("Error running the additional query : ", err);
        
        return res.status(500).json({ error: "Internal Server Error" });
      }
    //   console.log("Status : ", additionalResult.length)
      let additionalVariable = additionalResult.length > 0 ? 0 : 1;

    //   console.log("Status : ", additionalVariable)
      const tokenPayload = {
        uid: user.userid,
        status: additionalVariable,
        user_type: user.isuser 
      };

    const id = user.userid;
    const token = jwt.sign({ tokenPayload }, "jwtkey", { expiresIn: "30d" });
    console.log(tokenPayload)
    res.status(200).json({
      message: "Logged in successfully",
      token: token,
      uid: user.userid,
      isregister:additionalVariable,
      user_type : user.isuser
    });
  })
});
}



export const Studentlogin=(req,res)=>{
  
  const email=req.body.email
  const password=req.body.password
console.log(email,password)
  //  const additional_query=`SELECT * FROM copo_students_detail WHERE email = (?) AND (
  //          password IS NULL )`;


const sql="SELECT * FROM copo_copo_students_detail WHERE email = (?)";
db.query(sql, email, (err, data) => {

  if (err) {    return res.json(err);}
  if (data.length == 0){    return res.status(404).json("User not found");}
  const user = data[0];
  const isPassCorrect = bcrypt.compareSync(password, user.password);

  if (!isPassCorrect){    return res.status(400).json("Wrong email or password");}
   
  // db.query(additional_query, email, async (err, additionalResult) => {
  //   if (err) {
  //     console.error("Error running the additional query : ", err);
  //     return res.status(500).json({ error: "Internal Server Error" });
  //   }
  //   console.log("Status : ", additionalResult.length)
    // let additionalVariable = additionalResult.length > 0 ? 0 : 1;
    let additionalVariable =1
  //   console.log("Status : ", additionalVariable)
    const tokenPayload = {
      sid: user.sid,
      status: additionalVariable,
      user_type: 1 
    };
   
  const id = user.userid;
  const token = jwt.sign({ tokenPayload }, "jwtkey", { expiresIn: "30d" });
  console.log(tokenPayload)
  res.status(200).json({
    message: "Logged in successfully",
    token: token,
    sid: user.sid,
    isregister:additionalVariable,
    user_type : 1
  });
})

}