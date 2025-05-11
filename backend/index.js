const express = require('express');
const cors = require('cors');
require('dotenv').config();
const swaggerDocs = require('./swagger');

const app = express();
const PORT = process.env.PORT || 4000;

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