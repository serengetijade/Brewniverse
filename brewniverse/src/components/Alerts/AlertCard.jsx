import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { useApp, ActionTypes } from '../../contexts/AppContext';
import Button from '../UI/Button';

function AlertCard({ alert, editUrl }) {
  const navigate = useNavigate();
  const { dispatch } = useApp();

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${alert.name}"?`)) {
      dispatch({
        type: ActionTypes.DELETE_ALERT,
        payload: alert.id
      });
    }
  };

  const handleComplete = () => {
    if (alert.isCompleted) {
      if (window.confirm(`Are you sure you want to delete "${alert.name}"?`)) {
        dispatch({
          type: ActionTypes.DELETE_ALERT,
          payload: alert.id
        });
      }
    } else {
      dispatch({
        type: ActionTypes.UPDATE_ALERT,
        payload: { ...alert, isCompleted: true }
      });
    }
  };

  return (
    <div className="item-card">
      <div className="item-content">
        <h3>{alert.name}</h3>
        <p className="item-description">{alert.description}</p>
        <p className="item-date">
          {new Date(alert.date).toLocaleDateString()} at {new Date(alert.date).toLocaleTimeString()}
        </p>
        {alert.isCompleted && (
          <p className="alert-completed">✓ Completed</p>
        )}
      </div>
      <div className="item-actions">
        <Button
          variant="outline"
          size="small"
          onClick={() => navigate(editUrl)}
        >
          Edit
        </Button>
        <Button
          variant={alert.isCompleted ? "error" : "success"}
          size="small"
          onClick={handleComplete}
        >
          {alert.isCompleted ? "Delete" : "Complete"}
        </Button>
        {!alert.isCompleted && (
          <Button
            variant="ghost"
            size="small"
            onClick={handleDelete}
          >
            <Trash2 size={16} />
          </Button>
        )}
      </div>
    </div>
  );
}

export default AlertCard;