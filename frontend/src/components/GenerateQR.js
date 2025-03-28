import React, { useState } from "react";
import axios from "axios";
import { QRCodeSVG } from "qrcode.react";

const GenerateQR = () => {
  const [qrCode, setQrCode] = useState("");

  const generateQRCode = async () => {
    const { data } = await axios.post("http://localhost:5000/api/qr/generate", { studentId: "12345" });
    setQrCode(data.qrCode);
  };

  return (
    <div>
      <button onClick={generateQRCode}>Generate QR</button>
      {qrCode && <QRCodeSVG value={qrCode} />}
    </div>
  );
};

export default GenerateQR;
