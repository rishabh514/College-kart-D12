import React from 'react';

/**
 * A reusable confirmation popup modal.
 * @param {string} title - The title of the confirmation dialog.
 * @param {string} message - The main message/question to display.
 * @param {function} onConfirm - The function to call when the user confirms.
 * @param {function} onCancel - The function to call when the user cancels.
 * @param {string} confirmText - The text for the confirm button (e.g., "Delete").
 * @param {string} confirmColor - The background color class for the confirm button (e.g., "bg-red-600").
 */
const ConfirmPopup = ({ title, message, onConfirm, onCancel, confirmText = "Confirm", confirmColor = "bg-indigo-600" }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4 text-white">{title}</h2>
        <p className="mb-6 text-gray-300">{message}</p>
        <div className="flex justify-end gap-4">
          <button 
            onClick={onCancel} 
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            className={`px-4 py-2 text-white rounded-md ${confirmColor} hover:opacity-90 transition`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmPopup;
