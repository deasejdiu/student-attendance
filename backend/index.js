// backend/index.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const swaggerDocs = require('./swagger'); // you had this
const apiLimiter = require('./middleware/rateLimit'); // your friend had this

const authRoutes = require('./routes/authRoutes'); // yours
const verificationRoutes = require('./routes/verification'); // yours

const app = express();
const PORT = process.env.PORT || 4001;

// 1. Apply rate limiter
app.use(apiLimiter);

// 2. Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Ping route (from your friend)
app.get('/v1/ping', (_req, res) => {
  res.json({ pong: true });
});

// 4. Routes
app.use('/api/auth', authRoutes);           // your route
app.use('/api', verificationRoutes);        // your route
app.use('/v1', require('./routes'));        // shared

// 5. Swagger docs (from your version)
swaggerDocs(app);

// 6. Database
const db = require('./models');
db.sequelize.authenticate()
  .then(() => console.log('Database connected successfully'))
  .catch(err => console.error('Unable to connect to the database:', err));

// 7. Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
