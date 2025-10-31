import { Plus, ChevronDown } from 'lucide-react';
import React from 'react';
import '../../Styles/Shared/ingredients.css';
import IngredientModel from '../../models/Ingredient';
import Button from '../UI/Button';
import Ingredient from './Ingredient';

export default function IngredientList({
    formData,
    setFormData,
    ingredientType,
    sectionName,
    sectionDescription,
    sectionInfoMessage,
    isCollapsible = false,
    isCollapsed = false,
    onToggle = null,
}) {
    const [editingIngredient, setEditingIngredient] = React.useState(null);

    const addIngredient = (type) => {
        const newIngredient = new IngredientModel();
        setFormData(prev => {
            const prevData = prev.toJSON ? prev.toJSON() : prev;
            return {
                ...prevData,
                [type]: [...prevData[type], newIngredient.toJSON()]
            };
        });
        setEditingIngredient({ type, id: newIngredient.id });
    };

    const removeIngredient = (type, id) => {
        setFormData(prev => {
            const prevData = prev.toJSON ? prev.toJSON() : prev;
            return {
                ...prevData,
                [type]: prevData[type].filter(item => item.id !== id)
            };
        });
    };

    const editIngredient = (type, id) => {
        setEditingIngredient({ type, id });
    };

    const cancelEditIngredient = () => {
        // If canceling an ingredient that has no data, remove it
        if (editingIngredient) {
            const { type, id } = editingIngredient;
            const formDataObj = formData.toJSON ? formData.toJSON() : formData;
            const ingredient = formDataObj[type].find(ing => ing.id === id);
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
        setFormData(prev => {
            const prevData = prev.toJSON ? prev.toJSON() : prev;
            return {
                ...prevData,
                [type]: prevData[type].map(item =>
                    item.id === id ? { ...item, ...updatedIngredient } : item
                )
            };
        });

        setEditingIngredient(null);
    };

    const description = sectionDescription
        ? (<span className="section-description"> {sectionDescription}</span>)
        : null;

    const formDataObj = formData.toJSON ? formData.toJSON() : formData;

    return (
        <div>
            <div 
                className={`section-header ${isCollapsible ? 'collapsible' : ''}`}
                onClick={isCollapsible ? onToggle : undefined}
            >
                <h3>
                    {isCollapsible && (
                        <ChevronDown 
                            size={20} 
                            className={`section-toggle-icon ${isCollapsed ? 'collapsed' : ''}`}
                        />
                    )}
                    {sectionName}{description}
                </h3>
            </div>

            <div className={`section-content ${isCollapsible && isCollapsed ? 'collapsed' : ''}`}>
            <div className="form-group">
                {formDataObj[ingredientType].length === 0
                    ? (<p className="empty-message">{sectionInfoMessage}</p>)
                    : (
                        <div className="ingredients-list">
                            {formDataObj[ingredientType].map((ingredient) => (
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

            <div className="form-group ingredient-add-container">
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
        </div>
    );
}  