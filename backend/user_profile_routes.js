const express = require("express");
const profile = express.Router();
const { verifyToken } = require("./middleware");
const { pool } = require("./database");
const path = require("path");

profile.get("/me", verifyToken, async (req, res) => {
    const user = req.user;
    try {
        const getUserQuery = `SELECT * FROM roadsphere_users WHERE email = $1`;
        const getUserQueryResult = await pool.query(getUserQuery, [user.email]);
        if (getUserQueryResult.rowCount > 0) {
            const user_details = getUserQueryResult.rows[0];
            res.status(200).json(user_details);
        }
    } catch(error) {
        console.log(error);
        res.status(500).json({message: "Internal Server Error"})
    }
})

module.exports = profile;