const express = require("express");
const path = require("path");
const authRoutes = require("./auth_routes");
const adminRoutes = require("./admin_routes");
const apiRoutes = require("./api_routes")
const swaggerSpec = require('./swagger');
const cors = require("cors");
require('dotenv').config();


const app = express(); 
const port = process.env.PORT || 3333;

app.use(cors());
app.use(express.static(path.join(__dirname, "../frontend")))
app.use(express.json());


app.use("/api/auth", authRoutes);
app.use("/api", apiRoutes);
app.use("/api/admin", adminRoutes);



app.get('/api-docs', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Swagger UI</title>
      <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css" />
    </head>
    <body>
      <div id="swagger-ui"></div>
      <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
      <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-standalone-preset.js"></script>
      <script>
        window.onload = () => {
          SwaggerUIBundle({
            url: '/swagger.json',
            dom_id: '#swagger-ui',
            presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
            layout: 'StandaloneLayout'
          })
        }
      </script>
    </body>
    </html>
  `);
});

app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});


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