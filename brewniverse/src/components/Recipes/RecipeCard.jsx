import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../UI/Button';

function RecipeCard({ recipe }) {
  const navigate = useNavigate();

  const getIngredientCount = () => {
    const primary = recipe.ingredientsPrimary?.length || 0;
    const secondary = recipe.ingredientsSecondary?.length || 0;
    const adjunct = recipe.ingredientsAdjunct?.length || 0;
    return primary + secondary + adjunct;
  };

  return (
    <div className="item-card">
      <div className="item-content">
        <h3 className="recipe-name">{recipe.name}</h3>
        <p className="item-date">
          Created {new Date(recipe.dateCreated).toLocaleDateString()}
        </p>
        {recipe.description && (
          <p className="item-description">{recipe.description}</p>
        )}
        <p className="recipe-ingredients">
          {getIngredientCount()} ingredient{getIngredientCount() !== 1 ? 's' : ''}
        </p>
      </div>
      
      <div className="item-actions">
        <Button
          variant="outline"
          size="medium"
          onClick={() => navigate(`/recipes/${recipe.id}`)}
        >
          View Details
        </Button>
        <Button
          variant="ghost"
          size="medium"
          onClick={() => navigate(`/recipes/${recipe.id}/edit`)}
        >
          Edit
        </Button>
      </div>
    </div>
  );
}

export default RecipeCard;