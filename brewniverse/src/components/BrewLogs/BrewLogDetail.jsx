import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit, Trash2, Calendar, Beaker } from 'lucide-react';
import { useApp, ActionTypes } from '../../contexts/AppContext';
import Button from '../UI/Button';

function BrewLogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();

  const brewLog = state.brewLogs.find(log => log.id === id);

  if (!brewLog) {
    return (
      <div className="brewlog-detail">
        <div className="empty-state">
          <h3>Brew Log Not Found</h3>
          <p>The brew log you're looking for doesn't exist.</p>
          <Button variant="primary" onClick={() => navigate('/brewlogs')}>
            Back to Brew Logs
          </Button>
        </div>
      </div>
    );
  }

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${brewLog.name}"?`)) {
      dispatch({
        type: ActionTypes.DELETE_BREW_LOG,
        payload: id
      });
      navigate('/brewlogs');
    }
  };

  return (
    <div className="brewlog-detail">
      <div className="detail-header">
        <div className="header-content">
          <h1>{brewLog.name}</h1>
          <div className="brew-meta">
            <span className="brew-type">{brewLog.type}</span>
            <span className="brew-date">
              <Calendar size={16} />
              Created {new Date(brewLog.dateCreated).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="header-actions">
          <Button
            variant="secondary"
            onClick={() => navigate(`/brewlogs/${id}/edit`)}
          >
            <Edit size={16} />
            Edit
          </Button>
          <Button
            variant="error"
            onClick={handleDelete}
          >
            <Trash2 size={16} />
            Delete
          </Button>
        </div>
      </div>

      <div className="detail-content">
        <div className="card">
          <h2>Brew Log Details</h2>
          <p>Full brew log detail view coming soon! This will include all the properties like ingredients, gravity readings, notes, and more.</p>
          
          {brewLog.description && (
            <div className="detail-section">
              <h3>Description</h3>
              <p>{brewLog.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BrewLogDetail;

