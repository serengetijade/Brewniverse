import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import Button from '../UI/Button';

function BrewLogCard({ brewLog }) {
  const navigate = useNavigate();

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Beer':
        return '🍺';
      case 'Mead':
        return '🍯';
      case 'Kombucha':
        return '🫖';
      case 'Wine':
        return '🍷';
      case 'Other':
        return '🧪';
      default:
        return '🧪';
    }
  };

  return (
    <div className="item-card">
      <div className="brewlog-header">
        <div className="brewlog-type">
          <span className="type-icon">{getTypeIcon(brewLog.type)}</span>
          <span className="type-text">{brewLog.type}</span>
        </div>
        <div className="brewlog-date">
          <Calendar size={16} />
          <span>{new Date(brewLog.dateCreated).toLocaleDateString()}</span>
        </div>
      </div>
      
      <div className="item-content">
        <h3 className="brewlog-name">{brewLog.name}</h3>
        {brewLog.description && (
          <p className="item-description">{brewLog.description}</p>
        )}
        
        <div className="brewlog-stats">
          {brewLog.estimatedABV && (
            <div className="stat">
              <span className="stat-label">Est. ABV:</span>
              <span className="stat-value">{brewLog.estimatedABV}%</span>
            </div>
          )}
          {brewLog.gravityFinal && (
            <div className="stat">
              <span className="stat-label">Final Gravity:</span>
              <span className="stat-value">{brewLog.gravityFinal}</span>
            </div>
          )}
        </div>
        
        <div className="brewlog-status">
          {brewLog.dateBottled ? (
            <span className="status-badge status-completed">Bottled</span>
          ) : brewLog.dateRacked ? (
            <span className="status-badge status-racked">Secondary</span>
          ) : (
            <span className="status-badge status-fermenting">Fermenting</span>
          )}
        </div>
      </div>
      
      <div className="item-actions">
        <Button
          variant="outline"
          size="medium"
          onClick={() => navigate(`/brewlogs/${brewLog.id}`)}
        >
          View Details
        </Button>
        <Button
          variant="ghost"
          size="medium"
          onClick={() => navigate(`/brewlogs/${brewLog.id}/edit`)}
        >
          Edit
        </Button>
      </div>
    </div>
  );
}

export default BrewLogCard;