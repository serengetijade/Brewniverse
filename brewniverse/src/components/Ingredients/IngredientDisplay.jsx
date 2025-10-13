import React from 'react';

function IngredientDisplay({ ingredients, title }) {
  if (!ingredients || ingredients.length === 0) {
    return null;
  }

  return (
    <div className="ingredient-section">
      <h3 className="ingredient-section-title">{title}</h3>
      <ul className="ingredient-list-display">
        {ingredients.map((ingredient) => (
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