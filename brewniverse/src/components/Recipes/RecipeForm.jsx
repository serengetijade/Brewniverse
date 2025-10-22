import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ActionTypes, getDate, useApp } from '../../contexts/AppContext';
import Button from '../UI/Button';
import FormHeader from '../Layout/FormHeader';
import FormFooter from '../Layout/FormFooter';
import IngredientList from '../Ingredients/IngredientList';
import InstructionForm from '../Instructions/InstructionForm';
import '../../Styles/RecipeForm.css';
import BrewTypes from '../../constants/BrewTypes';

function RecipeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    dateCreated: getDate(),
    ingredientsPrimary: [],
    ingredientsSecondary: [],
    instructions: [''],
    description: '',
    notes: '',
    estimatedABV: '',
    difficulty: 'Beginner',
    type: 'Mead',
    volume: '',
  });

  useEffect(() => {
    if (isEditing) {
      const recipe = state.recipes.find(r => r.id === id);
      if (recipe) {
        setFormData({
          ...recipe,
          id: recipe.id,
          instructions: recipe.instructions && recipe.instructions.length > 0 ? recipe.instructions : ['']
        });
      }
    }
  }, [id, isEditing, state.recipes]);

    const onDelete = (e) => {
        e.preventDefault();

        const brewLogs = state.brewLogs.filter(b => b.recipeId === id);
        if (brewLogs.length > 0) {
            // Delete from connected brew logs
            brewLogs.forEach(brewLog => {
                dispatch({
                    type: ActionTypes.UPDATE_BREW_LOG,
                    payload: { ...brewLog, recipeId: '' }
                });
            });
        }
        else {
            if (!window.confirm('Are you sure you want to delete this recipe?')) return;
        }

        dispatch({ type: ActionTypes.DELETE_RECIPE, payload: id });
        navigate('/recipes');
    }

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const recipeData = {
      ...formData,
      dateCreated: getDate(),
    };

    if (isEditing) {
      dispatch({
        type: ActionTypes.UPDATE_RECIPE,
        payload: { ...recipeData, id }
      });
    }
    else {
      dispatch({
        type: ActionTypes.ADD_RECIPE,
        payload: recipeData
      });
    }

    navigate('/recipes');
  };

  const updateFormData = (updates) => {
    const updatedData = { ...formData, ...updates };
    setFormData(updatedData);
    
    if (isEditing) {
      dispatch({
        type: ActionTypes.UPDATE_RECIPE,
        payload: { ...updatedData, id }
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
  };

  const handleInstructionsChange = (instructions) => {
    updateFormData({ instructions });
  };

  const getConnectedBrewLogs = () => {
    return state.brewLogs.filter(brewLog => brewLog.recipeId === id);
  };

  return (
    <div className="form-container form-with-footer">
      <FormHeader 
        isEditing={isEditing} 
        entityName="Recipe" 
      />

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
              type="datetime-local"
              id="dateCreated"
              name="dateCreated"
              className="form-input"
              value={formData.dateCreated}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="type" className="form-label">
              Type *
            </label>
            <select
              id="type"
              name="type"
              className="form-select"
              value={formData.type}
              onChange={handleChange}
              required
             >
            {BrewTypes.map((type) => (
                <option key={type.name} value={type.name}>
                    {type.icon} {type.name}
                </option>
            ))}
            </select>
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
              <label htmlFor="volume" className="form-label">
                Estimated Yield
              </label>
              <input
                type="text"
                id="volume"
                name="volume"
                className="form-input"
                value={formData.volume}
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

        {/* Primary Ingredients */}
        <div className="form-section">
            <IngredientList
                formData={formData}
                setFormData={setFormData}
                ingredientType="ingredientsPrimary"
                sectionName="Primary Ingredients"
                sectionDescription=""
                sectionInfoMessage="List ingredients used during primary fermentation. No primary ingredients added yet."
            >
            </IngredientList>
        </div>

        {/* Secondary Ingredients */}
        <div className="form-section">
            <IngredientList
                formData={formData}
                setFormData={setFormData}
                ingredientType="ingredientsSecondary"
                sectionName="Secondary Ingredients"
                sectionDescription=""
                sectionInfoMessage="List ingredients used during secondary fermentation or any used to backsweeten your brew. No secondary ingredients added yet."
            >
            </IngredientList>
        </div>

        {/* Instructions */}
        <div className="form-section">
          <InstructionForm
            instructions={formData.instructions}
            onInstructionsChange={handleInstructionsChange}
          />
        </div>

        {/* Notes */}
        <div className="form-section">
          <div className="form-group">
            <label htmlFor="notes" className="form-label">
              Notes & Tips
            </label>
            <textarea
              id="notes"
              name="notes"
              className="form-textarea"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Additional notes, tips, and observations for this recipe"
              rows={4}
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
      </form>

      <FormFooter 
        isEditing={isEditing}
        entityName="Recipe"
        onCancel={() => navigate('/recipes')}
        showCancel={false}
        showDelete={true}
        onDelete={onDelete}
      />
    </div>
  );
}

export default RecipeForm;

