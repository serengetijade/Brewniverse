import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Atom, Barrel, BookOpen, Calendar, Leaf } from 'lucide-react';
import Button from '../UI/Button';
import { getBrewTypeConfig } from '../../constants/BrewTypes';
import { useApp } from '../../contexts/AppContext';

function RecipeCard({ recipe }) {
  const navigate = useNavigate();
  const { state } = useApp();
  const brewTypeConfig = getBrewTypeConfig(recipe.type);

  const getIngredientCount = () => {
    const primary = recipe.ingredientsPrimary?.length || 0;
    const secondary = recipe.ingredientsSecondary?.length || 0;
    const adjunct = recipe.ingredientsAdjunct?.length || 0;
    return primary + secondary + adjunct;
  };

  const getIngredientBreakdown = () => {
    return {
      primary: recipe.ingredientsPrimary?.length || 0,
      secondary: recipe.ingredientsSecondary?.length || 0,
      adjunct: recipe.ingredientsAdjunct?.length || 0
    };
  };

  // Count how many brew logs use this recipe
  const brewLogCount = state.brewLogs.filter(bl => bl.recipeId === recipe.id).length;

  const breakdown = getIngredientBreakdown();

  return (
    <div className="item-card recipe-card" style={{'--item-color': brewTypeConfig.color}}>
      <div className="recipe-card-accent"></div>
      <div className="recipe-header">
        <div className="recipe-type">
          <span className="recipe-type-icon-large">{brewTypeConfig.icon}</span>
          <div className="recipe-type-info">
            <span className="type-text">{recipe.difficulty} {recipe.type}</span>
            <div className="recipe-date">
              <Calendar size={14} />
              <span>{new Date(recipe.dateCreated).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <div className={`recipe-usage-badge ${brewLogCount === 0 ? 'unused' : ''}`}>
          <BookOpen size={14} />
          <span>{brewLogCount} {brewLogCount === 1 ? 'Brew' : 'Brews'}</span>
        </div>
      </div>

      <div className="item-content">
        <h3 className="recipe-name">{recipe.name}</h3>
        {recipe.description && (
          <p className="item-description">{recipe.description}</p>
        )}
        
        <div className="recipe-ingredients-grid">
          {breakdown.primary > 0 && (
            <div className="ingredient-stat">
              <Atom size={16} />
              <div className="ingredient-stat-info">
                <span className="ingredient-stat-value">{breakdown.primary}</span>
                <span className="ingredient-stat-label">Primary</span>
              </div>
            </div>
          )}
          {breakdown.secondary > 0 && (
            <div className="ingredient-stat">
              <Barrel size={16} />
              <div className="ingredient-stat-info">
                <span className="ingredient-stat-value">{breakdown.secondary}</span>
                <span className="ingredient-stat-label">Secondary</span>
              </div>
            </div>
          )}
          {breakdown.adjunct > 0 && (
            <div className="ingredient-stat">
              <Leaf size={16} />
              <div className="ingredient-stat-info">
                <span className="ingredient-stat-value">{breakdown.adjunct}</span>
                <span className="ingredient-stat-label">Adjunct</span>
              </div>
            </div>
          )}
        </div>
        
        {getIngredientCount() === 0 && (
          <p className="recipe-no-ingredients">No ingredients added yet</p>
        )}
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