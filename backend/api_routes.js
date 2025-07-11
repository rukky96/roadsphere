const express = require("express")
const api = express.Router()
const { verifyToken } = require("./middleware")
const { pool } = require("./database")
const path = require("path");

api.get("/rentals", async (req, res) => {
    try {
        const getRentalsQuery = `
            SELECT * FROM roadsphere_vehicles
            WHERE listing_type = 'rent'
            ;
        `
        const getRentalsQueryResult = await pool.query(getRentalsQuery);
        const rentals = getRentalsQueryResult.rows;
        res.status(200).json(rentals);
    } catch(error) {
        console.log(error)
        res.status(500).json({message: "Internal server error"})
    }
    
})

api.get("/rentals/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const getRentalQuery = `
            SELECT * FROM roadsphere_vehicles WHERE id = $1;
        `
        const getRentalQueryResult = await pool.query(getRentalQuery, [id]);
        const rental = getRentalQueryResult.rows[0];
        res.status(200).json(rental);
    } catch(error) {
        console.log(error)
        res.status(500).json({message: "Internal server error"})
    }
    
})


module.exports = api;