import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, X, Plus, Trash2 } from 'lucide-react';
import { useApp, ActionTypes } from '../../contexts/AppContext';
import Button from '../UI/Button';
import IngredientList from '../UI/IngredientList';
import Activity from '../UI/Activity'; 
import '../../Styles/BrewLogForm.css';

function BrewLogForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const isEditing = Boolean(id);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const initialFormData = useRef(null);
  let buttonSize = 14;

  const [formData, setFormData] = useState({
    acids: '',
    activity: [],
    adjuncts: [],
    bases: '',
    dateBottled: '',
    dateCreated: new Date().toISOString().split('T')[0],
    dateStabilized: new Date().toISOString().split('T')[0],
    description: '',
    ingredientsAdjunct: [],
    ingredientsPrimary: [],
    ingredientsSecondary: [],
    estimatedABV: '',
    finalABV: '',
    gravity13Break: '',
    name: '',
    notes: '',
    nutrients: '',
    pecticEnzyme: '', 
    recipeId: '',
    stabilize: '',
    tannins: '',
    type: 'Mead',
    volume: '',
    yeast: '' 
  });
  const [showEventsTimeline, setShowEventsTimeline] = useState(false);

  useEffect(() => {
    if (isEditing) {
      const brewLog = state.brewLogs.find(log => log.id === id);
      if (brewLog) {
        const loadedData = {
          ...brewLog,
          dateCreated: brewLog.dateCreated.split('T')[0],
          activity: brewLog.activity || [] // Ensure events array exists
        };
        
        // If no activity(s) exist, create from existing data
        if (!brewLog.activity || brewLog.activity.length === 0) {
          const generatedActivities = [];
          
          // Create DateCreated activity
          generatedActivities.push(createEvent(
            'DateCreated',
            'Date Created',
            'New brew started',
            loadedData.dateCreated,
            false,
            false
          ));
          
          // Create activity(s) from nutrientSchedule
          if (loadedData.nutrientSchedule && loadedData.nutrientSchedule.length > 0) {
            loadedData.nutrientSchedule.forEach(entry => {
              generatedActivities.push(createEvent(
                'Nutrient',
                'Nutrients Added',
                entry.description,
                entry.date,
                entry.completed,
                false
              ));
            });
          }
          
          loadedData.events = generatedActivities;
        }
        
        setFormData(loadedData);
        initialFormData.current = JSON.stringify(loadedData);
      }
    } else {
      // For new brew logs, create initial DateCreated event
      const initialData = {
        ...formData,
        activity: [createEvent(
          'DateCreated',
          'Date Created',
          'New brew started',
          formData.dateCreated,
          false,
          false
        )]
      };
      setFormData(initialData);
      initialFormData.current = JSON.stringify(initialData);
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
    
    if (name === 'dateRacked') {
      handleDateRackedChange(value);
      return;
    }
    else if (name.startsWith('gravity.')) {
      const gravityField = name.split('.')[1];
      handleGravityChange(gravityField, value);
      
      // Auto-calculate 1/3 Break Gravity when original gravity is entered
      if (gravityField === 'original' && value) {
        const originalGravity = parseFloat(value);
        if (originalGravity > 1) {
          const gravity13Break = ((originalGravity - 1) * 2/3) + 1;
          setFormData(prev => ({
            ...prev,
            gravity13Break: gravity13Break.toFixed(3),
            estimatedABV: ((originalGravity - 1) * 131.25).toFixed(1)
          }));
        }
      }
      return;
    }
    else if (name === 'gravityFinal' && value) {
      handleGravityChange('final', value);
      
      // Auto-calculate Final ABV when final gravity is entered
      const gravityFinal = parseFloat(value);
      const originalGravity = parseFloat(getGravityOriginal());
      if (gravityFinal > 0 && originalGravity > 1) {
        const finalABV = ((originalGravity - gravityFinal) * 131.25).toFixed(1);
        setFormData(prev => ({
          ...prev,
          finalABV: finalABV
        }));
      }
      return;
    }
    else if (name === 'dateCreated') {
      setFormData(prev => {
        const newFormData = {
          ...prev,
          dateCreated: value
        };
        
        const existingEventIndex = prev.activity.findIndex(event => event.type === 'DateCreated');
        const dateCreatedEvent = createEvent(
          'DateCreated',
          'Date Created',
          'New brew started',
          value,
          false,
          false
        );

        if (existingEventIndex >= 0) {
          newFormData.activity = prev.activity.map((event, index) =>
            index === existingEventIndex ? { ...event, date: value } : event
          );
        } else {
          newFormData.activity = [...prev.activity, dateCreatedEvent];
        }

        return newFormData;
      });
      return;
    }
    else if (name === 'dateBottled') {
      setFormData(prev => {
        const newFormData = {
          ...prev,
          dateBottled: value
        };
        
        const existingEventIndex = prev.activity.findIndex(event => event.type === 'DateBottled');
        const dateBottledEvent = createEvent(
          'DateBottled',
          'Brew Bottled',
          'Brew bottled and ready for aging',
          value,
          false,
          false
        );

        if (value) {
          if (existingEventIndex >= 0) {
            newFormData.activity = prev.activity.map((event, index) =>
              index === existingEventIndex ? { ...event, date: value } : event
            );
          } else {
            newFormData.activity = [...prev.activity, dateBottledEvent];
          }
        } else {
          // Remove event if date is cleared
          newFormData.activity = prev.activity.filter(event => event.type !== 'DateBottled');
        }

        return newFormData;
      });
      return;
    }
    else if (name === 'stabilize' || name === 'stabilizeDate') {
      // Handle stabilize field and create/update event
      setFormData(prev => {
        const newFormData = {
          ...prev,
          [name]: value
        };

        // Create/update Stabilize event when either field changes
        const stabilizeText = name === 'stabilize' ? value : prev.stabilize;
        const stabilizeDate = name === 'stabilizeDate' ? value : prev.dateStabilized;
        
        if (stabilizeText.trim()) {
          const existingEventIndex = prev.activity.findIndex(event => event.type === 'Stabilize');
          const stabilizeEvent = createEvent(
            'Stabilize',
            'Stabilization',
            stabilizeText,
            stabilizeDate,
            false,
            false
          );

          if (existingEventIndex >= 0) {
            newFormData.activity = prev.activity.map((event, index) =>
              index === existingEventIndex ? { ...event, description: stabilizeText, date: stabilizeDate } : event
            );
          } else {
            newFormData.activity = [...prev.activity, stabilizeEvent];
          }
        } else {
          // Remove event if stabilize text is empty
          newFormData.activity = prev.activity.filter(event => event.type !== 'Stabilize');
        }

        return newFormData;
      });
      return;
    }
    else {
      // Handle all other regular fields: recipe, name, volume, nutrients, recipeId
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Nutrients
  const addNutrientScheduleEntry = () => {
    // Create event directly
    const nutrientEvent = createEvent(
      'Nutrient',
      'Nutrients Added',
      '',
      new Date().toISOString().split('T')[0],
      false,
      false
    );
    addEvent(nutrientEvent);
  };

  const updateNutrientScheduleEntry = (id, field, value) => {
    // Update the event directly
    const updates = {};
    if (field === 'date') updates.date = value;
    if (field === 'description') updates.description = value;
    if (field === 'completed') updates.completed = value;
    
    updateEvent(id, updates);
  };

  const removeNutrientScheduleEntry = (id) => {
    // Remove the event directly
    removeEvent(id);
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
            description: 'Staggered nutrient - yeast added',
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

    // Create activity directly (no more nutrientSchedule array)
    const nutrientActivity = entries.map(entry => 
      createEvent(
        'Nutrient',
        'Nutrients Added',
        entry.description,
        entry.date,
        entry.completed,
        false
      )
    );

    setFormData(prev => ({
      ...prev,
      activity: [...prev.activity, ...nutrientActivity]
    }));
  };

  const addSplitSchedule = () => addScheduleEntries('split');
  const addStaggered2Schedule = () => addScheduleEntries('staggered2');
  const addStaggered3Schedule = () => addScheduleEntries('staggered3');
  
  const getNutrientSchedule = () => {
    return getEventsByType('Nutrient').map(event => ({
      id: event.id,
      date: event.date,
      description: event.description,
      completed: event.completed
    }));
    };

  // Event management functions
  const createEvent = (type, name, description, date, completed = false, hasAlert = false) => {
    return {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      name,
      description,
      date,
      completed,
      hasAlert,
      type
    };
  };

  const addEvent = (event) => {
    setFormData(prev => ({
      ...prev,
      activity: [...prev.activity, event]
    }));
  };

  const updateEvent = (eventId, updates) => {
    setFormData(prev => ({
      ...prev,
      activity: prev.activity.map(event =>
        event.id === eventId ? { ...event, ...updates } : event
      )
    }));
  };

  const removeEvent = (eventId) => {
    setFormData(prev => ({
      ...prev,
      activity: prev.activity.filter(event => event.id !== eventId)
    }));
  };

  const getEventsByType = (type) => {
    return formData.activity.filter(event => event.type === type);
  };

  const updateEventField = (eventType, name, description, date = new Date().toISOString().split('T')[0]) => {
    const existingEvent = formData.activity.find(event => event.type === eventType);
    
    if (existingEvent) {
      updateEvent(existingEvent.id, { name, description, date });
    } else {
      const newEvent = createEvent(eventType, name, description, date, false, false);
      addEvent(newEvent);
    }
  };
  // Helper functions to derive UI data from events
  const formatDate = (dateString) => {
    if (!dateString) return '';
    // Parse YYYY-MM-DD format without timezone conversion
    const [year, month, day] = dateString.split('-');
    const date = new Date(year, month - 1, day); // month is 0-indexed
    return date.toLocaleDateString();
  };
  
  const getDateRacked = () => {
    const rackedEvent = formData.activity.find(event => event.type === 'DateRacked');
    return rackedEvent ? rackedEvent.date : '';
  };

  const getGravityOriginal = () => {
    const gravityEvent = formData.activity.find(event => event.type === 'Gravity');
    return gravityEvent ? gravityEvent.description : '';
  };

  const getGravityFinal = () => {
    const gravityFinalEvent = formData.activity.find(event => event.type === 'GravityFinal');
    return gravityFinalEvent ? gravityFinalEvent.description : '';
  };

  const handleDateRackedChange = (value) => {
    if (value) {
      updateEventField('DateRacked', 'Brew Racked', 'Brew transferred to secondary', value);
    } else {
      // Remove event if date is cleared
      const rackedEvent = formData.activity.find(event => event.type === 'DateRacked');
      if (rackedEvent) {
        removeEvent(rackedEvent.id);
      }
    }
  };

  const handleGravityChange = (field, value) => {
    if (field === 'original') {
      updateEventField('Gravity', 'Original Gravity Reading', value);
    } else if (field === 'final') {
      updateEventField('GravityFinal', 'Final Gravity Reading', value);
    }
  };

  // Recipe functions
  const goToRecipe = () => {
    if (!formData.recipeId) {
      alert('Please select a recipe first.');
      return;
    }
    handleNavigation(`/recipes/${formData.recipeId}`);
  };

  const importIngredientsFromRecipe = () => {
    if (!formData.recipeId) {
      alert('Please select a recipe to import ingredients from.');
      return;
    }

    const recipe = state.recipes.find(r => r.id === formData.recipeId);
    if (!recipe) {
      alert('Selected recipe not found.');
      return;
    }

    const copyWithNewIds = (items = []) => {
      return items.map(item => ({
        id: Date.now().toString() + Math.random().toString(36).substring(2, 6), //Create unique ids to avoid collisions
        name: item.name || '',
        amount: item.amount || '',
        unit: item.unit || 'oz'
        //type: item.type || 'primary'
      }));
    };

    const adjuncts = copyWithNewIds(recipe.ingredientsAdjunct);
    const primary = copyWithNewIds(recipe.ingredientsPrimary);
    const secondary = copyWithNewIds(recipe.ingredientsSecondary);

    setFormData(prev => ({
      ...prev,
      ingredientsAdjunct: [...prev.ingredientsAdjunct, ...adjuncts],
      ingredientsPrimary: [...prev.ingredientsPrimary, ...primary],
      ingredientsSecondary: [...prev.ingredientsSecondary, ...secondary]
    }));
  };

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
            <label htmlFor="name" className="form-label">
              Volume
            </label>
            <input
              type="text"
              id="name"
              name="volume"
              className="form-input"
              value={formData.volume}
              onChange={handleChange}
              placeholder="e.g., 5 gallons, 1 gallon"
            />
          </div>

          <div className="form-group">
            <label htmlFor="recipeId" className="form-label">
              Recipe
            </label>
            <div className="form-group">
              <select
                id="recipeId"
                name="recipeId"
                className="form-select"
                value={formData.recipeId}
                onChange={handleChange}
                style={{ flex: 1 }}
              >
                <option value="">Select a recipe (optional)</option>
                {state.recipes.map(recipe => (
                  <option key={recipe.id} value={recipe.id}>
                    {recipe.name}
                  </option>
                ))}
              </select>
            </div>

            {(formData.recipeId) ? (
            <div className="recipe-buttons">
                <Button
                    type="button"
                    variant="outline"
                    size="small"
                    onClick={goToRecipe}
                    disabled={!formData.recipeId}
                >
                    Go to Recipe
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size="small"
                    onClick={importIngredientsFromRecipe}
                    disabled={!formData.recipeId}
                >
                <Plus size={buttonSize} />
                    Import Ingredients
                </Button>
            </div> 
            ): null
          }
          </div>
        </div>

        {/* Adjunct Ingredients */}
        <div className="form-section">
            <IngredientList
                formData={formData}
                setFormData={setFormData}
                ingredientType="ingredientsAdjunct"
                sectionName="Adjuncts"
                sectionDescription=""
                sectionInfoMessage= "Adjuncts are fermentable ingredients that are not malted grains. Examples include sugar, honey, molasses, fruit, and other fermentable additives. Adjuncts can contribute to the flavor, color, and alcohol content of the brew. No adjuncts added yet."
            >
            </IngredientList>
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
                value={getGravityOriginal()}
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
                value={getGravityFinal()}
                onChange={handleChange}
                placeholder="1.000"
              />
            </div>
          </div>

          <div className="form-row">
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
          </div>

          <Activity
            formData={formData}
            setFormData={setFormData}
            topic="Gravity"
            labelName="Additional Gravity Readings"
            labelDetailsName="Gravity Reading"
            sectionInfoMessage=""
          >
          </Activity>       
        </div>

        {/* Yeast */}
        <div className="form-section">
          <h3>Yeast</h3>       
          <Activity
            formData={formData}
            setFormData={setFormData}
            topic="Yeast"
            labelName="Yeast Additions"
            labelDetailsName="Yeast Details"
            sectionInfoMessage="Wild or cultured, record your yeast here.
No yeast additions recorded."
          >
          </Activity>          
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

          {/* Nutrient Schedule */}
          <div>
            <label htmlFor="nutrients" className="form-label">
                Nutrient Schedule
            </label>
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
              <Plus size={buttonSize} />
                Add Entry
              </Button>
            </div>
          </div>
          
          {getNutrientSchedule().map((entry) => (
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
              Pectic Enzyme
            </label>
            <textarea
              id="pecticEnzyme"
              name="pecticEnzyme"
              className="form-textarea"
              value={formData.pecticEnzyme}
              onChange={handleChange}
              placeholder="General pectic enzyme information and notes"
              rows={3}
            />
          </div>

          {/* Pectic Enzyme Additions */}
          <Activity
            formData={formData}
            setFormData={setFormData}
            topic="PecticEnzyme"
            labelName="Pectic Enzyme Additions"
            labelDetailsName="Enzyme Details"
            sectionInfoMessage=""
          >          
          </Activity>
        </div>

        {/* Acids and Bases */}
        <div className="form-section">
          <h3>Acids and Bases</h3>
          
          {/* Acids */}
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
              placeholder="General acid information and notes"
              rows={3}
            />
          </div>
          <Activity
            formData={formData}
            setFormData={setFormData}
            topic="Acid"
            labelName="Acid Additions"
            labelDetailsName="Acid Details"
            sectionInfoMessage=""
          >
          </Activity>

          {/* Bases */}
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
              placeholder="General base information and notes"
              rows={3}
            />
          </div>
          <Activity
            formData={formData}
            setFormData={setFormData}
            topic="Base"
            labelName="Base Additions"
            labelDetailsName="Base Details"
            sectionInfoMessage=""
          >
          </Activity>
        </div>

        {/* Tannins */}
        <div className="form-section">
          <h3>Tannins</h3>
          
          <div className="form-group">
            <label htmlFor="tannins" className="form-label">
              Tannins
            </label>
            <textarea
              id="tannins"
              name="tannins"
              className="form-textarea"
              value={formData.tannins}
              onChange={handleChange}
              placeholder="General tannin information and notes"
              rows={3}
            />
          </div>
          <Activity
            formData={formData}
            setFormData={setFormData}
            topic="Tannin"
            labelName="Tannin Additions"
            labelDetailsName="Tannin Details"
            sectionInfoMessage=""
          >
          </Activity>
        </div>

        {/* Important Dates */}
        <div className="form-section">
          <h3>Important Dates</h3>     
            <div className="form-group">
              <label htmlFor="dateRacked" className="form-label">
                Date Racked
              </label>
              <input
                type="date"
                id="dateRacked"
                name="dateRacked"
                className="form-input"
                value={getDateRacked()}
                onChange={handleChange}
              />
            </div>
 
            <div className="form-group">
              <label htmlFor="stabilizeDate" className="form-label">
                Date Stabilized
              </label>
              <input
                type="date"
                id="stabilizeDate"
                name="stabilizeDate"
                className="form-input"
                value={formData.dateStabilized}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="stabilize" className="form-label">
                Stabilization Notes
              </label>
              <textarea
                id="stabilize"
                name="stabilize"
                className="form-textarea"
                value={formData.stabilize}
                onChange={handleChange}
                placeholder="Stabilization process and details"
                rows={3}
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

        {/* Notes */}
        <div className="form-section">
          <div className="form-group">
            <h3>
              Description
            </h3>
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
            <h3>
              Notes
            </h3>
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

      {/* Activity Timeline */}
      <div className="card mt-4">
        <div className="card-header" style={{ cursor: 'pointer' }} onClick={() => setShowEventsTimeline(!showEventsTimeline)}>
          <h3>Activity Timeline {showEventsTimeline ? '▼' : '▶'}</h3>
          <p>Click to {showEventsTimeline ? 'hide' : 'show'} chronological events</p>
        </div>
        {showEventsTimeline && formData.activity.length > 0 && (
          <div className="activity-timeline">
            {formData.activity
              .sort((a, b) => new Date(a.date) - new Date(b.date))
              .map(item => (
                <div key={item.id} className="event-timeline-item">
                  <div className="event-date">{formatDate(item.date)}</div>
                  <div className="event-content">
                    <strong>{item.name}</strong>
                    <span className="event-type">({item.type})</span>
                    {item.description && <div className="event-description">{item.description}</div>}
                    <div className="event-status">
                      {item.completed ? '✅ Completed' : '⏳ Pending'}
                      {item.hasAlert && ' 🔔 Has Alert'}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
        {showEventsTimeline && formData.activity.length === 0 && (
          <p className="empty-message">No events recorded yet.</p>
        )}
      </div>

    </div>
  );
}

export default BrewLogForm;