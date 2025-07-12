const swaggerJsDoc = require('swagger-jsdoc');
const path = require("path");
require('dotenv').config();

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'RoadSphere API',
    version: '1.0.0',
    description: 'API documentation for the RoadSphere vehicle platform',
  },
  servers: [
    {
      url: 'https://roadsphere.vercel.app'
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: [
    path.join(__dirname, "auth_routes.js"),
    path.join(__dirname, "api_routes.js"),
    path.join(__dirname, "admin_routes.js"),
  ],
};


const swaggerSpec = swaggerJsDoc(options);

module.exports = swaggerSpec;