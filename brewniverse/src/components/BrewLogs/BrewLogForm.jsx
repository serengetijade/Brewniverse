import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { generateId, getDate, useApp, ActionTypes } from '../../contexts/AppContext';
import Button from '../UI/Button';
import FormHeader from '../Layout/FormHeader';
import FormFooter from '../Layout/FormFooter';
import IngredientList from '../Ingredients/IngredientList';
import ActivityList from '../Activity/ActivityList';
import Activity, { createActivity, getActivityDisplayName, ACTIVITY_TOPICS } from '../Activity/Activity';
import ActivityTimeline from '../Activity/ActivityTimeline';
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
    id: generateId(),
    acids: '',
    activity: [],
    bases: '',
    dateBottled: '',
    dateCreated: new Date().toISOString().split('T')[0],
    dateStabilized: new Date().toISOString().split('T')[0],
    description: '',
    ingredientsAdjunct: [],
    ingredientsPrimary: [],
    ingredientsSecondary: [],
    //finalABV: '',
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
  const [showActivityTimeline, setShowActivityTimeline] = useState(false);

  useEffect(() => {
    if (isEditing) {
      const brewLog = state.brewLogs.find(log => log.id === id);
      if (brewLog) {
        const loadedData = {
          ...brewLog,
          id: brewLog.id, // Ensure ID is preserved
          dateCreated: brewLog.dateCreated.split('T')[0],
          activity: brewLog.activity || []
        };
        
        // Add initial Date Created activity
        if (!brewLog.activity || brewLog.activity.length === 0) {
            const generatedActivities = [];    
          
            // Create activity(s) from nutrientSchedule
            if (loadedData.nutrientSchedule && loadedData.nutrientSchedule.length > 0) {
                loadedData.nutrientSchedule.forEach(entry => {
                    generatedActivities.push(createActivity(
                        entry.date,
                        getActivityDisplayName('Nutrient'),
                        entry.description,
                        'Nutrient',
                        formData.id
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
        activity: [createActivity(
          getDate(),
          'Date Created',
          'New brew started',
          'Other',
          formData.id
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
      //e.target is the input changed. input.name == the property name for this input

    if (name === 'dateCreated') {
      setFormData(prev => {
        const newFormData = {
          ...prev,
          dateCreated: value
        };

        const existingEventIndex = prev.activity.findIndex(item => item.topic === 'DateCreated');
        let existingEvent = prev.activity.find(item => item.topic === 'DateCreated');
        existingEvent.date = value;
        const dateCreatedActivity = existingEvent;

        if (existingEventIndex >= 0) {
          newFormData.activity = prev.activity.map((item, index) =>
            index === existingEventIndex ? { ...item, date: value } : item
          );
        } else {
          newFormData.activity = [...prev.activity, dateCreatedActivity];
          //updateActivity(existingEvent.id, { date: value });
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
        
        const existingEventIndex = prev.activity.findIndex(event => event.topic === 'DateBottled');
        const dateBottledEvent = createActivity(
          value,
          getActivityDisplayName('DateBottled'),
          'Brew bottled and ready for aging',
          'DateBottled',
          prev.id,
          null
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
          newFormData.activity = prev.activity.filter(event => event.topic !== 'DateBottled');
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
          const existingEventIndex = prev.activity.findIndex(event => event.topic === 'Stabilize');
          const stabilizeEvent = createActivity(
            stabilizeDate,
            getActivityDisplayName('Stabilize'),
            stabilizeText,
            'Stabilize',
            prev.id,
            null
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
          newFormData.activity = prev.activity.filter(event => event.topic !== 'Stabilize');
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

    // Gravity: Recalculate estimated ABV & 1/3 Break
    var gravityActivities = formData.activity
        .filter(event => event.topic === 'Gravity')
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    const getGravityOriginal = () => {
        return gravityActivities.length > 0 ? gravityActivities[0].description : '';
    };

    const getGravityFinal = () => {
        if (gravityActivities.length <= 1) return '';
        const latestGravity = gravityActivities[gravityActivities.length - 1];
        return latestGravity && latestGravity.description ? latestGravity.description : '';
    };

    const getGravity13Break = () => {
        if (gravityActivities.length < 1) return '';
        const originalGravity = getGravityOriginal();
        return ((parseFloat(originalGravity - 1) * 2 / 3) + 1).toFixed(3);
    }

    const getCurrentAbv = () => {
        if (gravityActivities.length < 1) return '';
        const originalGravity = getGravityOriginal();
        const latestGravity = parseFloat(gravityActivities[gravityActivities.length - 1].description);
        return ((originalGravity - latestGravity) * 131.25).toFixed(2)
    }

    const getPotentialAbv = () => {
        if (gravityActivities.length < 1) return '';
        const originalGravity = parseFloat(gravityActivities[0].description);
        return ((originalGravity - 1) * 131.25).toFixed(2)
    }

    //useEffect(() => {
    //  const gravityActivities = formData.activity
    //    .filter(event => event.topic === 'Gravity')
    //    .sort((a, b) => new Date(a.date) - new Date(b.date));
    //  if (gravityActivities.length < 1) return;

    //  const originalGravity = parseFloat(gravityActivities[0].description);
    //  const finalAbv = ((originalGravity - 1) * 131.25).toFixed(2)

    //  if (originalGravity > 1) {
    //    setFormData(prev => ({
    //          ...prev,
    //          finalABV: finalAbv,
    //    }));
    //  }
    //}, [formData.activity]);

  // Nutrients
  const addNutrientScheduleEntry = () => {
    const nutrientEvent = createActivity(
      getDate(),
      getActivityDisplayName('Nutrient'),
      '',
      'Nutrient',
      formData.id,
      null
    );
    addActivity(nutrientEvent);
  };

  const formatDateForActivity = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hour}:${minute}`;
  };

  const addScheduleEntries = (scheduleType) => {
    const today = new Date();
    let entries = [];

    switch (scheduleType) {
      case 'split':
        entries = [{
          date: formatDateForActivity(today),
          description: 'Half now & half at 1/3 Break',
          statusOfActivity: "Pending"
        }];
        break;
      
      case 'staggered2':
      case 'staggered3':
        const days = scheduleType === 'staggered2' ? 2 : 3;
        // Add initial entry for today
        entries = [{
            date: formatDateForActivity(today),
            description: 'Staggered nutrient - yeast added',
            statusOfActivity: "Pending"
        }];
        // Add future entries
        const futureEntries = Array.from({ length: days }, (_, index) => {
          const futureDate = new Date(today);
          futureDate.setDate(today.getDate() + index + 1);
          return {
              date: formatDateForActivity(futureDate),
              description: `Staggered nutrient - ${(index + 1) * 24} hours later`,
              statusOfActivity: "Pending"
          };
        });
        entries = [...entries, ...futureEntries];
        break;
    }

    const nutrientActivities = entries.map(entry => 
      createActivity(
        entry.date,
        getActivityDisplayName('Nutrient'),
        entry.description,
        'Nutrient',
        formData.id,
        null
      )
    );

    setFormData(prev => ({
      ...prev,
      activity: [...prev.activity, ...nutrientActivities]
    }));
  };

  const addSplitSchedule = () => addScheduleEntries('split');
  const addStaggered3Schedule = () => addScheduleEntries('staggered2');
  const addStaggered4Schedule = () => addScheduleEntries('staggered3');
  
  const getNutrientSchedule = () => {
    return getActivitiesByTopic('Nutrient');
  };

  // Activity management functions
  const getActivitiesByTopic = (topic) => {
    return formData.activity.filter(event => event.topic === topic);
    };

  const addActivity = (activity) => {
    setFormData(prev => ({
      ...prev,
      activity: [...prev.activity, activity]
    }));
  };

  const updateActivity = (eventId, updates) => {
    setFormData(prev => ({
      ...prev,
      activity: prev.activity.map(item =>
        item.id === eventId ? { ...item, ...updates } : item
      )
    }));
  };

  const updateActivityItem = (date, name, description, topic) => { 
    const eventDate = date || getDate();
    const existingEvent = formData.activity.find(event => event.topic === topic);
    
    if (existingEvent) {
      updateActivity(existingEvent.id, { name, description, date: eventDate });
    } else {
      const newActivity = createActivity(
        eventDate,
        name,
        description,
        topic,
        formData.id,
        null
      );
      addActivity(newActivity);
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
        id: generateId(),
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
    <div className="form-container form-with-footer">
      <FormHeader 
        isEditing={isEditing} 
        entityName="Brew Log" 
        hasUnsavedChanges={hasUnsavedChanges}
      />

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

        {/* Yeast */}
        <div className="form-section">
          <h3>Yeast</h3>       
          <ActivityList
            formData={formData}
            setFormData={setFormData}
            topic="Yeast"
            headerLabel=""
            itemLabel="Yeast Details"
            sectionInfoMessage="Wild or cultured, record your yeast here. No yeast additions recorded."
            brewLogId={id}
          >
          </ActivityList>          
        </div>

        {/* Gravity Readings */}
        <div className="form-section">
          <h3>Gravity Readings</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="gravity.original" className="form-label">
                Original Gravity {getActivitiesByTopic("Gravity").length === 0 ? " (please add entry)" : null}
              </label>
              <input
                step="0.001"
                id="gravity.original"
                name="gravity.original"
                value={getGravityOriginal()}
                className="form-input  calculated-field"
                placeholder="1.050"
                readOnly
              />
            </div>

            <div className="form-group">
              <label htmlFor="gravity13Break" className="form-label">
                1/3 Break Gravity (auto-calculated)
              </label>
              <input
                step="0.001"
                id="gravity13Break"
                name="gravity13Break"
                className="form-input calculated-field"
                value={getGravity13Break()}
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
                className="form-input  calculated-field"
                value={getGravityFinal()}
                readOnly
                placeholder="1.000"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="estimatedABV" className="form-label">
                Current ABV (auto-calculated)
              </label>
              <div className="input-with-suffix">
                <input
                  type="number"
                  step="0.01"
                  id="estimatedABV"
                  name="estimatedABV"
                  className="form-input calculated-field"
                  //value={formData.currentABV}
                  value={getCurrentAbv()}
                  readOnly
                  placeholder="12.5"
                  title="This field is automatically calculated from Original Gravity"
                />
                <span className="input-suffix">%</span>
              </div>
                      </div>

            <div className="form-group">
              <label htmlFor="finalABV" className="form-label">
                Potential Final ABV (auto-calculated)
              </label>
              <div className="input-with-suffix">
                <input
                  type="number"
                  step="0.01"
                  id="finalABV"
                  name="finalABV"
                  className="form-input calculated-field"
                  value={getPotentialAbv()}
                  readOnly
                  placeholder="12.5"
                  title="This field is automatically calculated from Original and Final Gravity"
                />
                <span className="input-suffix">%</span>
              </div>
            </div>            
          </div>

          <ActivityList
            formData={formData}
            setFormData={setFormData}
            topic="Gravity"
            headerLabel="Gravity Readings"
            itemLabel="Gravity Reading"
            sectionInfoMessage=""
            brewLogId={id}
          >
          </ActivityList>       
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
          <div className="form-group">
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
                Split Schedule (2 days)
              </Button>
              <Button
                type="button"
                variant="outline"
                size="small"
                onClick={addStaggered3Schedule}
              >
                Staggered (3 days)
              </Button>
              <Button
                type="button"
                variant="outline"
                size="small"
                onClick={addStaggered4Schedule}
              >
                Staggered (4 days)
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

            {getNutrientSchedule().map((activity) => (
                <Activity
                    key={activity.id}
                    activity={activity}
                    itemLabel="Nutrient Details"
                    brewLogId={formData.id}
                    setFormData={setFormData}
                />
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
          <ActivityList
            formData={formData}
            setFormData={setFormData}
            topic="PecticEnzyme"
            headerLabel="Pectic Enzyme Additions"
            itemLabel="Enzyme Details"
            sectionInfoMessage=""
            brewLogId={id}
          >          
          </ActivityList>
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
          <ActivityList
            formData={formData}
            setFormData={setFormData}
            topic="Acid"
            headerLabel="Acid Additions"
            itemLabel="Acid Details"
            sectionInfoMessage=""
            brewLogId={id}
          >
          </ActivityList>

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
          <ActivityList
            formData={formData}
            setFormData={setFormData}
            topic="Base"
            headerLabel="Base Additions"
            itemLabel="Base Details"
            sectionInfoMessage=""
            brewLogId={id}
          >
          </ActivityList>
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
          <ActivityList
            formData={formData}
            setFormData={setFormData}
            topic="Tannin"
            headerLabel="Tannin Additions"
            itemLabel="Tannin Details"
            sectionInfoMessage=""
            brewLogId={id}
          >
          </ActivityList>
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
                onChange={(e) => {
                  addActivity(
                    createActivity(
                      e.target.value,
                      getActivityDisplayName('Racked'),
                      "Brew moved to secondary",
                      "Racked",
                      formData.id,
                      null
                    )
                  )
                }}
                      />
              </div>
              <div className="form-group">
                  <ActivityList
                    formData={formData}
                    setFormData={setFormData}
                    topic="Racked"
                    headerLabel=""
                    itemLabel="Racking Details"
                    sectionInfoMessage=""
                    brewLogId={id}
                  >
              </ActivityList>
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

        {/*Other Activities*/ }
              <div className="form-section">
                  <div className="form-group">
                      <h3>Other Activities</h3>
                      <ActivityList
                          formData={formData}
                          setFormData={setFormData}
                          topic="Other"
                          headerLabel=""
                          itemLabel="Activity Details"
                          sectionInfoMessage="Log any other activities you want to keep track of, such as filtering, backsweetening, degassing, tastings, and more."
                          brewLogId={id}
                      >
                      </ActivityList>
                  </div>
              </div>

        {/* Description & Notes */}
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
      </form>

      <FormFooter 
        isEditing={isEditing}
        entityName="Brew Log"
        onCancel={() => handleNavigation('/brewlogs')}
        showDelete={false}
      />

      {/* Activity Timeline */}
      <ActivityTimeline
        formData={formData}
        showActivityTimeline={showActivityTimeline}
        setShowActivityTimeline={setShowActivityTimeline}
      >
      </ActivityTimeline>
    </div>
  );
}

export default BrewLogForm;