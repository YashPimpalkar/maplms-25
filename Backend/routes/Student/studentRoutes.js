import express from "express";
import { 
  getStudentDetails, 
  getStudentProfile, 
  updateStudentProfile, 
  upload 
} from "../../controller/Student/StudentProfile.js";

const router = express.Router();

// Student profile routes
router.get("/profile/details/:sid", getStudentDetails);
router.get("/profile/:sid", getStudentProfile);
router.post("/profile/:sid", (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, updateStudentProfile);

export default router;