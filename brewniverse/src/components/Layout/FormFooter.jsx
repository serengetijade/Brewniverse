import { ArrowLeft, ChevronDown, ChevronUp, Save, Trash2, X } from 'lucide-react';
import React, { useState } from 'react';
import Button from '../UI/Button';

function FormFooter({
    isEditing,
    onCancel,
    onDelete,
    onSubmit,
    showCancel = false,
    showDelete = true,
    collapsible = true,
    defaultExpanded = false,
    submitLabel = null,
    submitIcon = null,
    cancelLabel = "Cancel",
    cancelIcon = <ArrowLeft size={ 18 }/>
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
                        type="outline"
                        variant="error"
                        onClick={onDelete}
                        className="btn-delete"
                    >
                        <Trash2 size={18} />
                        Delete
                    </Button>
                )}

                {!isEditing && showCancel &&
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onCancel}
                    >
                        {cancelIcon}
                        {cancelLabel}
                    </Button>}

                <Button
                    type="submit"
                    variant="primary"
                    onClick={(e) => {
                        e.preventDefault();
                        if (onSubmit) {
                            onSubmit();
                        } 
                        else {
                            document.querySelector('form').requestSubmit();
                        }
                    }}
                >
                    {submitIcon || <Save size={18} />}
                    {submitLabel || `${isEditing ? 'Save' : 'Create'}`}
                </Button>
            </div>
        </div>
    );
}

export default FormFooter;

