import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp, ActionTypes } from '../../contexts/AppContext';
import { Validation } from '../../constants/ValidationConstants';
import FormHeader from '../Layout/FormHeader';
import FormFooter from '../Layout/FormFooter';
import Alert from '../../models/Alert';
import '../../Styles/AlertForm.css';

function AlertForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState(() => new Alert({ id }));

  useEffect(() => {
    if (isEditing) {
      const alert = state.alerts.find(a => a.id === id);
      if (alert) {
        setFormData(Alert.fromJSON({
          ...alert,
          date: new Date(alert.date).toISOString().slice(0, 16)
        }));
      }
    }
  }, [id, isEditing]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const alertData = {
      ...formData.toJSON(),
      date: new Date(formData.date).toISOString(),
    };

    if (isEditing) {
      dispatch({
        type: ActionTypes.UPDATE_ALERT,
        payload: { ...alertData, id }
      });
    }
    else {
      dispatch({
        type: ActionTypes.ADD_ALERT,
        payload: alertData
      });
    }

    navigate('/alerts');
  };

  const updateFormData = (updates) => {
    const updatedData = Alert.fromJSON({ ...formData.toJSON(), ...updates });
    setFormData(updatedData);
    
    if (isEditing) {
      dispatch({
        type: ActionTypes.UPDATE_ALERT,
        payload: { 
          ...updatedData.toJSON(), 
          id,
          date: new Date(updatedData.date).toISOString()
        }
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${formData.name}"?`)) {
      dispatch({
        type: ActionTypes.DELETE_ALERT,
        payload: id
      });
      navigate('/alerts');
    }
  };

  return (
    <div className="form-container form-with-footer">
      <FormHeader 
        isEditing={isEditing} 
        entityName="Alert" 
      />

      <form onSubmit={handleSubmit} className="card">
        {/* Basic Information */}
        <div className="form-section">
          <h3>Basic Information</h3>

        {isEditing && (
            <div className="form-group form-group-completed">
                <button
                    type="button"
                    className={`btn btn-completed ${formData.isCompleted ? 'btn-completed-active' : ''}`}
                    onClick={() => updateFormData({ isCompleted: !formData.isCompleted })}
                >
                    {formData.isCompleted ? '✓ Completed' : 'Mark as completed'}
                </button>
            </div>
        )}  
          
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
              maxLength={Validation.InputMaxLength}
              placeholder="Enter alert name"
            />
                  </div>
          
        {/* Timing */}
          <div className="form-group">
            <label htmlFor="date" className="form-label">
              Date & Time *
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
            <button
              type="button"
              className={`btn btn-toggle ${formData.isRecurring ? 'btn-toggle-active' : ''}`}
              onClick={() => updateFormData({ isRecurring: !formData.isRecurring })}
            >
              {formData.isRecurring ? '✓ Recurring Alert' : 'Make this a recurring alert'}
            </button>
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
                    step="1"
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
              maxLength={Validation.TextareaMaxLength}
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
          </div>
        </div>

        {/* Related Items */}
        <div className="form-section">
          <h3>Related Items</h3>
          <div className="form-row">
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
      </form>

      <FormFooter 
        isEditing={isEditing}
        entityName="Alert"
        showCancel={!isEditing}
        onCancel={() => navigate('/alerts')}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default AlertForm;

