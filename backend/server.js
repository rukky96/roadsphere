const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
require('dotenv').config();
const app = express(); 
const port = process.env.PORT || 3333;
app.use(express.static(path.join(__dirname, "../frontend")))

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

app.listen(port, () => {
    console.log("Server is running");
})

module.exports = app;