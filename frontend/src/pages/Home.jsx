import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';

const Home= () => {
  const { user } = useSelector((state) => state.auth);
  const isTeacher = user?.role === 'teacher';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome, {user?.firstName} {user?.lastName}
        </h1>
        <div className="mt-6">
          {isTeacher ? (
            <div className="space-y-6">
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Generate Attendance QR Code</h2>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Scan Attendance QR Code</h2>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;