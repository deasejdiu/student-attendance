import React from "react";
import QrReader from "react-qr-reader";

const QRScanner = ({ onScan }) => {
  const handleScan = (data) => {
    if (data) {
      console.log("QR Code scanned:", data);
      onScan(data);
    }
  };

  return (
    <QrReader
      delay={300}
      onScan={handleScan}
      onError={(err) => console.error(err)}
      style={{ width: "100%" }}
    />
  );
};

export default QRScanner;