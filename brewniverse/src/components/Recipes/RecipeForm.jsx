import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, X, Plus, Trash2 } from 'lucide-react';
import { useApp, ActionTypes } from '../../contexts/AppContext';
import Button from '../UI/Button';
import './RecipeForm.css';

function RecipeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    dateCreated: new Date().toISOString().split('T')[0],
    ingredients: [],
    description: '',
    notes: '',
    estimatedYield: '',
    estimatedABV: '',
    difficulty: 'Beginner'
  });

  useEffect(() => {
    if (isEditing) {
      const recipe = state.recipes.find(r => r.id === id);
      if (recipe) {
        setFormData({
          ...recipe,
          dateCreated: recipe.dateCreated.split('T')[0]
        });
      }
    }
  }, [id, isEditing, state.recipes]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const recipeData = {
      ...formData,
      dateCreated: new Date(formData.dateCreated).toISOString(),
    };

    if (isEditing) {
      dispatch({
        type: ActionTypes.UPDATE_RECIPE,
        payload: { ...recipeData, id }
      });
    } else {
      dispatch({
        type: ActionTypes.ADD_RECIPE,
        payload: recipeData
      });
    }

    navigate('/recipes');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addIngredient = () => {
    const newIngredient = {
      id: Date.now().toString(),
      name: '',
      amount: '',
      unit: 'lbs'
    };
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, newIngredient]
    }));
  };

  const updateIngredient = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map(ingredient =>
        ingredient.id === id ? { ...ingredient, [field]: value } : ingredient
      )
    }));
  };

  const removeIngredient = (id) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter(ingredient => ingredient.id !== id)
    }));
  };

  // Get brew logs that use this recipe
  const getConnectedBrewLogs = () => {
    return state.brewLogs.filter(brewLog => brewLog.recipeId === id);
  };

  return (
    <div className="recipe-form">
      <div className="form-header">
        <h1>{isEditing ? 'Edit Recipe' : 'New Recipe'}</h1>
        <p>
          {isEditing 
            ? 'Update your recipe details' 
            : 'Create a new recipe for your brewing library'
          }
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card">
        {/* Basic Information */}
        <div className="form-section">
          <h3>Basic Information</h3>
          
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Recipe Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter recipe name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="dateCreated" className="form-label">
              Date Created *
            </label>
            <input
              type="date"
              id="dateCreated"
              name="dateCreated"
              className="form-input"
              value={formData.dateCreated}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="difficulty" className="form-label">
                Difficulty Level
              </label>
              <select
                id="difficulty"
                name="difficulty"
                className="form-select"
                value={formData.difficulty}
                onChange={handleChange}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="estimatedYield" className="form-label">
                Estimated Yield
              </label>
              <input
                type="text"
                id="estimatedYield"
                name="estimatedYield"
                className="form-input"
                value={formData.estimatedYield}
                onChange={handleChange}
                placeholder="e.g., 5 gallons, 1 gallon"
              />
            </div>

            <div className="form-group">
              <label htmlFor="estimatedABV" className="form-label">
                Estimated ABV (%)
              </label>
              <input
                type="number"
                step="0.1"
                id="estimatedABV"
                name="estimatedABV"
                className="form-input"
                value={formData.estimatedABV}
                onChange={handleChange}
                placeholder="12.5"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              className="form-textarea"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief description of this recipe"
              rows={3}
            />
          </div>
        </div>

        {/* Ingredients */}
        <div className="form-section">
          <div className="section-header">
            <h3>Ingredients</h3>
            <Button
              type="button"
              variant="outline"
              size="small"
              onClick={addIngredient}
            >
              <Plus size={16} />
              Add Ingredient
            </Button>
          </div>
          
          {formData.ingredients.length === 0 && (
            <p className="empty-message">No ingredients added yet. Click "Add Ingredient" to get started.</p>
          )}
          
          {formData.ingredients.map((ingredient) => (
            <div key={ingredient.id} className="ingredient-row">
              <div className="form-group">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ingredient name"
                  value={ingredient.name}
                  onChange={(e) => updateIngredient(ingredient.id, 'name', e.target.value)}
                />
              </div>
              <div className="form-group">
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  placeholder="Amount"
                  value={ingredient.amount}
                  onChange={(e) => updateIngredient(ingredient.id, 'amount', e.target.value)}
                />
              </div>
              <div className="form-group">
                <select
                  className="form-select"
                  value={ingredient.unit}
                  onChange={(e) => updateIngredient(ingredient.id, 'unit', e.target.value)}
                >
                  <option value="lbs">lbs</option>
                  <option value="oz">oz</option>
                  <option value="kg">kg</option>
                  <option value="g">g</option>
                  <option value="gal">gal</option>
                  <option value="L">L</option>
                  <option value="ml">ml</option>
                  <option value="cups">cups</option>
                  <option value="tsp">tsp</option>
                  <option value="tbsp">tbsp</option>
                  <option value="packets">packets</option>
                  <option value="pieces">pieces</option>
                </select>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="small"
                onClick={() => removeIngredient(ingredient.id)}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          ))}
        </div>

        {/* Notes */}
        <div className="form-section">
          <div className="form-group">
            <label htmlFor="notes" className="form-label">
              Notes & Instructions
            </label>
            <textarea
              id="notes"
              name="notes"
              className="form-textarea"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Detailed brewing instructions, notes, and tips for this recipe"
              rows={6}
            />
          </div>
        </div>

        {/* Connected Brew Logs (only show when editing) */}
        {isEditing && (
          <div className="form-section">
            <h3>Connected Brew Logs</h3>
            {getConnectedBrewLogs().length === 0 ? (
              <p className="empty-message">No brew logs are using this recipe yet.</p>
            ) : (
              <div className="connected-brews">
                {getConnectedBrewLogs().map((brewLog) => (
                  <div key={brewLog.id} className="connected-brew-item">
                    <div className="brew-info">
                      <h4>{brewLog.name}</h4>
                      <p>{brewLog.type} • Created {new Date(brewLog.dateCreated).toLocaleDateString()}</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="small"
                      onClick={() => navigate(`/brewlogs/${brewLog.id}`)}
                    >
                      View Brew Log
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="form-actions">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/recipes')}
          >
            <X size={16} />
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
          >
            <Save size={16} />
            {isEditing ? 'Update' : 'Create'} Recipe
          </Button>
        </div>
      </form>

    </div>
  );
}

export default RecipeForm;

