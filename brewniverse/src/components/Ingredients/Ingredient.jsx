import React, { useState, useEffect, useRef } from 'react';
import { Save, X, Trash2 } from 'lucide-react';
import '../../Styles/Shared/ingredients.css';
import Button from '../UI/Button';

function Ingredient({
    ingredient,
    type,
    isEditing,
    onSave,
    onCancel,
    onEdit,
    onRemove
}){
    const [editData, setEditData] = useState({
        name: ingredient.name,
        amount: ingredient.amount,
        unit: ingredient.unit
    });

    const nameInputRef = useRef(null);
    useEffect(() => {
        if (isEditing && nameInputRef.current) {
            nameInputRef.current.focus();
        }
    }, [isEditing]);

    const handleSave = () => {
        onSave(type, ingredient.id, editData);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSave();
        }
        else if (e.key === 'Escape') {
            onCancel();
        }
    };

    // If editing, show editor
    if (isEditing) {
        return (
            <div className="ingredient-editor">
                <div className="form-group">
                    <input
                        ref={nameInputRef}
                        type="text"
                        className="form-input"
                        placeholder="Ingredient name"
                        value={editData.name}
                        onChange={(x) => setEditData(prev => ({ ...prev, name: x.target.value }))}
                        onKeyDown={handleKeyPress}
                    />
                </div>
                <div className="form-group">
                    <input
                        type="number"
                        step="0.01"
                        className="form-input"
                        placeholder="Amount"
                        value={editData.amount}
                        onChange={(e) => setEditData(prev => ({ ...prev, amount: e.target.value }))}
                        onKeyDown={handleKeyPress}
                    />
                </div>
                <div className="form-group">
                    <select
                        className="form-select"
                        value={editData.unit}
                        onChange={(e) => setEditData(prev => ({ ...prev, unit: e.target.value }))}
                        onKeyDown={handleKeyPress}
                    >
                        <option value="oz">oz</option>
                        <option value="lbs">lbs</option>
                        <option value="gal">gal</option>
                        <option value="g">g</option>
                        <option value="kg">kg</option>
                        <option value="ml">ml</option>
                        <option value="L">L</option>
                        <option value="tsp">tsp</option>
                        <option value="tbsp">tbsp</option>
                        <option value="cups">cups</option>
                        <option value="unit(s)">unit(s)</option>
                    </select>
                </div>
                <div className="ingredient-editor-actions">
                    <Button
                        type="button"
                        variant="primary"
                        size="small"
                        onClick={handleSave}
                    >
                        <Save size={16} />
                        Save
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="small"
                        onClick={onCancel}
                    >
                        <X size={16} />
                        Cancel
                    </Button>
                </div>
            </div>
        );
    }

    // If not editing, show display view
    return (
        <>
            <div className="ingredient-display">
                {ingredient.name && ingredient.amount && ingredient.unit
                    ? `${ingredient.name} - ${ingredient.amount} ${ingredient.unit}`
                    : ingredient.name && !ingredient.amount
                        ? `${ingredient.name}`
                        : 'New ingredient'}
            </div>
            <div className="ingredient-actions">
                <Button
                    type="button"
                    variant="ghost"
                    size="small"
                    onClick={() => onEdit(type, ingredient.id)}
                >
                    Edit
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="small"
                    onClick={() => onRemove(type, ingredient.id)}
                >
                    <Trash2 size={16} />
                </Button>
            </div>
        </>
    );
};

export default Ingredient;