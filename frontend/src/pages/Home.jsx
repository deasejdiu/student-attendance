import React from 'react';
import { useSelector } from 'react-redux';

const Home = () => {
  const { user } = useSelector((state) => state.auth);
  const isTeacher = user?.role === 'teacher';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Welcome, {user?.firstName} {user?.lastName}
      </h1>

      <div className="bg-white rounded-2xl shadow-md p-8 transition duration-300 hover:shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          {isTeacher ? 'Generate Attendance QR Code' : 'Scan Attendance QR Code'}
        </h2>

        <div className="mt-6">
          {isTeacher ? (
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-xl">
              Generate QR Code
            </button>
          ) : (
            <button className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-xl">
              Scan QR Code
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
