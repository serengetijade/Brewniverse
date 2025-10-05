import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Button from '../UI/Button';
import IngredientEditor from '../UI/IngredientEditor';
import '../../Styles/Ingredients.css';
  
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
            id: Date.now().toString(),
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

    const updateIngredient = (type, id, field, value) => {
        setFormData(prev => ({
            ...prev,
            [type]: prev[type].map(item =>
                item.id === id ? { ...item, [field]: value } : item
            )
        }));
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
                // Remove empty ingredient
                setFormData(prev => ({
                    ...prev,
                    [type]: prev[type].filter(ing => ing.id !== id)
                }));
            }
        }
        setEditingIngredient(null);
    };

    const saveEditIngredient = (type, id, updatedIngredient) => {
        // Validate that at least name is provided
        if (!updatedIngredient.name.trim()) {
            alert('Please enter an ingredient name.');
            return;
        }

        updateIngredient(type, id, 'name', updatedIngredient.name);
        updateIngredient(type, id, 'amount', updatedIngredient.amount);
        updateIngredient(type, id, 'unit', updatedIngredient.unit);
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
  
      {formData[ingredientType].length === 0 
      ? (<p className="empty-message">{sectionInfoMessage}</p>) 
      : (  
        <div className="ingredients-list">  
          {formData[ingredientType].map((ingredient) => (  
            <div key={ingredient.id} className="ingredient-item">  
              {editingIngredient 
                && editingIngredient.type === ingredientType 
                && editingIngredient.id === ingredient.id 
                ? (<IngredientEditor  
                  ingredient={ingredient}  
                  type={ingredientType}  
                  onSave={saveEditIngredient}  
                  onCancel={cancelEditIngredient}  
                />) 
              : (  
                <>  
                  <div className="ingredient-display">  
                    {ingredient.name && ingredient.amount && ingredient.unit  
                      ? `${ingredient.name} - ${ingredient.amount} ${ingredient.unit}`  
                      : ingredient.name && !ingredient.amount && ingredient.unit  
                          ? `${ingredient.name}`
                          :'New ingredient'}  
                  </div>  
                  <div className="ingredient-actions">  
                    <Button  
                      type="button"  
                      variant="ghost"  
                      size="small"  
                      onClick={() => editIngredient(ingredientType, ingredient.id)}  
                    >  
                      Edit  
                    </Button>  
                    <Button  
                      type="button"  
                      variant="ghost"  
                      size="small"  
                      onClick={() => removeIngredient(ingredientType, ingredient.id)}  
                    >  
                      <Trash2 size={16} />  
                    </Button>  
                  </div>  
                </>  
              )}  
            </div>  
          ))}  
        </div>  
      )} 

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
  );  
}  