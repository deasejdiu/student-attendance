import React from 'react';
import { useSelector } from 'react-redux';
import { FaQrcode, FaCamera, FaUser } from 'react-icons/fa';

const Home = () => {
  const { user } = useSelector((state) => state.auth);
  const isTeacher = user?.role === 'teacher';

  // Get current time and generate a friendly greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-10 py-12">
      {/* Greeting and Profile Card */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-2xl shadow-lg p-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{getGreeting()}, {user?.firstName ?? 'Guest'}!</h1>
          <p className="text-lg text-gray-200">{isTeacher ? "Let's manage attendance efficiently!" : "Don't forget to check in!"}</p>
        </div>
        <div className="bg-white p-4 rounded-full shadow-md">
          <FaUser className="text-indigo-500 text-5xl" />
        </div>
      </div>

      {/* Action Section */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-md p-8 transition duration-300 hover:shadow-xl flex flex-col items-center">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            {isTeacher ? 'Generate Attendance QR Code' : 'Scan Attendance QR Code'}
          </h2>
          {isTeacher ? (
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl flex items-center gap-2">
              <FaQrcode />
              Generate QR Code
            </button>
          ) : (
            <button className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-xl flex items-center gap-2">
              <FaCamera />
              Scan QR Code
            </button>
          )}
        </div>

        {/* Additional Info Box */}
        <div className="bg-gray-100 rounded-2xl shadow-md p-8 text-center">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Attendance Stats</h3>
          <p className="text-gray-600">Keep track of your attendance history.</p>
          <button className="mt-4 bg-gray-800 hover:bg-gray-900 text-white font-medium py-2 px-6 rounded-xl">
            View Records
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;

