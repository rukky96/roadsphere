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
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   title:
 *                     type: string
 *                     example: "Toyota Corolla 2021"
 *                   brand:
 *                     type: string
 *                     example: "Toyota"
 *                   model:
 *                     type: string
 *                     example: "Corolla"
 *                   year:
 *                     type: integer
 *                     example: 2021
 *                   color:
 *                     type: string
 *                     example: "Red"
 *                   transmission:
 *                     type: string
 *                     example: "Automatic"
 *                   price_per_day:
 *                     type: number
 *                     format: float
 *                     example: 15000.00
 *                   image_url:
 *                     type: string
 *                     example: "https://example.com/car.jpg"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
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
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 title:
 *                   type: string
 *                   example: "Toyota Corolla 2021"
 *                 brand:
 *                   type: string
 *                   example: "Toyota"
 *                 model:
 *                   type: string
 *                   example: "Corolla"
 *                 year:
 *                   type: integer
 *                   example: 2021
 *                 color:
 *                   type: string
 *                   example: "Red"
 *                 transmission:
 *                   type: string
 *                   example: "Automatic"
 *                 price_per_day:
 *                   type: number
 *                   format: float
 *                   example: 15000.00
 *                 image_url:
 *                   type: string
 *                   example: "https://example.com/car.jpg"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
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


/**
 * @swagger
 * /api/rent:
 *   post:
 *     summary: Book a rental vehicle
 *     tags: [Rentals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - vehicle_id
 *               - start_date
 *               - end_date
 *               - no_of_days
 *               - city_of_usage
 *               - state_of_usage
 *               - local_government_of_usage
 *               - amount
 *               - precise_address
 *             properties:
 *               vehicle_id:
 *                 type: integer
 *                 example: 2
 *               start_date:
 *                 type: string
 *                 format: date
 *                 example: 2025-08-01
 *               end_date:
 *                 type: string
 *                 format: date
 *                 example: 2025-08-03
 *               no_of_days:
 *                 type: integer
 *                 example: 3
 *               city_of_usage:
 *                 type: string
 *                 example: Warri
 *               state_of_usage:
 *                 type: string
 *                 example: Delta
 *               local_government_of_usage:
 *                 type: string
 *                 example: Uvwie
 *               amount:
 *                 type: number
 *                 format: float
 *                 example: 45000.00
 *               precise_address:
 *                 type: string
 *                 example: "No. 15 Okumagba Layout, Warri"
 *     responses:
 *       201:
 *         description: Vehicle successfully booked
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Vehicle successfully booked
 *                 booking:
 *                   type: object
 *                   description: The newly created booking
 *       400:
 *         description: Bad request (missing fields or unavailable vehicle)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Some fields are missing
 *       403:
 *         description: Forbidden – profile not complete (KYC level too low)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Your profile is incomplete. Please update to continue.
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 */

api.post('/rent', verifyToken, async (req, res) => {
    const {
        booker = req.user.email,
        vehicle_id,
        start_date,
        end_date,
        no_of_days,
        city_of_usage,
        state_of_usage,
        local_government_of_usage,
        amount,
        precise_address,
    } = req.body

    if(!booker || !vehicle_id || !start_date || !end_date || !no_of_days || !city_of_usage || !state_of_usage || !local_government_of_usage || !amount || !precise_address){
        res.status(400).json({ message: "Some fields are missing"});
        return;
    }

    if(req.user.kyc_level < 3) {
        res.status(403).json({
            message: "Your profile is incomplete. Please update to continue."
        })
        return;
    }

    try {
        const checkVehicleId = `SELECT * FROM roadsphere_vehicles 
        WHERE id = $1 AND
            listing_type = 'rent' AND
            is_available = TRUE
        `
        const checkVehicleIdResult = await pool.query(checkVehicleId, [vehicle_id])
        if (checkVehicleIdResult.rowCount > 0) {
           const vehicle_detail = checkVehicleIdResult.rows[0];
           const vendor = vehicle_detail.vendor;
           try {
                const values = [booker, vehicle_id, start_date, end_date, no_of_days, city_of_usage, state_of_usage, local_government_of_usage, amount, precise_address]
                const bookQuery = `
                    INSERT INTO roadsphere_bookings(
                        booker, vehicle_id, start_date, end_date, no_of_days, city_of_usage, state_of_usage, local_government_of_usage, amount, precise_address
                        )
                        VALUES(
                            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
                        )
                    RETURNING *;
                `
                const bookQueryResult = await pool.query(bookQuery, values)
                if(bookQueryResult.rowCount > 0){
                    const booking = bookQueryResult.rows[0];
                    res.status(201).json({
                        message: "Vehicle successful booked",
                        booking: booking
                    })
                }
            } catch(error) {
                console.log(error);
                res.status(500).json({message: "Internal Server Error"});
            }
        } else {
            res.status(400).json({message : "Vehicle not available"})
        }
    } catch(error) {
        console.log(error)
        res.status(0).json({message: "Internal Server Error"})
    }

})
module.exports = api;
