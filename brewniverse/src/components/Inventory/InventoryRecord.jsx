import React from 'react';
import { Minus, Plus } from 'lucide-react';
import '../../Styles/Inventory.css';
import Rating from '../UI/Rating';

function InventoryRecord({
    name,
    quantity,
    onQuantityChange,
    showName = true,
    showRating = false,
    rating = 0,
    inputId,
    min = 0
}) {
    const handleInputChange = (event) => {
        onQuantityChange(event.target.value);
    };

    const handleStepChange = (delta) => {
        const currentValue = Number.parseFloat(quantity);
        const safeValue = Number.isNaN(currentValue) ? 0 : currentValue;
        const nextValue = Math.max(min, safeValue + delta);
        onQuantityChange(nextValue);
    };

    const rowClassName = [
        'inventory-row',
        showName ? '' : 'inventory-row--no-name'
    ].filter(Boolean).join(' ');

    const ariaLabel = showName
        ? `${name || 'Brew log'} inventory quantity`
        : 'Inventory quantity';

    return (
        <div className={rowClassName}>
            {showName && (
                <div className="inventory-name">
                    <div className="inventory-name-text">
                        {name || 'Untitled Brew Log'}
                    </div>
                    {showRating && rating > 0 && (
                        <div className="inventory-rating">
                            <Rating value={rating} isEditing={false} />
                        </div>
                    )}
                </div>
            )}
            <div className="inventory-controls">
                <button
                    type="button"
                    className="inventory-step-button minus"
                    onClick={() => handleStepChange(-1)}
                    aria-label="Decrease inventory quantity"
                >
                    <Minus size={14} />
                </button>
                <input
                    id={inputId}
                    type="number"
                    min={min}
                    step="1"
                    className="inventory-input"
                    value={quantity ?? ''}
                    onChange={handleInputChange}
                    aria-label={ariaLabel}
                />
                <button
                    type="button"
                    className="inventory-step-button plus button"
                    onClick={() => handleStepChange(1)}
                    aria-label="Increase inventory quantity"
                >
                    <Plus size={14} />
                </button>
            </div>
        </div>
    );
}

export default InventoryRecord;