// middleware/authenticate.js
import jwt from 'jsonwebtoken';

// General JWT authentication middleware
export const authenticateJWT = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token){      db.end(); return res.status(403).json({ message: "Token required" });}

    try {
        const decoded = jwt.verify(token, "jwtkey");
        req.user = decoded.tokenPayload;
        next();
    } catch (err) {
        console.error("JWT Error:", err);
        db.end();
       return res.status(401).json({ message: "Invalid token" });
    }
};


export const verifyToken = (req, res, next) => {
    // console.log(req.headers.authorization)
    const token = req.headers.authorization?.split(" ")[1];
    // console.log(token) // Expecting "Bearer <token>"
    if (!token) {
        db.end();
      return res.status(401).json({ error: "Access Denied: No Token Provided" });
    }
  
    jwt.verify(token, "jwtkey", (err, decoded) => {
      if (err) {
        db.end();
        return res.status(403).json({ error: "Invalid or Expired Token" });
      }
      req.user = decoded.tokenPayload; // Store decoded payload in req.user
      next();
    });
  };


// middleware/roleMiddleware.js

// Middleware for students
export const studentAuth = (req, res, next) => {

    if (req.user.user_type === 1) {

        next();
    } else {
        db.end();
       return res.status(403).json({ message: "Access restricted to students" });
    }
};

// Middleware for teachers
export const teacherAuth = (req, res, next) => {
    if (req.user.user_type === 2) {
        next();
    } else {
        db.end();
       return res.status(403).json({ message: "Access restricted to teachers" });
    }
};

// Middleware for admins
export const adminAuth = (req, res, next) => {
    if (req.user.user_type === 3) {
        next();
    } else {
        db.end();
       return res.status(403).json({ message: "Access restricted to admins" });
    }
};



export const teacherANDAdminAuth = (req, res, next) => {
    if (req.user.user_type === 2 ||teacherANDAdminAuth ) {
        next();
    } else {
        db.end();
       return res.status(403).json({ message: "Access restricted to teachers" });
    }
};
