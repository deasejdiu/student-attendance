// backend/index.js
const express    = require('express');
const cors       = require('cors');
require('dotenv').config();

// import the limiter (now clean)
const apiLimiter = require('./middleware/rateLimit');

// if you have a swagger.js, uncomment the next line; otherwise leave it commented
// const swaggerDocs = require('./swagger');

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Apply rate limiter
app.use(apiLimiter);

// 2. Standard middleware
app.use(cors());
app.use(express.json());

// 3. **Your new ping route** — must come BEFORE mounting /v1
app.get('/v1/ping', (_req, res) => {
  res.json({ pong: true });
});

// 4. Mount your real API
app.use('/v1', require('./routes'));

// 5. (Optional) Initialize Swagger if you do have swagger.js
// swaggerDocs(app);

// 6. Database connection (unchanged)
const db = require('./models');
db.sequelize.authenticate()
  .then(() => console.log('Database connected successfully'))
  .catch(err => console.error('DB connection failed:', err));

// 7. Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
