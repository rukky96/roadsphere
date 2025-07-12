const express = require("express");
const api = express.Router();
const { verifyToken } = require("./middleware");
const { pool } = require("./database");
const path = require("path");

/**
 * @swagger
 * tags:
 *   name: Rentals
 *   description: Endpoints related to rental vehicles
 */

/**
 * @swagger
 * /api/rentals:
 *   get:
 *     summary: Get a list of available rental vehicles
 *     tags: [Rentals]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category (e.g., SUV, Sedan)
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *         description: Filter by brand (e.g., Toyota)
 *       - in: query
 *         name: model
 *         schema:
 *           type: string
 *         description: Filter by model (e.g., Corolla)
 *       - in: query
 *         name: color
 *         schema:
 *           type: string
 *         description: Filter by color (e.g., red)
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Filter by year of manufacture
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filter by city
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: Filter by state
 *       - in: query
 *         name: transmission
 *         schema:
 *           type: string
 *         description: Filter by transmission type (e.g., automatic)
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Pagination offset
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Number of results to return
 *     responses:
 *       200:
 *         description: A list of rental vehicles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Internal server error
 */
api.get("/rentals", async (req, res) => {
  const {
    category = '',
    brand = '',
    model = '',
    color = '',
    year,
    city = '',
    state = '',
    transmission = '',
    offset = 0,
    limit = 100,
  } = req.query;

  // Initialize query parts
  let whereClauses = [
    "listing_type = 'rent'",
    "is_available = TRUE",
    "category ILIKE $1",
    "brand ILIKE $2",
    "model ILIKE $3",
    "color ILIKE $4",
    "city ILIKE $5",
    "state ILIKE $6",
    "transmission ILIKE $7"
  ];

  let values = [
    `%${category}%`,
    `%${brand}%`,
    `%${model}%`,
    `%${color}%`,
    `%${city}%`,
    `%${state}%`,
    `%${transmission}%`
  ];

  if (year) {
    whereClauses.push(`year = $${values.length + 1}`);
    values.push(parseInt(year));
  }

  // Add offset and limit
  const offsetIndex = values.length + 1;
  const limitIndex = values.length + 2;

  values.push(parseInt(offset));
  values.push(parseInt(limit));

  const query = `
    SELECT * FROM roadsphere_vehicles
    WHERE ${whereClauses.join(" AND ")}
    ORDER BY id
    OFFSET $${offsetIndex}
    LIMIT $${limitIndex};
  `;

  try {
    const { rows } = await pool.query(query, values);
    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});


/**
 * @swagger
 * /api/rentals/{id}:
 *   get:
 *     summary: Get a single rental vehicle by ID
 *     tags: [Rentals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The rental vehicle ID
 *     responses:
 *       200:
 *         description: Rental vehicle details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       500:
 *         description: Internal server error
 */
api.get("/rentals/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const getRentalQuery = `
      SELECT * FROM roadsphere_vehicles 
      WHERE id = $1 AND listing_type = 'rent'
      ;
    `;
    const getRentalQueryResult = await pool.query(getRentalQuery, [id]);
    const rental = getRentalQueryResult.rows[0];
    res.status(200).json(rental);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = api;
