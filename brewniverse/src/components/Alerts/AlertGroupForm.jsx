import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, X, Plus, Trash2 } from 'lucide-react';
import { useApp, ActionTypes } from '../../contexts/AppContext';
import Button from '../UI/Button';
import '../../Styles/AlertGroupForm.css';

function AlertGroupForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    alertTemplates: []
  });

  useEffect(() => {
    if (isEditing) {
      const alertGroup = state.alertGroups.find(g => g.id === id);
      if (alertGroup) {
        setFormData(alertGroup);
      }
    }
  }, [id, isEditing, state.alertGroups]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isEditing) {
      dispatch({
        type: ActionTypes.UPDATE_ALERT_GROUP,
        payload: { ...formData, id }
      });
    } else {
      dispatch({
        type: ActionTypes.ADD_ALERT_GROUP,
        payload: formData
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

  const addAlertTemplate = () => {
    const newTemplate = {
      id: Date.now().toString(),
      name: '',
      description: '',
      daysOffset: 0,
      hoursOffset: 0,
      priority: 'medium'
    };
    setFormData(prev => ({
      ...prev,
      alertTemplates: [...prev.alertTemplates, newTemplate]
    }));
  };

  const updateAlertTemplate = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      alertTemplates: prev.alertTemplates.map(template =>
        template.id === id ? { ...template, [field]: value } : template
      )
    }));
  };

  const removeAlertTemplate = (id) => {
    setFormData(prev => ({
      ...prev,
      alertTemplates: prev.alertTemplates.filter(template => template.id !== id)
    }));
  };

  return (
    <div className="alert-group-form">
      <div className="form-header">
        <h1>{isEditing ? 'Edit Alert Group' : 'New Alert Group'}</h1>
        <p>
          {isEditing 
            ? 'Update your alert group details' 
            : 'Create a reusable group of alerts'
          }
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card">
        {/* Basic Information */}
        <div className="form-section">
          <h3>Basic Information</h3>
          
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Group Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g., Feeding Schedule"
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
              placeholder="Optional description of this alert group"
              rows={3}
            />
          </div>
        </div>

        {/* Alert Templates */}
        <div className="form-section">
          <div className="section-header">
            <h3>Alert Templates</h3>
            <Button
              type="button"
              variant="outline"
              size="small"
              onClick={addAlertTemplate}
            >
              <Plus size={16} />
              Add Alert Template
            </Button>
          </div>
          
          <p className="section-description">
            Define alert templates that can be applied to brew logs. Each template will create an alert 
            at the specified time offset from the brew log's creation date.
          </p>
          
          {formData.alertTemplates.length === 0 && (
            <p className="empty-message">
              No alert templates yet. Add templates to create a reusable alert schedule.
            </p>
          )}
          
          {formData.alertTemplates.map((template) => (
            <div key={template.id} className="alert-template-row">
              <div className="template-basic">
                <div className="form-group">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Alert name"
                    value={template.name}
                    onChange={(e) => updateAlertTemplate(template.id, 'name', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Description"
                    value={template.description}
                    onChange={(e) => updateAlertTemplate(template.id, 'description', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="template-timing">
                <div className="form-group">
                  <label className="form-label">Days offset</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="0"
                    value={template.daysOffset}
                    onChange={(e) => updateAlertTemplate(template.id, 'daysOffset', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Hours offset</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="0"
                    value={template.hoursOffset}
                    onChange={(e) => updateAlertTemplate(template.id, 'hoursOffset', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select
                    className="form-select"
                    value={template.priority}
                    onChange={(e) => updateAlertTemplate(template.id, 'priority', e.target.value)}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              
              <Button
                type="button"
                variant="ghost"
                size="small"
                onClick={() => removeAlertTemplate(template.id)}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          ))}
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
            {isEditing ? 'Update' : 'Create'} Alert Group
          </Button>
        </div>
      </form>

    </div>
  );
}

export default AlertGroupForm;

