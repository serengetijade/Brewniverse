import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import Button from '../UI/Button';

function RecipesList() {
  const navigate = useNavigate();
  const { state } = useApp();

  const recipes = state.recipes.sort((a, b) => 
    new Date(b.dateCreated) - new Date(a.dateCreated)
  );

  return (
    <div className="recipes-list">
      <div className="list-header">
        <div className="header-content">
          <h1>Recipes</h1>
          <p>Manage your brewing recipes and ingredients</p>
        </div>
        <Button
          variant="primary"
          size="large"
          onClick={() => navigate('/recipes/new')}
        >
          <Plus size={20} />
          New Recipe
        </Button>
      </div>

      {recipes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <FileText size={64} />
          </div>
          <h3>No Recipes Yet</h3>
          <p>Create your first recipe to start building your brewing library.</p>
          <Button
            variant="primary"
            size="large"
            onClick={() => navigate('/recipes/new')}
          >
            <Plus size={20} />
            Create Your First Recipe
          </Button>
        </div>
      ) : (
        <div className="recipes-grid">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="recipe-card">
              <div className="recipe-content">
                <h3 className="recipe-name">{recipe.name}</h3>
                <p className="recipe-date">
                  Created {new Date(recipe.dateCreated).toLocaleDateString()}
                </p>
                {recipe.ingredients && (
                  <p className="recipe-ingredients">
                    {recipe.ingredients.length} ingredient{recipe.ingredients.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
              
              <div className="recipe-actions">
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
          ))}
        </div>
      )}
    </div>
  );
}

export default RecipesList;

