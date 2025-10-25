import React from 'react';
import { Check } from 'lucide-react';

function InstructionCheckbox({ stepIndex, instruction, isCompleted, onToggle }) {
    return (
        <div className={`recipe-step ${isCompleted ? 'completed' : ''}`}>
            <div className="step-checkbox-container">
                <div className="step-number-badge">{stepIndex + 1}</div>
                <button
                    type="button"
                    className={`step-checkbox ${isCompleted ? 'checked' : ''}`}
                    onClick={() => onToggle(stepIndex)}
                    aria-label={`Mark step ${stepIndex + 1} as ${isCompleted ? 'incomplete' : 'complete'}`}
                >
                    {isCompleted && <Check size={16} />}
                </button>
            </div>
            <div className="step-content">
                <p className={isCompleted ? 'step-text-completed' : ''}>{instruction}</p>
            </div>
        </div>
    );
}

export default InstructionCheckbox;

