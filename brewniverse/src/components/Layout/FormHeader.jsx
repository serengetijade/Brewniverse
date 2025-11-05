import React from 'react';

function FormHeader({ isEditing, name, entityName, hasUnsavedChanges = false }) {
    return (
        <div className="form-header">
            <h1>
                {isEditing ? `Edit ${name} ${entityName}` : `New ${entityName}`}
                {hasUnsavedChanges && <span className="unsaved-indicator"> *</span>}
            </h1>
            <p>
                {isEditing
                    ? `Update your ${entityName.toLowerCase()} details`
                    : `Create a new ${entityName.toLowerCase()}`
                }
                {hasUnsavedChanges && <span className="unsaved-text"> (You have unsaved changes)</span>}
            </p>
        </div>
    );
}

export default FormHeader;

