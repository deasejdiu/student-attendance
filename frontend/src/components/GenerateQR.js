import React, { useState } from 'react';
import QRCode from 'qrcode.react';

const GenerateQR = () => {
  const [classData, setClassData] = useState({
    className: '',
    date: new Date().toISOString().split('T')[0],
  });

  const generateQRData = () => {
    return JSON.stringify({
      ...classData,
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="className" className="block text-sm font-medium text-gray-700">
          Class Name
        </label>
        <input
          type="text"
          id="className"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          value={classData.className}
          onChange={(e) => setClassData({ ...classData, className: e.target.value })}
        />
      </div>
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700">
          Date
        </label>
        <input
          type="date"
          id="date"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          value={classData.date}
          onChange={(e) => setClassData({ ...classData, date: e.target.value })}
        />
      </div>
      <div className="mt-4">
        <QRCode value={generateQRData()} size={256} level="H" />
      </div>
    </div>
  );
};

export default GenerateQR;