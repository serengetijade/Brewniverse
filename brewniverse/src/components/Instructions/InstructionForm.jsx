import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, X, Plus, Trash2 } from 'lucide-react';
import { useApp, ActionTypes } from '../../contexts/AppContext';
import Button from '../UI/Button';
import './InstructionForm.css';

function InstructionForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    steps: ['']
  });

  useEffect(() => {
    if (isEditing) {
      const instruction = state.instructions.find(inst => inst.id === id);
      if (instruction) {
        setFormData({
          name: instruction.name,
          steps: instruction.steps && instruction.steps.length > 0 ? instruction.steps : ['']
        });
      }
    }
  }, [id, isEditing, state.instructions]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const instructionData = {
      ...formData,
      steps: formData.steps.filter(step => step.trim() !== '')
    };

    if (isEditing) {
      dispatch({
        type: ActionTypes.UPDATE_INSTRUCTION,
        payload: { ...instructionData, id }
      });
    } else {
      dispatch({
        type: ActionTypes.ADD_INSTRUCTION,
        payload: instructionData
      });
    }

    navigate('/instructions');
  };

  const handleNameChange = (e) => {
    setFormData(prev => ({
      ...prev,
      name: e.target.value
    }));
  };

  const handleStepChange = (index, value) => {
    const newSteps = [...formData.steps];
    newSteps[index] = value;
    setFormData(prev => ({
      ...prev,
      steps: newSteps
    }));
  };

  const addStep = () => {
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, '']
    }));
  };

  const removeStep = (index) => {
    if (formData.steps.length > 1) {
      const newSteps = formData.steps.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        steps: newSteps
      }));
    }
  };

  return (
    <div className="instruction-form">
      <div className="form-header">
        <h1>{isEditing ? 'Edit Instruction' : 'New Instruction'}</h1>
        <p>
          {isEditing 
            ? 'Update your instruction details' 
            : 'Create a new instruction set'
          }
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card">
        <div className="form-group">
          <label htmlFor="name" className="form-label">
            Instruction Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            className="form-input"
            value={formData.name}
            onChange={handleNameChange}
            required
            placeholder="Enter instruction name"
          />
        </div>

        <div className="form-group">
          <div className="steps-header">
            <label className="form-label">Steps</label>
            <Button
              type="button"
              variant="ghost"
              size="small"
              onClick={addStep}
            >
              <Plus size={16} />
              Add Step
            </Button>
          </div>
          
          <div className="steps-container">
            {formData.steps.map((step, index) => (
              <div key={index} className="step-input-group">
                <div className="step-number">{index + 1}</div>
                <textarea
                  className="form-textarea step-textarea"
                  value={step}
                  onChange={(e) => handleStepChange(index, e.target.value)}
                  placeholder={`Enter step ${index + 1}`}
                  rows={2}
                />
                {formData.steps.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="small"
                    onClick={() => removeStep(index)}
                    className="remove-step-btn"
                  >
                    <Trash2 size={16} />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/instructions')}
          >
            <X size={16} />
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
          >
            <Save size={16} />
            {isEditing ? 'Update' : 'Create'} Instruction
          </Button>
        </div>
      </form>
    </div>
  );
}

export default InstructionForm;
