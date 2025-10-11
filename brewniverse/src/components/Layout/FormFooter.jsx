import React from 'react';
import { Save, X, Trash2 } from 'lucide-react';
import Button from '../UI/Button';

function FormFooter({ 
  isEditing, 
  entityName, 
  onCancel, 
  onDelete, 
  onSubmit,
  showDelete = true 
}) {
  return (
    <div className="form-footer">
      <Button
        type="button"
        variant="ghost"
        onClick={onCancel}
      >
        <X size={16} />
        Cancel
      </Button>
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
        <Save size={16} />
        {isEditing ? 'Update' : 'Create'} {entityName}
      </Button>
    </div>
  );
}

export default FormFooter;

