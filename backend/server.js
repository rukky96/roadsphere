const express = require("express");
const path = require("path");
const authRoutes = require("./auth_routes");
const adminRoutes = require("./admin_routes");
const apiRoutes = require("./api_routes")
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const CSS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css"
require('dotenv').config();


const app = express(); 
const port = process.env.PORT || 3333;
app.use(express.static(path.join(__dirname, "../frontend")))
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api", apiRoutes);
app.use("/api/admin", adminRoutes);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .opblock .opblock-summary-path-description-wrapper { align-items: center; display: flex; flex-wrap: wrap; gap: 0 10px; padding: 0 10px; width: 100%; }',
    customCssUrl: CSS_URL,
}));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/home.html"))
})

app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/login.html"))
})

app.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/register.html"))
})

app.get("/rentals", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/rentals.html"))
})

app.get("/about", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/about.html"))
})

app.get("/contact", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/contact.html"))
})

app.get("/faq", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/faq.html"))
})

app.get("/explore", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/explore.html"))
})

app.get("/reset-password", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/reset_password.html"))
})

app.get("/reset-password-otp", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/reset_password_otp.html"))
})

app.get("/verify-email-otp", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/verify_email_otp.html"))
})

app.get("/dashboard", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/user_dashboard.html"))
})

app.listen(port, () => {
    console.log("Server is running");
})

module.exports = app;