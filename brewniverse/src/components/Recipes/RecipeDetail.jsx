import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit, Trash2 } from 'lucide-react';
import { useApp, ActionTypes } from '../../contexts/AppContext';
import Button from '../UI/Button';

function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();

  const recipe = state.recipes.find(r => r.id === id);

  if (!recipe) {
    return (
      <div className="recipe-detail">
        <div className="empty-state">
          <h3>Recipe Not Found</h3>
          <p>The recipe you're looking for doesn't exist.</p>
          <Button variant="primary" onClick={() => navigate('/recipes')}>
            Back to Recipes
          </Button>
        </div>
      </div>
    );
  }

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${recipe.name}"?`)) {
      dispatch({
        type: ActionTypes.DELETE_RECIPE,
        payload: id
      });
      navigate('/recipes');
    }
  };

  return (
    <div className="recipe-detail">
      <div className="detail-header">
        <div className="header-content">
          <h1>{recipe.name}</h1>
          <p>Created {new Date(recipe.dateCreated).toLocaleDateString()}</p>
        </div>
        <div className="header-actions">
          <Button
            variant="secondary"
            onClick={() => navigate(`/recipes/${id}/edit`)}
          >
            <Edit size={16} />
            Edit
          </Button>
          <Button
            variant="error"
            onClick={handleDelete}
          >
            <Trash2 size={16} />
            Delete
          </Button>
        </div>
      </div>

      <div className="detail-content">
        <div className="card">
          <h2>Recipe Details</h2>
          <p>Full recipe detail view coming soon! This will include ingredients list, amounts, units, and connections to brew logs that used this recipe.</p>
        </div>
      </div>
    </div>
  );
}

export default RecipeDetail;

