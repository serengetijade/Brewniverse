import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, X } from 'lucide-react';
import { useApp, ActionTypes } from '../../contexts/AppContext';
import Button from '../UI/Button';
import '../../Styles/AlertForm.css';

function AlertForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: new Date().toISOString().slice(0, 16), // datetime-local format
    alertGroupId: '',
    brewLogId: '',
    isRecurring: false,
    recurringType: 'daily',
    recurringInterval: 1,
    endDate: '',
    isCompleted: false,
    priority: 'medium'
  });

  useEffect(() => {
    if (isEditing) {
      const alert = state.alerts.find(a => a.id === id);
      if (alert) {
        setFormData({
          ...alert,
          date: new Date(alert.date).toISOString().slice(0, 16)
        });
      }
    }
  }, [id, isEditing, state.alerts]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const alertData = {
      ...formData,
      date: new Date(formData.date).toISOString(),
    };

    if (isEditing) {
      dispatch({
        type: ActionTypes.UPDATE_ALERT,
        payload: { ...alertData, id }
      });
    } else {
      dispatch({
        type: ActionTypes.ADD_ALERT,
        payload: alertData
      });
    }

    navigate('/alerts');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="alert-form">
      <div className="form-header">
        <h1>{isEditing ? 'Edit Alert' : 'New Alert'}</h1>
        <p>
          {isEditing 
            ? 'Update your alert details' 
            : 'Create a new alert reminder'
          }
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card">
        {/* Basic Information */}
        <div className="form-section">
          <h3>Basic Information</h3>
          
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Alert Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter alert name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              className="form-textarea"
              value={formData.description}
              onChange={handleChange}
              placeholder="Optional description"
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="priority" className="form-label">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                className="form-select"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isCompleted"
                  checked={formData.isCompleted}
                  onChange={(e) => setFormData(prev => ({ ...prev, isCompleted: e.target.checked }))}
                />
                Mark as completed
              </label>
            </div>
          </div>
        </div>

        {/* Associations */}
        <div className="form-section">
          <h3>Associations</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="alertGroupId" className="form-label">
                Alert Group
              </label>
              <select
                id="alertGroupId"
                name="alertGroupId"
                className="form-select"
                value={formData.alertGroupId}
                onChange={handleChange}
              >
                <option value="">No group (individual alert)</option>
                {state.alertGroups.map(group => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="brewLogId" className="form-label">
                Related Brew Log
              </label>
              <select
                id="brewLogId"
                name="brewLogId"
                className="form-select"
                value={formData.brewLogId}
                onChange={handleChange}
              >
                <option value="">No brew log</option>
                {state.brewLogs.map(brewLog => (
                  <option key={brewLog.id} value={brewLog.id}>
                    {brewLog.name} ({brewLog.type})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Timing */}
        <div className="form-section">
          <h3>Timing</h3>
          
          <div className="form-group">
            <label htmlFor="date" className="form-label">
              Alert Date & Time *
            </label>
            <input
              type="datetime-local"
              id="date"
              name="date"
              className="form-input"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isRecurring"
                checked={formData.isRecurring}
                onChange={(e) => setFormData(prev => ({ ...prev, isRecurring: e.target.checked }))}
              />
              Make this a recurring alert
            </label>
          </div>

          {formData.isRecurring && (
            <div className="recurring-options">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="recurringType" className="form-label">
                    Repeat
                  </label>
                  <select
                    id="recurringType"
                    name="recurringType"
                    className="form-select"
                    value={formData.recurringType}
                    onChange={handleChange}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="recurringInterval" className="form-label">
                    Every
                  </label>
                  <input
                    type="number"
                    id="recurringInterval"
                    name="recurringInterval"
                    className="form-input"
                    value={formData.recurringInterval}
                    onChange={handleChange}
                    min="1"
                    placeholder="1"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="endDate" className="form-label">
                  End Date (optional)
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  className="form-input"
                  value={formData.endDate}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}
        </div>

        <div className="form-actions">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/alerts')}
          >
            <X size={16} />
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
          >
            <Save size={16} />
            {isEditing ? 'Update' : 'Create'} Alert
          </Button>
        </div>
      </form>

    </div>
  );
}

export default AlertForm;

