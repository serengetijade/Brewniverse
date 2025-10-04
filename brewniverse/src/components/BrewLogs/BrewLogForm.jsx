import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, X, Plus, Trash2 } from 'lucide-react';
import { useApp, ActionTypes } from '../../contexts/AppContext';
import Button from '../UI/Button';
import './BrewLogForm.css';

function BrewLogForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const isEditing = Boolean(id);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const initialFormData = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'Beer',
    description: '',
    dateCreated: new Date().toISOString().split('T')[0],
    ingredientsPrimary: [],
    adjuncts: [],
    pecticEnzyme: '',
    yeast: '',
    nutrients: '',
    nutrientSchedule: [],
    alerts: [],
    ingredientsSecondary: [],
    gravity: {
      original: '',
      final: '',
      estimated: ''
    },
    gravityFinal: '',
    gravity13Break: '',
    estimatedABV: '',
    finalABV: '',
    notes: '',
    acids: '',
    bases: '',
    dateBottled: '',
    dateRacked: '',
    recipeId: ''
  });

  useEffect(() => {
    if (isEditing) {
      const brewLog = state.brewLogs.find(log => log.id === id);
      if (brewLog) {
        const loadedData = {
          ...brewLog,
          dateCreated: brewLog.dateCreated.split('T')[0]
        };
        setFormData(loadedData);
        initialFormData.current = JSON.stringify(loadedData);
      }
    } else {
      initialFormData.current = JSON.stringify(formData);
    }
  }, [id, isEditing, state.brewLogs]);

  // Track form changes
  useEffect(() => {
    if (initialFormData.current) {
      const currentData = JSON.stringify(formData);
      setHasUnsavedChanges(currentData !== initialFormData.current);
    }
  }, [formData]);

  // Handle browser navigation/refresh
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const brewLogData = {
      ...formData,
      dateCreated: new Date(formData.dateCreated).toISOString(),
    };

    if (isEditing) {
      dispatch({
        type: ActionTypes.UPDATE_BREW_LOG,
        payload: { ...brewLogData, id }
      });
    } else {
      dispatch({
        type: ActionTypes.ADD_BREW_LOG,
        payload: brewLogData
      });
    }

    setHasUnsavedChanges(false);
    navigate('/brewlogs');
  };

  const handleNavigation = (path) => {
    if (hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave without saving?')) {
        setHasUnsavedChanges(false);
        navigate(path);
      }
    } else {
      navigate(path);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('gravity.')) {
      const gravityField = name.split('.')[1];
      const newGravity = {
        ...formData.gravity,
        [gravityField]: value
      };
      
      // Auto-calculate 1/3 Break Gravity when original gravity is entered
      if (gravityField === 'original' && value) {
        const originalGravity = parseFloat(value);
        if (originalGravity > 1) {
          const gravity13Break = ((originalGravity - 1) * 2/3) + 1;
          newGravity.final = gravity13Break.toFixed(3);
          
          // Update the gravity13Break field as well
          setFormData(prev => ({
            ...prev,
            gravity: newGravity,
            gravity13Break: gravity13Break.toFixed(3),
            estimatedABV: ((originalGravity - 1) * 131.25).toFixed(1)
          }));
          return;
        }
      }
      
      setFormData(prev => ({
        ...prev,
        gravity: newGravity
      }));
    } else if (name === 'gravity13Break' && value) {
      // Auto-calculate when 1/3 break gravity is manually entered
      const gravity13Break = parseFloat(value);
      if (gravity13Break > 1) {
        const originalGravity = parseFloat(formData.gravity.original);
        if (originalGravity > 1) {
          const estimatedABV = ((originalGravity - 1) * 131.25).toFixed(1);
          setFormData(prev => ({
            ...prev,
            [name]: value,
            estimatedABV: estimatedABV
          }));
          return;
        }
      }
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    } else if (name === 'gravityFinal' && value) {
      // Auto-calculate Final ABV when final gravity is entered
      const gravityFinal = parseFloat(value);
      const originalGravity = parseFloat(formData.gravity.original);
      if (gravityFinal > 0 && originalGravity > 1) {
        const finalABV = ((originalGravity - gravityFinal) * 131.25).toFixed(1);
        setFormData(prev => ({
          ...prev,
          [name]: value,
          finalABV: finalABV
        }));
        return;
      }
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const addIngredient = (type) => {
    const newIngredient = {
      id: Date.now().toString(),
      name: '',
      amount: '',
      unit: 'lbs'
    };
    setFormData(prev => ({
      ...prev,
      [type]: [...prev[type], newIngredient]
    }));
    // Immediately open the editor for the new ingredient
    setEditingIngredient({ type, id: newIngredient.id });
  };

  const updateIngredient = (type, id, field, value) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].map(ingredient =>
        ingredient.id === id ? { ...ingredient, [field]: value } : ingredient
      )
    }));
  };

  const removeIngredient = (type, id) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter(ingredient => ingredient.id !== id)
    }));
  };

  const [editingIngredient, setEditingIngredient] = useState(null);

  const editIngredient = (type, id) => {
    setEditingIngredient({ type, id });
  };

  const cancelEditIngredient = () => {
    // If canceling an ingredient that has no data, remove it
    if (editingIngredient) {
      const { type, id } = editingIngredient;
      const ingredient = formData[type].find(ing => ing.id === id);
      if (ingredient && !ingredient.name && !ingredient.amount) {
        // Remove empty ingredient
        setFormData(prev => ({
          ...prev,
          [type]: prev[type].filter(ing => ing.id !== id)
        }));
      }
    }
    setEditingIngredient(null);
  };

  const saveEditIngredient = (type, id, updatedIngredient) => {
    // Validate that at least name is provided
    if (!updatedIngredient.name.trim()) {
      alert('Please enter an ingredient name.');
      return;
    }
    
    updateIngredient(type, id, 'name', updatedIngredient.name);
    updateIngredient(type, id, 'amount', updatedIngredient.amount);
    updateIngredient(type, id, 'unit', updatedIngredient.unit);
    setEditingIngredient(null);
  };

  // Ingredient Editor Component
  const IngredientEditor = ({ ingredient, type, onSave, onCancel }) => {
    const [editData, setEditData] = useState({
      name: ingredient.name,
      amount: ingredient.amount,
      unit: ingredient.unit
    });
    const nameInputRef = useRef(null);

    // Focus on name input when editor opens
    useEffect(() => {
      if (nameInputRef.current) {
        nameInputRef.current.focus();
      }
    }, []);

    const handleSave = () => {
      onSave(type, ingredient.id, editData);
    };

    const handleKeyPress = (e) => {
      if (e.key === 'Enter') {
        handleSave();
      } else if (e.key === 'Escape') {
        onCancel();
      }
    };

    return (
      <div className="ingredient-editor">
        <div className="form-group">
          <input
            ref={nameInputRef}
            type="text"
            className="form-input"
            placeholder="Ingredient name"
            value={editData.name}
            onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
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
  };

  const addNutrientScheduleEntry = () => {
    const newEntry = {
      id: Date.now().toString(),
      date: '',
      description: '',
      completed: false
    };
    setFormData(prev => ({
      ...prev,
      nutrientSchedule: [...prev.nutrientSchedule, newEntry]
    }));
  };

  const updateNutrientScheduleEntry = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      nutrientSchedule: prev.nutrientSchedule.map(entry =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    }));
  };

  const removeNutrientScheduleEntry = (id) => {
    setFormData(prev => ({
      ...prev,
      nutrientSchedule: prev.nutrientSchedule.filter(entry => entry.id !== id)
    }));
  };

  const addScheduleEntries = (scheduleType) => {
    const today = new Date();
    let entries = [];

    switch (scheduleType) {
      case 'split':
        entries = [{
          id: Date.now().toString(),
          date: today.toISOString().split('T')[0],
          description: 'Half now & half at 1/3 Break',
          completed: false
        }];
        break;
      
      case 'staggered2':
      case 'staggered3':
        const days = scheduleType === 'staggered2' ? 2 : 3;
        // Add initial entry for today
        entries = [{
            id: Date.now().toString(),
            date: today.toISOString().split('T')[0],
            description: 'Staggered nutrient - initial addition',
            completed: false
        }];
        // Add future entries
        const futureEntries = Array.from({ length: days }, (_, index) => {
          const futureDate = new Date(today);
          futureDate.setDate(today.getDate() + index + 1);
          return {
            id: (Date.now() + index + 1).toString(),
            date: futureDate.toISOString().split('T')[0],
            description: `Staggered nutrient - ${(index + 1) * 24} hours later`,
            completed: false
          };
        });
        entries = [...entries, ...futureEntries];
        break;
    }

    setFormData(prev => ({
      ...prev,
      nutrientSchedule: [...prev.nutrientSchedule, ...entries]
    }));
  };

  const addSplitSchedule = () => addScheduleEntries('split');
  const addStaggered2Schedule = () => addScheduleEntries('staggered2');
  const addStaggered3Schedule = () => addScheduleEntries('staggered3');

  return (
    <div className="brewlog-form">
      <div className="form-header">
        <h1>
          {isEditing ? 'Edit Brew Log' : 'New Brew Log'}
          {hasUnsavedChanges && <span className="unsaved-indicator"> *</span>}
        </h1>
        <p>
          {isEditing 
            ? 'Update your brew log details' 
            : 'Create a new brew log to track your batch'
          }
          {hasUnsavedChanges && <span className="unsaved-text"> (You have unsaved changes)</span>}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card">
        {/* Basic Information */}
        <div className="form-section">
          <h3>Basic Information</h3>
          
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Brew Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter brew name"
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
              <option value="Beer">Beer</option>
              <option value="Wine">Wine</option>
              <option value="Mead">Mead</option>
              <option value="Kombucha">Kombucha</option>
            </select>
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

          <div className="form-group">
            <label htmlFor="recipeId" className="form-label">
              Recipe
            </label>
            <select
              id="recipeId"
              name="recipeId"
              className="form-select"
              value={formData.recipeId}
              onChange={handleChange}
            >
              <option value="">Select a recipe (optional)</option>
              {state.recipes.map(recipe => (
                <option key={recipe.id} value={recipe.id}>
                  {recipe.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Adjuncts */}
        <div className="form-section">
          <div className="section-header">
            <h3>Adjuncts <span className="section-description">(fermentable sugars, honey etc.)</span></h3>
            <Button
              type="button"
              variant="outline"
              size="small"
              onClick={() => addIngredient('adjuncts')}
            >
              <Plus size={16} />
              Add Adjunct
            </Button>
          </div>
          
          {formData.adjuncts.length === 0 ? (
            <p className="empty-message">No adjuncts added yet.</p>
          ) : (
            <div className="ingredients-list">
              {formData.adjuncts.map((ingredient) => (
                <div key={ingredient.id} className="ingredient-item">
                  {editingIngredient && editingIngredient.type === 'adjuncts' && editingIngredient.id === ingredient.id ? (
                    <IngredientEditor
                      ingredient={ingredient}
                      type="adjuncts"
                      onSave={saveEditIngredient}
                      onCancel={cancelEditIngredient}
                    />
                  ) : (
                    <>
                      <div className="ingredient-display">
                        {ingredient.name && ingredient.amount && ingredient.unit 
                          ? `${ingredient.name} - ${ingredient.amount} ${ingredient.unit}`
                          : 'Incomplete adjunct'
                        }
                      </div>
                      <div className="ingredient-actions">
                        <Button
                          type="button"
                          variant="ghost"
                          size="small"
                          onClick={() => editIngredient('adjuncts', ingredient.id)}
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="small"
                          onClick={() => removeIngredient('adjuncts', ingredient.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
              </div>

        {/* Primary Ingredients */}
        <div className="form-section">
          <div className="section-header">
            <h3>Primary Ingredients</h3>
            <Button
              type="button"
              variant="outline"
              size="small"
              onClick={() => addIngredient('ingredientsPrimary')}
            >
              <Plus size={16} />
              Add Ingredient
            </Button>
          </div>
          
          {formData.ingredientsPrimary.length === 0 ? (
            <p className="empty-message">No primary ingredients added yet.</p>
          ) : (
            <div className="ingredients-list">
              {formData.ingredientsPrimary.map((ingredient) => (
                <div key={ingredient.id} className="ingredient-item">
                  {editingIngredient && editingIngredient.type === 'ingredientsPrimary' && editingIngredient.id === ingredient.id ? (
                    <IngredientEditor
                      ingredient={ingredient}
                      type="ingredientsPrimary"
                      onSave={saveEditIngredient}
                      onCancel={cancelEditIngredient}
                    />
                  ) : (
                    <>
                      <div className="ingredient-display">
                        {ingredient.name && ingredient.amount && ingredient.unit 
                          ? `${ingredient.name} - ${ingredient.amount} ${ingredient.unit}`
                          : 'Incomplete ingredient'
                        }
                      </div>
                      <div className="ingredient-actions">
                        <Button
                          type="button"
                          variant="ghost"
                          size="small"
                          onClick={() => editIngredient('ingredientsPrimary', ingredient.id)}
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="small"
                          onClick={() => removeIngredient('ingredientsPrimary', ingredient.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Secondary Ingredients */}
        <div className="form-section">
          <div className="section-header">
            <h3>Secondary Ingredients</h3>
            <Button
              type="button"
              variant="outline"
              size="small"
              onClick={() => addIngredient('ingredientsSecondary')}
            >
              <Plus size={16} />
              Add Ingredient
            </Button>
          </div>
          
          {formData.ingredientsSecondary.length === 0 ? (
            <p className="empty-message">No secondary ingredients added yet.</p>
          ) : (
            <div className="ingredients-list">
              {formData.ingredientsSecondary.map((ingredient) => (
                <div key={ingredient.id} className="ingredient-item">
                  {editingIngredient && editingIngredient.type === 'ingredientsSecondary' && editingIngredient.id === ingredient.id ? (
                    <IngredientEditor
                      ingredient={ingredient}
                      type="ingredientsSecondary"
                      onSave={saveEditIngredient}
                      onCancel={cancelEditIngredient}
                    />
                  ) : (
                    <>
                      <div className="ingredient-display">
                        {ingredient.name && ingredient.amount && ingredient.unit 
                          ? `${ingredient.name} - ${ingredient.amount} ${ingredient.unit}`
                          : 'Incomplete ingredient'
                        }
                      </div>
                      <div className="ingredient-actions">
                        <Button
                          type="button"
                          variant="ghost"
                          size="small"
                          onClick={() => editIngredient('ingredientsSecondary', ingredient.id)}
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="small"
                          onClick={() => removeIngredient('ingredientsSecondary', ingredient.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Yeast */}
        <div className="form-section">
          <h3>Yeast</h3>
          
          <div className="form-group">
            <label htmlFor="yeast" className="form-label">
              Yeast Strain and Details
            </label>
            <input
              type="text"
              id="yeast"
              name="yeast"
              className="form-input"
              value={formData.yeast}
              onChange={handleChange}
              placeholder="Yeast strain and details"
            />
          </div>
        </div>

        {/* Nutrients */}
        <div className="form-section">
          <h3>Nutrients</h3>
          
          <div className="form-group">
            <label htmlFor="nutrients" className="form-label">
              Nutrient Details
            </label>
            <input
              type="text"
              id="nutrients"
              name="nutrients"
              className="form-input"
              value={formData.nutrients}
              onChange={handleChange}
              placeholder="Nutrient details"
            />
          </div>
        </div>

        {/* Nutrient Schedule */}
        <div className="form-section">
          <div className="section-header">
            <h3>Nutrient Schedule</h3>
            <div className="nutrient-schedule-buttons">
              <Button
                type="button"
                variant="outline"
                size="small"
                onClick={addSplitSchedule}
              >
                Split Schedule
              </Button>
              <Button
                type="button"
                variant="outline"
                size="small"
                onClick={addStaggered2Schedule}
              >
                Staggered +2
              </Button>
              <Button
                type="button"
                variant="outline"
                size="small"
                onClick={addStaggered3Schedule}
              >
                Staggered +3
              </Button>
              <Button
                type="button"
                variant="outline"
                size="small"
                onClick={addNutrientScheduleEntry}
              >
                <Plus size={16} />
                Add Entry
              </Button>
            </div>
          </div>
          
          {formData.nutrientSchedule.map((entry) => (
            <div key={entry.id} className="nutrient-schedule-entry">
              <div className="form-group">
                <input
                  type="date"
                  className="form-input"
                  value={entry.date}
                  onChange={(e) => updateNutrientScheduleEntry(entry.id, 'date', e.target.value)}
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Nutrient description"
                  value={entry.description}
                  onChange={(e) => updateNutrientScheduleEntry(entry.id, 'description', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={entry.completed}
                    onChange={(e) => updateNutrientScheduleEntry(entry.id, 'completed', e.target.checked)}
                  />
                  Completed
                </label>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="small"
                onClick={() => removeNutrientScheduleEntry(entry.id)}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          ))}
        </div>

        {/* Pectic Enzyme */}
        <div className="form-section">
          <h3>Pectic Enzyme</h3>
          
          <div className="form-group">
            <label htmlFor="pecticEnzyme" className="form-label">
              Pectic Enzyme Details
            </label>
            <input
              type="text"
              id="pecticEnzyme"
              name="pecticEnzyme"
              className="form-input"
              value={formData.pecticEnzyme}
              onChange={handleChange}
              placeholder="Pectic enzyme details"
            />
          </div>
        </div>

        {/* Gravity Readings */}
        <div className="form-section">
          <h3>Gravity Readings</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="gravity.original" className="form-label">
                Original Gravity
              </label>
              <input
                type="number"
                step="0.001"
                id="gravity.original"
                name="gravity.original"
                className="form-input"
                value={formData.gravity.original}
                onChange={handleChange}
                placeholder="1.050"
              />
            </div>

            <div className="form-group">
              <label htmlFor="gravity13Break" className="form-label">
                1/3 Break Gravity (auto-calculated)
              </label>
              <input
                type="number"
                step="0.001"
                id="gravity13Break"
                name="gravity13Break"
                className="form-input calculated-field"
                value={formData.gravity13Break}
                readOnly
                placeholder="1.030"
                title="This field is automatically calculated from Original Gravity"
              />
            </div>

            <div className="form-group">
              <label htmlFor="gravityFinal" className="form-label">
                Final Gravity
              </label>
              <input
                type="number"
                step="0.001"
                id="gravityFinal"
                name="gravityFinal"
                className="form-input"
                value={formData.gravityFinal}
                onChange={handleChange}
                placeholder="1.000"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="estimatedABV" className="form-label">
                Estimated ABV (auto-calculated)
              </label>
              <div className="input-with-suffix">
                <input
                  type="number"
                  step="0.1"
                  id="estimatedABV"
                  name="estimatedABV"
                  className="form-input calculated-field"
                  value={formData.estimatedABV}
                  readOnly
                  placeholder="12.5"
                  title="This field is automatically calculated from Original Gravity"
                />
                <span className="input-suffix">%</span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="finalABV" className="form-label">
                Final ABV (auto-calculated)
              </label>
              <div className="input-with-suffix">
                <input
                  type="number"
                  step="0.1"
                  id="finalABV"
                  name="finalABV"
                  className="form-input calculated-field"
                  value={formData.finalABV}
                  readOnly
                  placeholder="12.5"
                  title="This field is automatically calculated from Original and Final Gravity"
                />
                <span className="input-suffix">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Acids and Bases */}
        <div className="form-section">
          <h3>Acids and Bases</h3>
          
          <div className="form-group">
            <label htmlFor="acids" className="form-label">
              Acids
            </label>
            <textarea
              id="acids"
              name="acids"
              className="form-textarea"
              value={formData.acids}
              onChange={handleChange}
              placeholder="Acid additions and details"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="bases" className="form-label">
              Bases
            </label>
            <textarea
              id="bases"
              name="bases"
              className="form-textarea"
              value={formData.bases}
              onChange={handleChange}
              placeholder="Base additions and details"
              rows={3}
            />
          </div>
        </div>

        {/* Important Dates */}
        <div className="form-section">
          <h3>Important Dates</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dateRacked" className="form-label">
                Date Racked
              </label>
              <input
                type="date"
                id="dateRacked"
                name="dateRacked"
                className="form-input"
                value={formData.dateRacked}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="dateBottled" className="form-label">
                Date Bottled
              </label>
              <input
                type="date"
                id="dateBottled"
                name="dateBottled"
                className="form-input"
                value={formData.dateBottled}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>


        {/* Notes */}
        <div className="form-section">
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
              placeholder="Brief description of your brew"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="notes" className="form-label">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              className="form-textarea"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Additional notes about this brew"
              rows={4}
            />
          </div>          
        </div>

        <div className="form-actions">
          <Button
            type="button"
            variant="ghost"
            onClick={() => handleNavigation('/brewlogs')}
          >
            <X size={16} />
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
          >
            <Save size={16} />
            {isEditing ? 'Update' : 'Create'} Brew Log
          </Button>
        </div>
      </form>

    </div>
  );
}

export default BrewLogForm;

