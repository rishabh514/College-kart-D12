import React from 'react';

const Popup = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  // This allows closing the popup by clicking the background, but not the content
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="popup show" onClick={handleBackdropClick}>
      <div className="popup-content">
        <span className="close-btn" onClick={onClose}>&times;</span>
        {title && <h2 className="popup-title">{title}</h2>}
        {children}
      </div>
    </div>
  );
};

export default Popup;