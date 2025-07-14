const express = require("express")
const admin = express.Router()
const { verifyAdmin } = require("./middleware")
const { pool } = require("./database")

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin-only operations
 */

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - Token missing, expired, or invalid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Access denied. Please login.
 *       403:
 *         description: Forbidden - User is not admin or superadmin
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Access forbidden
 *       500:
 *         description: Internal server error
 */

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

/**
 * @swagger
 * /admin/users/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the user to delete
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User has been deleted
 *       400:
 *         description: Missing or invalid user ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Missing or invalid id
 *       401:
 *         description: Unauthorized - Token missing, expired, or invalid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Your token has expired
 *       403:
 *         description: Forbidden - User is not admin or superadmin
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Access forbidden
 *       500:
 *         description: Internal server error
 */
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
