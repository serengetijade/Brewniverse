import React from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { Validation } from '../../constants/ValidationConstants';
import Button from '../UI/Button';
import '../../Styles/Shared/instructions.css';

function InstructionForm({ instructions = [''], onInstructionsChange }) {
    const handleStepChange = (index, value) => {
        const newSteps = [...instructions];
        newSteps[index] = value;
        onInstructionsChange(newSteps);
    };

    const addStep = () => {
        const newSteps = [...instructions, ''];
        onInstructionsChange(newSteps);
    };

    const removeStep = (index) => {
        if (instructions.length > 1) {
            const newSteps = instructions.filter((_, i) => i !== index);
            onInstructionsChange(newSteps);
        }
    };

    const moveStepUp = (index) => {
        if (index > 0) {
            const newSteps = [...instructions];
            [newSteps[index - 1], newSteps[index]] = [newSteps[index], newSteps[index - 1]];
            onInstructionsChange(newSteps);
        }
    };

    const moveStepDown = (index) => {
        if (index < instructions.length - 1) {
            const newSteps = [...instructions];
            [newSteps[index], newSteps[index + 1]] = [newSteps[index + 1], newSteps[index]];
            onInstructionsChange(newSteps);
        }
    };

    return (
        <div className="instruction-container">
            <div className="steps-header">
                <label className="form-label">Instructions</label>
            </div>

            <div className="steps-container">
                {instructions.map((step, index) => (
                    <div key={index} className="step-input-group">
                        <div
                            className="step-number"
                            onClick={() => toggleEditButtons(index)}
                            style={{ cursor: 'pointer' }}
                            title="Click to edit"
                        >
                            {index + 1}
                        </div>
                        <textarea
                            className="form-textarea step-textarea"
                            value={step}
                            onChange={(e) => handleStepChange(index, e.target.value)}
                            placeholder={`Enter step ${index + 1}`}
                            maxLength={Validation.TextareaMaxLength}
                            rows={2}
                        />
                        <div className="step-controls">
                            <div className="reorder-buttons">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="small"
                                    onClick={() => moveStepUp(index)}
                                    disabled={index === 0}
                                    title="Move step up"
                                >
                                    <ChevronUp size={16} />
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="small"
                                    onClick={() => moveStepDown(index)}
                                    disabled={index === instructions.length - 1}
                                    title="Move step down"
                                >
                                    <ChevronDown size={16} />
                                </Button>
                                {instructions.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="small"
                                        onClick={() => removeStep(index)}
                                        className="remove-step-btn"
                                        title="Remove step"
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="steps-footer">
                <Button
                    type="button"
                    variant="outline"
                    size="small"
                    onClick={addStep}
                >
                    <Plus size={16} />
                    Add Step
                </Button>
            </div>
        </div>
    );
}

export default InstructionForm;
