import { Plus, ChevronDown, GripVertical } from 'lucide-react';
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
    const [draggedItem, setDraggedItem] = React.useState(null);
    const [touchStartY, setTouchStartY] = React.useState(null);
    const [touchCurrentY, setTouchCurrentY] = React.useState(null);
    const [dragOverIndex, setDragOverIndex] = React.useState(null);

    const addIngredient = (type) => {
        const formDataObj = formData.toJSON ? formData.toJSON() : formData;
        const maxOrder = formDataObj[type].length > 0 
            ? Math.max(...formDataObj[type].map(i => i.order || 0))
            : -1;
        
        const newIngredient = new IngredientModel({ order: maxOrder + 1 });
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

    const handleDragStart = (e, ingredient, type) => {
        setDraggedItem({ ingredient, type });
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, targetIngredient, type) => {
        e.preventDefault();
        
        if (!draggedItem || draggedItem.type !== type) {
            return;
        }

        const formDataObj = formData.toJSON ? formData.toJSON() : formData;
        const ingredients = [...formDataObj[type]];
        
        const draggedIndex = ingredients.findIndex(i => i.id === draggedItem.ingredient.id);
        const targetIndex = ingredients.findIndex(i => i.id === targetIngredient.id);

        if (draggedIndex === targetIndex) {
            setDraggedItem(null);
            return;
        }

        // Reorder the array
        const [removed] = ingredients.splice(draggedIndex, 1);
        ingredients.splice(targetIndex, 0, removed);

        // Update order properties
        const reorderedIngredients = ingredients.map((ing, index) => ({
            ...ing,
            order: index
        }));

        setFormData(prev => {
            const prevData = prev.toJSON ? prev.toJSON() : prev;
            return {
                ...prevData,
                [type]: reorderedIngredients
            };
        });

        setDraggedItem(null);
    };

    const handleDragEnd = () => {
        setDraggedItem(null);
        setDragOverIndex(null);
    };

    // Touch event handlers for mobile support
    const handleTouchStart = (e, ingredient, type) => {
        const touch = e.touches[0];
        setTouchStartY(touch.clientY);
        setDraggedItem({ ingredient, type });
    };

    const handleTouchMove = (e, ingredients) => {
        if (!draggedItem) return;
        
        e.preventDefault(); // Prevent scrolling while dragging
        const touch = e.touches[0];
        setTouchCurrentY(touch.clientY);

        // Find which ingredient is under the touch point
        const elements = document.elementsFromPoint(touch.clientX, touch.clientY);
        const ingredientElement = elements.find(el => el.classList.contains('ingredient-item'));
        
        if (ingredientElement) {
            const ingredientId = ingredientElement.getAttribute('data-ingredient-id');
            const index = ingredients.findIndex(i => i.id === ingredientId);
            if (index !== -1) {
                setDragOverIndex(index);
            }
        }
    };

    const handleTouchEnd = (e, targetIngredient, type) => {
        if (!draggedItem || draggedItem.type !== type) {
            setDraggedItem(null);
            setTouchStartY(null);
            setTouchCurrentY(null);
            setDragOverIndex(null);
            return;
        }

        const formDataObj = formData.toJSON ? formData.toJSON() : formData;
        const ingredients = [...formDataObj[type]].sort((a, b) => {
            const orderA = a.order !== undefined ? a.order : 999999;
            const orderB = b.order !== undefined ? b.order : 999999;
            return orderA - orderB;
        });
        
        const draggedIndex = ingredients.findIndex(i => i.id === draggedItem.ingredient.id);
        let targetIndex = dragOverIndex !== null ? dragOverIndex : ingredients.findIndex(i => i.id === targetIngredient.id);

        if (draggedIndex === targetIndex || targetIndex === -1) {
            setDraggedItem(null);
            setTouchStartY(null);
            setTouchCurrentY(null);
            setDragOverIndex(null);
            return;
        }

        // Reorder the array
        const [removed] = ingredients.splice(draggedIndex, 1);
        ingredients.splice(targetIndex, 0, removed);

        // Update order properties
        const reorderedIngredients = ingredients.map((ing, index) => ({
            ...ing,
            order: index
        }));

        setFormData(prev => {
            const prevData = prev.toJSON ? prev.toJSON() : prev;
            return {
                ...prevData,
                [type]: reorderedIngredients
            };
        });

        setDraggedItem(null);
        setTouchStartY(null);
        setTouchCurrentY(null);
        setDragOverIndex(null);
    };

    const description = sectionDescription
        ? (<span className="section-description"> {sectionDescription}</span>)
        : null;

    const formDataObj = formData.toJSON ? formData.toJSON() : formData;
    
    // Sort ingredients by order
    const sortedIngredients = [...formDataObj[ingredientType]].sort((a, b) => {
        const orderA = a.order !== undefined ? a.order : 999999;
        const orderB = b.order !== undefined ? b.order : 999999;
        return orderA - orderB;
    });

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
                {sortedIngredients.length === 0
                    ? (<p className="empty-message">{sectionInfoMessage}</p>)
                    : (
                        <div className="ingredients-list">
                            {sortedIngredients.map((ingredient, index) => (
                                <div 
                                    key={ingredient.id}
                                    data-ingredient-id={ingredient.id}
                                    className={`ingredient-item ${draggedItem?.ingredient.id === ingredient.id ? 'dragging' : ''} ${dragOverIndex === index ? 'drag-over' : ''}`}
                                    draggable={!editingIngredient}
                                    onDragStart={(e) => handleDragStart(e, ingredient, ingredientType)}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, ingredient, ingredientType)}
                                    onDragEnd={handleDragEnd}
                                    onTouchStart={(e) => handleTouchStart(e, ingredient, ingredientType)}
                                    onTouchMove={(e) => handleTouchMove(e, sortedIngredients)}
                                    onTouchEnd={(e) => handleTouchEnd(e, ingredient, ingredientType)}
                                >
                                    {!editingIngredient && (
                                        <div className="ingredient-drag-handle">
                                            <GripVertical size={16} />
                                        </div>
                                    )}
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