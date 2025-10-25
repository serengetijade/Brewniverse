import { ChevronDown, ChevronUp, Save, Trash2, X } from 'lucide-react';
import React, { useState } from 'react';
import Button from '../UI/Button';

function FormFooter({
    isEditing,
    entityName,
    onCancel,
    onDelete,
    onSubmit,
    showCancel = false,
    showDelete = true,
    collapsible = true,
    defaultExpanded = false,
    submitLabel = null,
    submitIcon = null,
    cancelLabel = "Cancel"
}) {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className={`form-footer ${collapsible ? 'collapsible' : ''} ${isExpanded ? 'expanded' : 'collapsed'}`}>
            {collapsible && (
                <button
                    type="button"
                    className="footer-toggle"
                    onClick={toggleExpanded}
                    aria-label={isExpanded ? 'Hide footer' : 'Show footer'}
                >
                    {isExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                </button>
            )}
            <div className="form-footer-content">

                {isEditing && showDelete && (
                    <Button
                        type="button"
                        variant="error"
                        onClick={onDelete}
                    >
                        <Trash2 size={16} />
                        Delete
                    </Button>
                )}

                {!isEditing && showCancel &&
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onCancel}
                    >
                        <X size={16} />
                        {cancelLabel}
                    </Button>}

                <Button
                    type="submit"
                    variant="primary"
                    onClick={(e) => {
                        e.preventDefault();
                        if (onSubmit) {
                            onSubmit();
                        } else {
                            document.querySelector('form').requestSubmit();
                        }
                    }}
                >
                    {submitIcon || <Save size={16} />}
                    {submitLabel || `${isEditing ? 'Update' : 'Create'} ${entityName}`}
                </Button>
            </div>
        </div>
    );
}

export default FormFooter;

