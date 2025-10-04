import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit, Trash2, Copy } from 'lucide-react';
import { useApp, ActionTypes } from '../../contexts/AppContext';
import Button from '../UI/Button';

function InstructionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();

  const instruction = state.instructions.find(inst => inst.id === id);

  if (!instruction) {
    return (
      <div className="instruction-detail">
        <div className="empty-state">
          <h3>Instruction Not Found</h3>
          <p>The instruction you're looking for doesn't exist.</p>
          <Button variant="primary" onClick={() => navigate('/instructions')}>
            Back to Instructions
          </Button>
        </div>
      </div>
    );
  }

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${instruction.name}"?`)) {
      dispatch({
        type: ActionTypes.DELETE_INSTRUCTION,
        payload: id
      });
      navigate('/instructions');
    }
  };

  const handleClone = () => {
    const newName = prompt('Enter name for cloned instruction:', `${instruction.name} (Copy)`);
    if (newName && newName.trim()) {
      dispatch({
        type: ActionTypes.CLONE_INSTRUCTION,
        payload: { id: instruction.id, newName: newName.trim() }
      });
      navigate('/instructions');
    }
  };

  return (
    <div className="instruction-detail">
      <div className="detail-header">
        <div className="header-content">
          <h1>{instruction.name}</h1>
          <p>{instruction.steps?.length || 0} step{instruction.steps?.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="header-actions">
          <Button
            variant="ghost"
            onClick={handleClone}
          >
            <Copy size={16} />
            Clone
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate(`/instructions/${id}/edit`)}
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
          <h2>Steps</h2>
          {instruction.steps && instruction.steps.length > 0 ? (
            <ol className="steps-list">
              {instruction.steps.map((step, index) => (
                <li key={index} className="step-item">
                  {step}
                </li>
              ))}
            </ol>
          ) : (
            <p>No steps defined for this instruction.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default InstructionDetail;

