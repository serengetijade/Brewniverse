import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, Beaker } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import Button from '../UI/Button';
import '../../Styles/BrewLogsList.css';
import ListHeader from '../Layout/ListHeader'
function BrewLogsList() {
  const navigate = useNavigate();
  const { state } = useApp();

  const brewLogs = state.brewLogs.sort((a, b) => 
    new Date(b.dateCreated) - new Date(a.dateCreated)
  );

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
    <div className="brewlogs-list">
        <ListHeader
            h1="Brew Logs"
            description="Track your brewing batches and progress"
            buttonText="New Brew Log"
            url="/brewlogs/new"
        >
        </ListHeader>

      {brewLogs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <Beaker size={64} />
          </div>
          <h3>No Brew Logs Yet</h3>
          <p>Start tracking your brewing journey by creating your first brew log.</p>
          <Button
            variant="primary"
            size="large"
            onClick={() => navigate('/brewlogs/new')}
          >
            <Plus size={20} />
            Create Your First Brew Log
          </Button>
        </div>
      ) : (
        <div className="brewlogs-grid">
          {brewLogs.map((brewLog) => (
            <div key={brewLog.id} className="brewlog-card">
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
              
              <div className="brewlog-content">
                <h3 className="brewlog-name">{brewLog.name}</h3>
                {brewLog.description && (
                  <p className="brewlog-description">{brewLog.description}</p>
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
              
              <div className="brewlog-actions">
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
          ))}
        </div>
      )}
    </div>
  );
}

export default BrewLogsList;

