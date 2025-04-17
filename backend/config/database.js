require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USERNAME || 'postgress',
    password: process.env.DB_PASSWORD || 'admin',
    database: process.env.DB_NAME || 'class_attendance',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'postgres'
  },
  test: {
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'admin',
    database: process.env.DB_NAME || 'class_attendance',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'postgres'
  },
  production: {
    username: process.env.DB_USERNAME,
    password: "admin",
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'postgres'
  }
}; 