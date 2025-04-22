// swaggerOptions.js
const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'My API',
      version: '1.0.0',
      description: 'REST API documentation',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
  },
  apis: ['./server.js'], // ระบุ path ของไฟล์ route ที่มีคอมเมนต์สำหรับ swagger
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
