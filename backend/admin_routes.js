const express = require("express")
const admin = express.Router()
const { verifyAdmin } = require("./middleware")
const { pool } = require("./database")

admin.get("/users", verifyAdmin, async (req, res) => {
    try {
        const getUsersQuery = `
            SELECT * FROM roadsphere_users;
        `
        const getUsersQueryResult = await pool.query(getUsersQuery);
        const users = getUsersQueryResult.rows;
        res.status(200).json(users);

    } catch(error) {
        console.log(error)
        res.status(500).json({message: "Internal Server Error"})
    }
})

admin.delete("/users/:id", verifyAdmin, async (req, res)=> {
    const id = req.params.id
    if (!id || isNaN(id)) {
        res.status(400).json({message: "Missing or invalid id"})
    } else {
        try {
            const deleteUserQuery = `
                DELETE FROM roadsphere_users
                WHERE id = $1;
            `;
            const deleteUserQueryResult = await pool.query(deleteUserQuery, [id])
            console.log(deleteUserQueryResult);
            res.status(200).json({message: "User has been deleted"});

        } catch(error) {
            console.log(error);
            res.status(500).json({message: "Internal Server Error"})
        }
    }
})
module.exports = admin;
