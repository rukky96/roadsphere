const { Pool } = require("pg")
const dotenv = require("dotenv")
dotenv.config();

const pool = new Pool({
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    port: process.env.DATABASE_PORT,
    database: process.env.DATABASE_NAME,
    host: process.env.DATABASE_HOST,
})

module.exports = { pool }