const { pool } = require("./database")
require("dotenv").config();
const jwt = require("jsonwebtoken");

const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).json({message: "Access denied. Please login"});
        return;
    }
    const token = authHeader.split(' ')[1];

    if (!token) {
        res.status(401).json({message: "Access denied. Please login"});
    } else {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
            const updateLastSeen = await pool.query(
                `UPDATE roadsphere_users SET last_active = NOW() WHERE id=$1 RETURNING *;`, 
                [decoded.id]);
            if (updateLastSeen.rowCount > 0) {
                req.user = decoded;
                next();
            }
        
        } catch(error) {
            if (error.name === "TokenExpiredError") {
                res.status(401).json({message: "Your token has expired"})
            } else if (error.name === "JsonWebTokenError") {
                res.status(401).json({message: "You provided an invalid token"})
            } else {
                res.status(401).json({message: "Authentication failed. Please login"})
                console.log(error)
            }
        }

    }
}

const verifyAdmin = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).json({message: "Access denied. Please login"});
        return;
    }
    const token = authHeader.split(' ')[1];

    if (!token) {
        res.status(401).json({message: "Access denied. Please login"});
    } else {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

            if (decoded.role === "admin" || decoded.role === "superadmin") {
                const updateLastSeen = await pool.query(
                `UPDATE roadsphere_users SET last_active = NOW() WHERE id=$1 RETURNING *;`, 
                [decoded.id]);
                if (updateLastSeen.rowCount > 0) {
                    req.user = decoded;
                    next();
                }
            } else {
                res.status(403).json({message: "Access forbidden"})
            }
            
        
        } catch(error) {
            if (error.name === "TokenExpiredError") {
                res.status(403).json({message: "Your token has expired"})
            } else if (error.name === "JsonWebTokenError") {
                res.status(403).json({message: "You provided an invalid token"})
            } else {
                res.status(403).json({message: "Authentication failed. Please login"})
            }
        }

    }

}
module.exports = { verifyToken, verifyAdmin }