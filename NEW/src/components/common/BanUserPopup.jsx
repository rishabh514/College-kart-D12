import React, { useState } from 'react';

/**
 * A popup component for banning a user for a specified duration.
 * @param {object} user - The user object to be banned.
 * @param {function} onClose - Function to close the popup.
 * @param {function} onConfirmBan - Function to execute when the ban is confirmed.
 */
const BanUserPopup = ({ user, onClose, onConfirmBan }) => {
  const [weeks, setWeeks] = useState(0);
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);

  /**
   * Handles the ban confirmation process.
   * Calculates the total ban duration in seconds and calls the onConfirmBan function.
   */
  const handleConfirm = () => {
    const totalSeconds = 
      (weeks * 7 * 24 * 60 * 60) + 
      (days * 24 * 60 * 60) + 
      (hours * 60 * 60) + 
      (minutes * 60);

    if (totalSeconds <= 0) {
      alert("Please set a ban duration.");
      return;
    }

    onConfirmBan(totalSeconds);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-white">Ban User</h2>
        <p className="mb-6 text-gray-400">
          You are about to ban <span className="font-semibold text-indigo-400">{user.email}</span>.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div>
            <label htmlFor="weeks" className="block text-sm font-medium text-gray-300">Weeks</label>
            <input 
              type="number" 
              id="weeks" 
              value={weeks} 
              onChange={(e) => setWeeks(parseInt(e.target.value) || 0)} 
              className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm h-10 px-3" 
              min="0"
            />
          </div>
          <div>
            <label htmlFor="days" className="block text-sm font-medium text-gray-300">Days</label>
            <input 
              type="number" 
              id="days" 
              value={days} 
              onChange={(e) => setDays(parseInt(e.target.value) || 0)} 
              className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm h-10 px-3" 
              min="0"
            />
          </div>
          <div>
            <label htmlFor="hours" className="block text-sm font-medium text-gray-300">Hours</label>
            <input 
              type="number" 
              id="hours" 
              value={hours} 
              onChange={(e) => setHours(parseInt(e.target.value) || 0)} 
              className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm h-10 px-3" 
              min="0" 
              max="23"
            />
          </div>
          <div>
            <label htmlFor="minutes" className="block text-sm font-medium text-gray-300">Minutes</label>
            <input 
              type="number" 
              id="minutes" 
              value={minutes} 
              onChange={(e) => setMinutes(parseInt(e.target.value) || 0)} 
              className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm h-10 px-3" 
              min="0" 
              max="59"
            />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button 
            onClick={onClose} 
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition"
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirm} 
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
          >
            Confirm Ban
          </button>
        </div>
      </div>
    </div>
  );
};

export default BanUserPopup;