import React, { useState } from 'react';
import { Star } from 'lucide-react';
import '../../Styles/Rating.css';

function Rating({ value = 0, onChange, isEditing = false, label = "Rating" }) {
  const [hoverValue, setHoverValue] = useState(null);
  const totalStars = 5;

  // Track last clicked star to enable half-star on double-click
  const [lastClick, setLastClick] = useState({ index: null, timestamp: null });

  const handleStarClick = (starIndex) => {
    if (!isEditing || !onChange) return;

    const now = Date.now();
    const clickDelay = 300; 
    
    // Check if this is a double-click on the same star
    if (
      lastClick.index === starIndex && 
      now - lastClick.timestamp < clickDelay
    ) {
      // Double-click: set to half star
      onChange(starIndex + 0.5);
      setLastClick({ index: null, timestamp: null });
    } else {
      // Single click: set to full star
      onChange(starIndex + 1);
      setLastClick({ index: starIndex, timestamp: now });
    }
  };

  const handleMouseEnter = (starIndex) => {
    if (isEditing) {
      setHoverValue(starIndex + 1);
    }
  };

  const handleMouseLeave = () => {
    if (isEditing) {
      setHoverValue(null);
    }
  };

  const getStarFill = (starIndex) => {
    const currentValue = hoverValue !== null ? hoverValue : value;
    
    if (currentValue >= starIndex + 1) {
      // Full star
      return 'full';
    } else if (currentValue > starIndex && currentValue < starIndex + 1) {
      // Half star
      return 'half';
    } else {
      // Empty star
      return 'empty';
    }
  };

  const renderStar = (starIndex) => {
    const fillType = getStarFill(starIndex);
    
    return (
      <div
        key={starIndex}
        className={`star-wrapper ${isEditing ? 'editable' : ''}`}
        onClick={() => handleStarClick(starIndex)}
        onMouseEnter={() => handleMouseEnter(starIndex)}
        onMouseLeave={handleMouseLeave}
      >
        {fillType === 'half' ? (
          <div className="star-container">
            <Star 
              className="star star-empty" 
              size={24}
            />
            <div className="star-half-overlay">
              <Star 
                className="star star-filled" 
                size={24}
                fill="currentColor"
              />
            </div>
          </div>
        ) : (
          <Star 
            className={`star ${fillType === 'full' ? 'star-filled' : 'star-empty'}`}
            size={24}
            fill={fillType === 'full' ? 'currentColor' : 'none'}
          />
        )}
      </div>
    );
  };

  // In non-editing mode, only show stars if there's a rating
  if (!isEditing && value === 0) {
    return null;
  }

  return (
    <div className="rating-component">
      {isEditing && label && (
        <label className="rating-label">{label}</label>
      )}
      <div className="stars-container">
        {Array.from({ length: totalStars }, (_, index) => renderStar(index))}
        {isEditing && value > 0 && (
          <button
            type="button"
            className="clear-rating-btn"
            onClick={() => onChange(0)}
            title="Clear rating"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

export default Rating;