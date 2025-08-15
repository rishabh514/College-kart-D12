import React, { useState } from 'react';

const placeholderImage = 'https://via.placeholder.com/400x300.png?text=Image+Not+Available';

const OptimizedImage = ({ src, alt, className }) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    // If the image fails to load, set the source to the placeholder
    setImageSrc(placeholderImage);
    setIsLoading(false);
  };

  const handleLoad = () => {
    // When the image successfully loads, turn off the loading state
    setIsLoading(false);
  };

  return (
    <>
      {/* Show a placeholder background while loading */}
      {isLoading && <div className={`${className} bg-zinc-800 animate-pulse`}></div>}
      
      {/* The actual image tag, hidden while loading to prevent showing a partial image */}
      <img
        src={imageSrc}
        alt={alt}
        className={`${className} ${isLoading ? 'hidden' : 'block'}`}
        onError={handleError}
        onLoad={handleLoad}
        loading="lazy" // <-- This is the native lazy loading attribute!
      />
    </>
  );
};

export default OptimizedImage;