import React from 'react';

const Toast = ({ message, isVisible }) => {
  if (!isVisible) return null;
  
  return (
    <div className="toast show">
      {message}
    </div>
  );
};

export default Toast;