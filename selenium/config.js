require('dotenv').config();

module.exports = {
  // Application URLs
  baseUrl: 'http://localhost:5173',
  apiUrl: 'http://localhost:3000/v1',
  exportServiceUrl: 'http://localhost:4500/api',

  // Test credentials
  adminCredentials: {
    username: 'admin',
    password: 'admin123'
  },
  teacherCredentials: {
    username: 'teacher',
    password: 'teacher123'
  },

  // Selenium configuration
  selenium: {
    browser: 'chrome',
    headless: false,
    timeout: 30000,
    implicitWait: 10000,
    windowSize: {
      width: 1920,
      height: 1080
    }
  }
}; 