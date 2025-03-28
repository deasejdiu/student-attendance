const express = require("express");
const QRCode = require("qrcode");

const router = express.Router();

router.post("/generate", async (req, res) => {
  try {
    const { studentId } = req.body;
    const qrCode = await QRCode.toDataURL(studentId);
    res.json({ qrCode });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate QR Code" });
  }
});

module.exports = router;
