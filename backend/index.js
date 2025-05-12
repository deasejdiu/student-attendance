const express = require('express');
const cors = require('cors');
require('dotenv').config();
const swaggerDocs = require('./swagger');

const app = express();
const PORT = 3000; // Force port 3000
process.env.JWT_SECRET = 'attendance-secret-key-2024'; // Set JWT secret

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/v1', require('./routes'));

// Initialize Swagger
swaggerDocs(app);

// Database
const db = require('./models');
db.sequelize.authenticate()
  .then(() => {
    console.log('Database connected successfully');
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 