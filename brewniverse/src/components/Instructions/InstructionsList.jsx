import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Copy } from 'lucide-react';
import { useApp, ActionTypes } from '../../contexts/AppContext';
import Button from '../UI/Button';

function InstructionsList() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();

  const instructions = state.instructions.sort((a, b) => 
    a.name.localeCompare(b.name)
  );

  const handleClone = (instruction) => {
    const newName = prompt('Enter name for cloned instruction:', `${instruction.name} (Copy)`);
    if (newName && newName.trim()) {
      dispatch({
        type: ActionTypes.CLONE_INSTRUCTION,
        payload: { id: instruction.id, newName: newName.trim() }
      });
    }
  };

  return (
    <div className="instructions-list">
      <div className="list-header">
        <div className="header-content">
          <h1>Instructions</h1>
          <p>Manage your brewing instructions and procedures</p>
        </div>
        <Button
          variant="primary"
          size="large"
          onClick={() => navigate('/instructions/new')}
        >
          <Plus size={20} />
          New Instruction
        </Button>
      </div>

      {instructions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <FileText size={64} />
          </div>
          <h3>No Instructions Yet</h3>
          <p>Create your first instruction set to standardize your brewing procedures.</p>
          <Button
            variant="primary"
            size="large"
            onClick={() => navigate('/instructions/new')}
          >
            <Plus size={20} />
            Create Your First Instruction
          </Button>
        </div>
      ) : (
        <div className="instructions-grid">
          {instructions.map((instruction) => (
            <div key={instruction.id} className="instruction-card">
              <div className="instruction-content">
                <h3 className="instruction-name">{instruction.name}</h3>
                <p className="instruction-steps">
                  {instruction.steps?.length || 0} step{instruction.steps?.length !== 1 ? 's' : ''}
                </p>
                {instruction.steps && instruction.steps.length > 0 && (
                  <p className="instruction-preview">
                    {instruction.steps[0].substring(0, 100)}
                    {instruction.steps[0].length > 100 ? '...' : ''}
                  </p>
                )}
              </div>
              
              <div className="instruction-actions">
                <Button
                  variant="ghost"
                  size="small"
                  onClick={() => handleClone(instruction)}
                  title="Clone instruction"
                >
                  <Copy size={16} />
                  Clone
                </Button>
                <Button
                  variant="outline"
                  size="medium"
                  onClick={() => navigate(`/instructions/${instruction.id}`)}
                >
                  View Details
                </Button>
                <Button
                  variant="ghost"
                  size="medium"
                  onClick={() => navigate(`/instructions/${instruction.id}/edit`)}
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

export default InstructionsList;

