const swaggerJsDoc = require('swagger-jsdoc');
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
  apis: ['./*.js'], // path to your route files with comments
};

const swaggerSpec = swaggerJsDoc(options);

module.exports = swaggerSpec;