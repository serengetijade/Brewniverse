import React from 'react';

function IngredientDisplay({ ingredients, title }) {
    if (!ingredients || ingredients.length === 0) {
        return null;
    }

    // Sort ingredients by order
    const sortedIngredients = [...ingredients].sort((a, b) => {
        const orderA = a.order !== undefined ? a.order : 999999;
        const orderB = b.order !== undefined ? b.order : 999999;
        return orderA - orderB;
    });

    return (
        <div className="ingredient-container">
            <h3 className="ingredient-container-title">{title}</h3>
            <ul className="ingredient-list-display">
                {sortedIngredients.map((ingredient) => (
                    <li key={ingredient.id} className="ingredient-item-display">
                        <span className="ingredient-name">{ingredient.name}</span>
                        {ingredient.amount && (
                            <span className="ingredient-amount">
                                {ingredient.amount} {ingredient.unit}
                            </span>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default IngredientDisplay;