import { Plus } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../../Styles/BrewLogForm.css';
import BrewTypes from '../../constants/BrewTypes';
import { Validation } from '../../constants/ValidationConstants';
import { ActionTypes, generateId, getDate, useApp } from '../../contexts/AppContext';
import BrewLog from '../../models/BrewLog';
import { getCurrentAbv, getGravity13Break, getGravityActivities, getGravityFinal, getGravityOriginal, getPotentialAbv } from '../../utils/gravityCalculations';
import Activity, { ActivityTopicEnum, addActivity, createActivity, getActivitiesByTopic, getTopicDisplayName } from '../Activity/Activity';
import ActivityList from '../Activity/ActivityList';
import IngredientList from '../Ingredients/IngredientList';
import JournalEntryList from '../Journal/JournalEntryList';
import FormFooter from '../Layout/FormFooter';
import FormHeader from '../Layout/FormHeader';
import Button from '../UI/Button';
import Rating from '../UI/Rating';
import GravityChart from './GravityChart';

function BrewLogForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { state, dispatch } = useApp();
    const isEditing = Boolean(id);
    let buttonSize = 14;

    const newFormId = generateId();
    const initialDateCreatedActivity = createActivity(
        getDate(),
        'Date Created',
        'New brew started',
        'DateCreated',
        newFormId
    );

    const [formState, setFormState] = useState(() => new BrewLog({
        id: newFormId,
        activity: [initialDateCreatedActivity],
        dateCreated: initialDateCreatedActivity.date,
    }));

    useEffect(() => {
        if (isEditing) {
            const brewLog = state.brewLogs.find(log => log.id === id);
            if (brewLog) {
                setFormState(BrewLog.fromJSON({
                    ...brewLog,
                    activity: brewLog.activity || []
                }));
            }
        }
    }, [id, isEditing, state.brewLogs]);

    const handleSubmit = (e) => {
        e.preventDefault();

        const brewLogData = formState.toJSON();

        if (isEditing) {
            dispatch({
                type: ActionTypes.updateBrewLog,
                payload: { ...brewLogData, id }
            });
        }
        else {
            dispatch({
                type: ActionTypes.addBrewLog,
                payload: brewLogData
            });
        }

        navigate('/brewlogs');
    };

    const updateFormData = (updates) => {
        const updatedData = BrewLog.fromJSON({ ...formState.toJSON(), ...updates });
        setFormState(updatedData);

        if (isEditing) {
            dispatch({
                type: ActionTypes.updateBrewLog,
                payload: { ...updatedData.toJSON(), id }
            });
        }
    };

    const updateFormDataCallback = (updaterFn) => {
        const currentData = formState.toJSON();
        const updatedData = typeof updaterFn === 'function' ? updaterFn(currentData) : updaterFn;
        const newBrewLog = BrewLog.fromJSON(updatedData);
        setFormState(newBrewLog);

        if (isEditing) {
            dispatch({
                type: ActionTypes.updateBrewLog,
                payload: { ...newBrewLog.toJSON(), id }
            });
        }
    };

    const updateActivityDateByTopic = (e) => {
        const { name, value } = e.target;
        const topic = name;

        const allActivitiesByTopic = getActivitiesByTopic(formState, topic);
        const existingItem = allActivitiesByTopic[0];
        if (!existingItem) {
            return false;
        }

        updateFormDataCallback(prev => {
            const prevData = prev.toJSON ? prev.toJSON() : prev;
            return {
                ...prevData,
                [name]: value,
                activity: prevData.activity.map(item =>
                    item.id === existingItem.id ? { ...item, date: value } : item
                )
            };
        });
        return true;
    };

    const updateBrewLog = (fieldName, value) => {
        updateFormData({ [fieldName]: value });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        //e.target is the input changed. input.name == the property name for this input

        if (name === 'dateCreated') {
            updateActivityDateByTopic(e);
        }
        else if (name === 'dateBottled') {
            if (!value) {
                // Delete activities & alerts if date value was cleared
                const activitiesToDelete = getActivitiesByTopic(formState, name);
                const alertIdsToDelete = activitiesToDelete
                    .filter(act => act.alertId)
                    .map(act => act.alertId);

                alertIdsToDelete.forEach(alertId => {
                    dispatch({
                        type: ActionTypes.deleteAlert,
                        payload: alertId
                    });
                });

                updateFormDataCallback(prev => {
                    const prevData = prev.toJSON ? prev.toJSON() : prev;
                    return {
                        ...prevData,
                        dateBottled: value,
                        activity: prevData.activity.filter(act => 
                            act.topic.toLowerCase() !== ActivityTopicEnum.DateBottled.toLowerCase()
                        )
                    };
                });
            }
            else {
                const updateSuccessful = updateActivityDateByTopic(e);
                if (!updateSuccessful) {
                    const newActivity = createActivity(
                        value,
                        getTopicDisplayName(name),
                        'Brew bottled and ready for aging',
                        ActivityTopicEnum.DateBottled,
                        formState.id,
                        null
                    );

                    updateFormDataCallback(prev => {
                        const prevData = prev.toJSON ? prev.toJSON() : prev;
                        return {
                            ...prevData,
                            dateBottled: value,
                            activity: [...prevData.activity, newActivity]
                        };
                    });
                }
            }
        }
        else {
            updateBrewLog(name, value);
        }

        return;
    };

    const onDelete = (e) => {
        e.preventDefault();

        if (!window.confirm('Are you sure you want to delete this Brew Log?')) return;

        dispatch({ type: ActionTypes.deleteBrewLog, payload: id });
        navigate('/brewlogs');
    }

    // Gravity - memoize to prevent unnecessary recalculations
    const gravityActivities = React.useMemo(() => {
        return getGravityActivities(formState.activity, ActivityTopicEnum.Gravity);
    }, [formState.activity]);

    // Nutrients
    const addNutrientScheduleEntry = (date, description) => {
        addActivity(
            updateFormDataCallback,
            date ? date : getDate(),
            getTopicDisplayName(ActivityTopicEnum.Nutrient),
            description ? description : "",
            ActivityTopicEnum.Nutrient,
            id);
    };

    const addNutrientActivitiesByOption = (scheduleOption) => {
        const today = new Date();
        let nutrientEntries = [];

        switch (scheduleOption) {
            case '2days':
                nutrientEntries = [{
                    date: getDate(),
                    description: 'Half now & half at 1/3 Break'
                }];
                break;

            case '3days':
            case '4days':
                const days = scheduleOption === '3days' ? 2 : 3;
                // Add initial entry for today
                nutrientEntries = [{
                    date: getDate(),
                    description: 'Staggered nutrient - yeast added'
                }];
                // Add future entries
                const futureEntries = Array.from({ length: days }, (_, index) => {
                    const futureDate = new Date(today);
                    futureDate.setDate(today.getDate() + index + 1);
                    return {
                        date: getDate(futureDate),
                        description: `Staggered nutrient - ${(index + 1) * 24} hours later`
                    };
                });
                nutrientEntries = [...nutrientEntries, ...futureEntries];
                break;
        }

        // Create all activities at once
        const newActivities = nutrientEntries.map(entry =>
            createActivity(
                entry.date,
                getTopicDisplayName(ActivityTopicEnum.Nutrient),
                entry.description,
                ActivityTopicEnum.Nutrient,
                id,
                null
            )
        );

        // Add all activities in a single state update
        updateFormDataCallback(prev => ({
            ...prev,
            activity: [...prev.activity, ...newActivities]
        }));
    };

    // Recipe
    const importIngredientsFromRecipe = () => {
        if (!formState.recipeId) {
            alert('Please select a recipe to import ingredients from.');
            return;
        }

        const recipe = state.recipes.find(r => r.id === formState.recipeId);
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
            }));
        };

        const primary = copyWithNewIds(recipe.ingredientsPrimary);
        const secondary = copyWithNewIds(recipe.ingredientsSecondary);

        updateFormDataCallback(prev => ({
            ...prev,
            ingredientsPrimary: [...prev.ingredientsPrimary, ...primary],
            ingredientsSecondary: [...prev.ingredientsSecondary, ...secondary]
        }));
    };

    return (
        <div className="form-container form-with-footer">
            <FormHeader
                isEditing={isEditing}
                entityName="Brew Log"
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
                            value={formState.name}
                            onChange={handleChange}
                            required
                            maxLength={Validation.InputMaxLength}
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
                            value={formState.type}
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

                    <div className="form-group">
                        <label htmlFor="dateCreated" className="form-label">
                            Date Created *
                        </label>
                        <input
                            type="datetime-local"
                            id="dateCreated"
                            name="dateCreated"
                            className="form-input"
                            value={formState.dateCreated}
                            onChange={(e) => { handleChange(e) }}
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
                            value={formState.volume}
                            onChange={handleChange}
                            maxLength={Validation.InputMaxLength}
                            placeholder="e.g., 5 gallons, 1 gallon"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="name" className="form-label">
                            Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            className="form-textarea"
                            value={formState.description}
                            onChange={handleChange}
                            maxLength={Validation.TextareaMaxLength}
                            placeholder="Brief description of your brew"
                            rows={3}
                        />
                    </div>

                    <div className="form-group">
                        <Rating
                            value={formState.rating}
                            onChange={(newRating) => updateFormData({ rating: newRating })}
                            isEditing={true}
                            label="Rating"
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
                                value={formState.recipeId}
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

                        {(formState.recipeId) ? (
                            <div className="recipe-buttons">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="small"
                                    onClick={() => navigate(`/recipes/${formState.recipeId}`)}
                                    disabled={!formState.recipeId}
                                >
                                    Go to Recipe
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="small"
                                    onClick={importIngredientsFromRecipe}
                                    disabled={!formState.recipeId}
                                >
                                    <Plus size={buttonSize} />
                                    Import Ingredients
                                </Button>
                            </div>
                        ) : null
                        }
                    </div>
                </div>

                {/* Primary Ingredients */}
                <div className="form-section">
                    <IngredientList
                        formData={formState}
                        setFormData={updateFormDataCallback}
                        ingredientType="ingredientsPrimary"
                        sectionName="Primary Ingredients"
                        sectionDescription=""
                        sectionInfoMessage="Primary ingredients contribute to the flavor, color, and alcohol content of the brew. These are things such as malted grains, sugar, honey, molasses, agave, fruit, and other fermentables. No primary ingredients added yet."
                    >
                    </IngredientList>
                </div>

                {/* Secondary Ingredients */}
                <div className="form-section">
                    <IngredientList
                        formData={formState}
                        setFormData={updateFormDataCallback}
                        ingredientType="ingredientsSecondary"
                        sectionName="Secondary Ingredients"
                        sectionDescription=""
                        sectionInfoMessage="List ingredients used during secondary fermentation or any used to backsweeten your brew. These are optional additions added after primary fermentation has finished. No secondary ingredients added yet."
                    >
                    </IngredientList>
                </div>

                {/* Yeast */}
                <div className="form-section">
                    <h3>Pitch Yeast</h3>
                    <ActivityList
                        formData={formState}
                        setFormData={updateFormDataCallback}
                        topic={ActivityTopicEnum.Yeast}
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
                                Original Gravity {getActivitiesByTopic(formState, ActivityTopicEnum.Gravity).length === 0 ? " (please add entry)" : null}
                            </label>
                            <input
                                step="0.001"
                                value={getGravityOriginal(gravityActivities)}
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
                                name="gravity13Break"
                                className="form-input calculated-field"
                                value={getGravity13Break(gravityActivities)}
                                readOnly
                                placeholder="1.030"
                                title="This field is automatically calculated from Original Gravity"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                Final Gravity
                            </label>
                            <input
                                type="number"
                                step="0.001"
                                className="form-input  calculated-field"
                                value={getGravityFinal(gravityActivities)}
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
                                    className="form-input calculated-field"
                                    value={getCurrentAbv(gravityActivities)}
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
                                    //id="finalABV"
                                    //name="finalABV"
                                    className="form-input calculated-field"
                                    value={getPotentialAbv(gravityActivities)}
                                    readOnly
                                    placeholder="12.5"
                                    title="This field is automatically calculated from Original and Final Gravity"
                                />
                                <span className="input-suffix">%</span>
                            </div>
                        </div>
                    </div>

                    <ActivityList
                        formData={formState}
                        setFormData={updateFormDataCallback}
                        topic={ActivityTopicEnum.Gravity}
                        headerLabel="Gravity Readings"
                        itemLabel="Gravity Reading"
                        sectionInfoMessage=""
                        brewLogId={id}
                    >
                    </ActivityList>

                    <GravityChart gravityActivities={gravityActivities} />
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
                            value={formState.nutrients}
                            onChange={handleChange}
                            maxLength={Validation.InputMaxLength}
                            placeholder="Nutrient details"
                        />
                    </div>

                    {/* Nutrient Schedule Option Buttons*/}
                    <div className="form-group">
                        <label htmlFor="nutrients" className="form-label">
                            Nutrient Schedule
                        </label>
                        <div className="nutrient-schedule-buttons">
                            <Button
                                type="button"
                                variant="outline"
                                size="small"
                                onClick={() => { addNutrientActivitiesByOption('2days') }}
                            >
                                Split Schedule (2 days)
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="small"
                                onClick={() => { addNutrientActivitiesByOption('3days') }}
                            >
                                Staggered (3 days)
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="small"
                                onClick={() => { addNutrientActivitiesByOption('4days') }}
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

                    <div>
                        {getActivitiesByTopic(formState, ActivityTopicEnum.Nutrient).map((activity) => (
                            <Activity
                                key={activity.id}
                                activity={activity}
                                itemLabel="Nutrient Details"
                                brewLogId={formState.id}
                                setFormData={updateFormDataCallback}
                            />
                        ))}
                    </div>
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
                            value={formState.pecticEnzyme}
                            onChange={handleChange}
                            maxLength={Validation.TextareaMaxLength}
                            placeholder="General pectic enzyme information and notes"
                            rows={3}
                        />
                    </div>

                    <ActivityList
                        formData={formState}
                        setFormData={updateFormDataCallback}
                        topic={ActivityTopicEnum.PecticEnzyme}
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
                            value={formState.acids}
                            onChange={handleChange}
                            maxLength={Validation.TextareaMaxLength}
                            placeholder="General acid information and notes"
                            rows={3}
                        />
                    </div>

                    <ActivityList
                        formData={formState}
                        setFormData={updateFormDataCallback}
                        topic={ActivityTopicEnum.Acid}
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
                            value={formState.bases}
                            onChange={handleChange}
                            maxLength={Validation.TextareaMaxLength}
                            placeholder="General base information and notes"
                            rows={3}
                        />
                    </div>

                    <ActivityList
                        formData={formState}
                        setFormData={updateFormDataCallback}
                        topic={ActivityTopicEnum.Base}
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
                            value={formState.tannins}
                            onChange={handleChange}
                            maxLength={Validation.TextareaMaxLength}
                            placeholder="General tannin information and notes"
                            rows={3}
                        />
                    </div>

                    <ActivityList
                        formData={formState}
                        setFormData={updateFormDataCallback}
                        topic={ActivityTopicEnum.Tannin}
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
                        <ActivityList
                            formData={formState}
                            setFormData={updateFormDataCallback}
                            topic={ActivityTopicEnum.DateRacked}
                            headerLabel="Date Racked"
                            itemLabel="Racking Details"
                            sectionInfoMessage=""
                            brewLogId={id}
                        >
                        </ActivityList>
                    </div>

                    <div className="form-group">
                        <ActivityList
                            formData={formState}
                            setFormData={updateFormDataCallback}
                            topic={ActivityTopicEnum.DateStabilized}
                            headerLabel="Date Stabilized"
                            itemLabel="Stabilization Details"
                            sectionInfoMessage=""
                            brewLogId={id}
                        >
                        </ActivityList>
                    </div>

                    <div className="form-group">
                        <label htmlFor="dateBottled" className="form-label">
                            Date Bottled
                        </label>
                        <input
                            type="datetime-local"
                            name="dateBottled"
                            className="form-input"
                            value={formState.dateBottled}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {/*Other Activities*/}
                <div className="form-section">
                    <div className="form-group">
                        <h3>Other Activities</h3>
                        <ActivityList
                            formData={formState}
                            setFormData={updateFormDataCallback}
                            topic={ActivityTopicEnum.Other}
                            headerLabel=""
                            itemLabel="Activity Details"
                            sectionInfoMessage="Log any other activities you want to keep track of, such as pH measurements, filtering, backsweetening, degassing, tastings, and more."
                            brewLogId={id}
                        >
                        </ActivityList>
                    </div>
                </div>

                {/* Notes */}
                <div className="form-section">
                    <div className="form-group">
                        <h3>
                            Notes
                        </h3>
                        <textarea
                            id="notes"
                            name="notes"
                            className="form-textarea"
                            value={formState.notes}
                            onChange={handleChange}
                            maxLength={Validation.TextareaMaxLength}
                            placeholder="Additional notes about this brew"
                            rows={4}
                        />
                    </div>
                </div>

                {/* Journal Entries */}
                <div className="form-section brewlog-journal">
                    <div className="form-group brewlog-journal-header">
                        <h3>
                            Journal
                        </h3>
                        <div className="brewlog-journal-action">
                            <Button
                                type="button"
                                variant="outline"
                                size="small"
                                onClick={() => navigate(`/journal/new?brewLogId=${formState.id}&type=${formState.type}&name=${encodeURIComponent(formState.name)}&abv=${getCurrentAbv(getGravityActivities(formState.activity))}`)}
                            >
                                <Plus size={16} />
                                Add Journal Entry
                            </Button>
                        </div>
                    </div>

                    <div className="form-group">
                        <JournalEntryList
                            brewLogId={id}/>
                    </div>
                </div>
            </form>

            <FormFooter
                isEditing={isEditing}
                entityName="Brew Log"
                showCancel={!isEditing}
                onCancel={() => navigate('/brewlogs')}
                showDelete={true}
                onDelete={onDelete}
            />
        </div>
    );
}

export default BrewLogForm;