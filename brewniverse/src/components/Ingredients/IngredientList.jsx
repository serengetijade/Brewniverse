import React from 'react';
import { Plus } from 'lucide-react';
import Button from '../UI/Button';
import Ingredient from './Ingredient';
import '../../Styles/Shared/ingredients.css';
import { generateId } from '../../contexts/AppContext';
  
export default function IngredientList({  
  formData,  
  setFormData,  
  ingredientType,  
  sectionName,  
  sectionDescription,  
  sectionInfoMessage,  
}) {
    const [editingIngredient, setEditingIngredient] = React.useState(null);

    const addIngredient = (type) => {
        const newIngredient = {
            id: generateId(),
            name: '',
            amount: '',
            unit: 'oz'
        };
        setFormData(prev => ({
            ...prev,
            [type]: [...prev[type], newIngredient]
        }));
        // Immediately open the editor for the new ingredient
        setEditingIngredient({ type, id: newIngredient.id });
    };

    const removeIngredient = (type, id) => {
        setFormData(prev => ({
            ...prev,
            [type]: prev[type].filter(item => item.id !== id)
        }));
    };

    const editIngredient = (type, id) => {
        setEditingIngredient({ type, id });
    };

    const cancelEditIngredient = () => {
        // If canceling an ingredient that has no data, remove it
        if (editingIngredient) {
            const { type, id } = editingIngredient;
            const ingredient = formData[type].find(ing => ing.id === id);
            if (ingredient && !ingredient.name && !ingredient.amount) {
                removeIngredient(type, id);
            }
        }
        setEditingIngredient(null);
    };

    const saveEditIngredient = (type, id, updatedIngredient) => {
        // Validation
        if (!updatedIngredient.name.trim()) {
            alert('Please enter an ingredient name.');
            return;
        }

        // Update the ingredient in formData
        setFormData(prev => ({
            ...prev,
            [type]: prev[type].map(item =>
                item.id === id ? { ...item, ...updatedIngredient } : item
            )
        }));
        
        setEditingIngredient(null);
    };  
  
  const description = sectionDescription 
    ? (<span className="section-description"> {sectionDescription}</span>) 
    : null;  
  
  return (  
    <div>  
      <div className="section-header">  
        <h3>{sectionName}{description}</h3>            
      </div>  

      <div className="form-group">
      {formData[ingredientType].length === 0 
      ? (<p className="empty-message">{sectionInfoMessage}</p>) 
      : (  
        <div className="ingredients-list">  
          {formData[ingredientType].map((ingredient) => (  
            <div key={ingredient.id} className="ingredient-item">  
              <Ingredient
                ingredient={ingredient}
                type={ingredientType}
                isEditing={editingIngredient && editingIngredient.type === ingredientType && editingIngredient.id === ingredient.id}
                onSave={saveEditIngredient}
                onCancel={cancelEditIngredient}
                onEdit={editIngredient}
                onRemove={removeIngredient}
              />
            </div>  
          ))}  
        </div>  
      )} 
      </div>

      <div className="form-group">
        <Button  
          type="button"  
          variant="outline"  
              size="small"
              onClick={() => addIngredient(ingredientType
          )}  
        >  
          <Plus size={16} />  
          Add Ingredient  
        </Button> 
      </div>
    </div>  
  );  
}  