import { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const ImageGallery = ({ images, selected = 0, onSelect }) => {
  const [zoom, setZoom] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [localSelected, setLocalSelected] = useState(selected);

  const handleMouseMove = (e) => {
    if (!zoom) return;
    
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPosition({ x, y });
  };

  const handleSelect = (index) => {
    if (onSelect) {
      onSelect(index);
    } else {
      setLocalSelected(index);
    }
  };

  const displayIndex = onSelect ? selected : localSelected;

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div 
        className="relative overflow-hidden rounded-lg aspect-square bg-gray-100 cursor-zoom-in"
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={handleMouseMove}
      >
        <img
          src={images[displayIndex]}
          alt={`Product view ${displayIndex + 1}`}
          className={`w-full h-full object-contain transition-transform duration-300 ${
            zoom ? 'scale-150' : 'scale-100'
          }`}
          style={{
            transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
          }}
        />
        {zoom && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-10">
            <MagnifyingGlassIcon className="h-8 w-8 text-white opacity-70" />
          </div>
        )}
      </div>
      
      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((image, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelect(index)}
              className={`aspect-square rounded-md overflow-hidden border-2 ${
                displayIndex === index ? 'border-green-500' : 'border-transparent'
              }`}
            >
              <img
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;