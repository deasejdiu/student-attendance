// src/routes/attendance.routes.js
const express = require('express');
const router = express.Router();

// Rrugët për menaxhimin e pjesëmarrjes
router.get('/', (req, res) => {
  res.send('Pjesëmarrja është e disponueshme.');
});

module.exports = router;
