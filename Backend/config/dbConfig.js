import mysql from "mysql2"
import dotenv from "dotenv"
dotenv.config();
import { createPool } from 'mysql2/promise';
import expressAsyncHandler from "express-async-handler";



//Database Connection
export const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

export const pool = createPool({ 
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

connection.connect((err) => {
  if (err) {
    console.error("Error Connecting to the database :", err);
    db.end();
    return;
  }
  console.log("Successfully connected to MySql");
});

