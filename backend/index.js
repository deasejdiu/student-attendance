// backend/index.js
const express    = require('express');
const cors       = require('cors');
require('dotenv').config();
const swaggerDocs = require('./swagger');

// 1. import your limiter
const apiLimiter = require('./middleware/rateLimit');

const app = express();
const PORT = 3000;

// set your JWT secret (if you really need to override env here)
process.env.JWT_SECRET = 'attendance-secret-key-2024';

// 2. apply rate-limit globally
app.use(apiLimiter);

// 3. standard middleware
app.use(cors());
app.use(express.json());

// 4. lightweight ping for testing
app.get('/v1/ping', (_req, res) => {
  res.json({ pong: true });
});

// 5. mount your actual API
app.use('/v1', require('./routes'));

// 6. swagger & DB
swaggerDocs(app);
const db = require('./models');
db.sequelize.authenticate()
  .then(() => console.log('Database connected successfully'))
  .catch(err => console.error('DB connection failed:', err));

// 7. start listening
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
