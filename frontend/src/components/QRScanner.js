import React from 'react';
import { QrReader } from 'react-qr-reader';
import { useDispatch } from 'react-redux';
import { markAttendance } from '../../store/slices/attendanceSlice';

const QRScanner = () => {
  const dispatch = useDispatch();

  const handleScan = (data) => {
    if (data) {
      try {
        const attendanceData = JSON.parse(data);
        dispatch(markAttendance(attendanceData));
      } catch (error) {
        console.error('Invalid QR code data:', error);
      }
    }
  };

  const handleError = (err) => {
    console.error(err);
  };

  return (
    <div className="max-w-md mx-auto">
      <QrReader
        delay={300}
        onResult={(result, error) => {
          if (result) {
            handleScan(result?.text);
          }
          if (error) {
            handleError(error);
          }
        }}
        style={{ width: '100%' }}
        constraints={{ facingMode: 'environment' }}
      />
    </div>
  );
};

export default QRScanner;