import { Archive, ChevronDown, ChevronUp, Copy, Plus, X } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../../Styles/BrewLogForm.css';
import BrewTypes from '../../constants/BrewTypes';
import { Validation } from '../../constants/ValidationConstants';
import { ActionTypes, generateId, getDate, useApp } from '../../contexts/AppContext';
import BrewLog from '../../models/BrewLog';
import { UpdateAllGravityActivityData, getCurrentAbv, getGravity13Break, getGravityActivities, getGravityFinal, getGravityOriginal, getPotentialAbv } from '../../utils/GravityCalculations';
import Activity, { ActivityTopicEnum, createActivity, getActivitiesByTopic, getTopicDisplayName } from '../Activity/Activity';
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

    // Collapsible section state with localStorage persistence
    const [collapsedSections, setCollapsedSections] = useState(() => {
        const saved = localStorage.getItem('brewLogFormCollapsedSections');
        return saved ? JSON.parse(saved) : {};
    });

    const toggleSection = (sectionName) => {
        setCollapsedSections(prev => {
            const newState = {
                ...prev,
                [sectionName]: !prev[sectionName]
            };
            localStorage.setItem('brewLogFormCollapsedSections', JSON.stringify(newState));
            return newState;
        });
    };

    const allSections = [
        'basicInfo', 'primaryIngredients', 'secondaryIngredients', 'yeast',
        'gravity', 'nutrients', 'pecticEnzyme', 'acidsAndBases', 'tannins',
        'abv', 'additions', 'additionsInstructions', 'importantDates', 'otherActivities', 'notes', 'todo', 'journal', 'copy', 'archived'
    ];
    const collapseAll = () => {
        const newState = {};
        allSections.forEach(section => {
            newState[section] = true;
        });
        setCollapsedSections(newState);
        localStorage.setItem('brewLogFormCollapsedSections', JSON.stringify(newState));
    };

    const hasExpandedSections = () => {
        if (Object.keys(collapsedSections).length === 0) return true;
        return Object.values(collapsedSections).some(isCollapsed => isCollapsed !== true);
    };

    const [formState, setFormState] = useState(() => new BrewLog());

    useEffect(() => {
        const brewLog = state.brewLogs.find(log => log.id === id);
        if (brewLog) {
            setFormState(BrewLog.fromJSON({
                ...brewLog,
                activity: brewLog.activity || []
            }));
        }
    }, [id, state.brewLogs]);

    const handleSubmit = (e) => {
        e.preventDefault();

        const brewLogData = formState.toJSON();

        dispatch({
            type: ActionTypes.updateBrewLog,
            payload: { ...brewLogData, id }
        });
        navigate(`/brewlogs/${id}`);
    };

    const updateFormData = useCallback((updates) => {
        setFormState(prevState => {
            const updatedData = BrewLog.fromJSON({ ...prevState.toJSON(), ...updates });

            dispatch({
                type: ActionTypes.updateBrewLog,
                payload: { ...updatedData.toJSON(), id }
            });

            return updatedData;
        });
    }, [id, dispatch]);

    const updateFormDataCallback = (updaterFn) => {
        const currentData = formState.toJSON();
        const updatedData = typeof updaterFn === 'function' ? updaterFn(currentData) : updaterFn;
        const newBrewLog = BrewLog.fromJSON(updatedData);
        setFormState(newBrewLog);

        dispatch({
            type: ActionTypes.updateBrewLog,
            payload: { ...newBrewLog.toJSON(), id }
        });
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
        else if (name === 'volume') {
            if (gravityActivities == undefined) return;

            UpdateAllGravityActivityData(gravityActivities[0], gravityActivities[0], gravityActivities, value);

            updateBrewLog(name, value);
        }
        else {
            updateBrewLog(name, value);
        }

        return;
    };

    const makeCopy = (e) => {
        if (!window.confirm('Are you sure you want to make a copy of this Brew Log?')) return;

        const newId = generateId();

        const brewLogCopy = formState.toJSON();

        brewLogCopy.id = newId;
        brewLogCopy.name = `${brewLogCopy.name.trimEnd()} (Copy)`;

        if (brewLogCopy.activity && brewLogCopy.activity.length > 0) {
            brewLogCopy.activity = brewLogCopy.activity.map(activity => ({
                ...activity,
                id: generateId(),
                brewLogId: newId
            }));
        }

        dispatch({
            type: ActionTypes.addBrewLog,
            payload: brewLogCopy
        });

        navigate(`/brewlogs/${newId}`);
    };

    const onDelete = (e) => {
        e.preventDefault();

        if (!window.confirm('Are you sure you want to delete this Brew Log?')) return;

        dispatch({ type: ActionTypes.deleteBrewLog, payload: id });
        navigate('/brewlogs');
    }

    // Gravity
    const gravityActivities = React.useMemo(() => {
        return getGravityActivities(formState.activity, ActivityTopicEnum.Gravity);
    }, [formState.activity]);

    // Addition
    const additionActivities = getActivitiesByTopic(formState, ActivityTopicEnum.Addition);
    const totalAddedVolume = additionActivities.reduce(
        (sum, activity) => sum + (parseFloat(activity.addedVolume) || 0),
        0
    );
    const startingVolume = parseFloat(formState.volume) || 0;
    const finalVolume = startingVolume + totalAddedVolume;

    // Nutrients
    const addNutrientScheduleEntry = () => {
        const newActivity = createActivity(
            getDate(),
            getTopicDisplayName(ActivityTopicEnum.Nutrient),
            null,
            ActivityTopicEnum.Nutrient,
            id,
            null
        );

        updateFormDataCallback(prev => ({
            ...prev,
            activity: [...prev.activity, newActivity]
        }));
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
                unit: item.unit || 'oz',
                order: item.order !== undefined ? item.order : 0
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
        <div className="main-content-container form-container form-with-footer">
            <FormHeader
                isEditing={isEditing}
                name={formState.name}
                entityName="Brew Log"
            />

            <form onSubmit={handleSubmit} className="card">
                {hasExpandedSections() && (
                    <div className="form-section collapse-all-container">
                        <Button
                            variant="secondary"
                            className="collapse-all-button"
                            onClick={collapseAll}
                            aria-label="Collapse all sections"
                            size="small"
                        >
                            <ChevronUp size={20} />Collapse all sections
                        </Button>
                    </div>
                )}

                {/* Basic Information */}
                <div className="form-section">
                    <div
                        className="section-header collapsible"
                        onClick={() => toggleSection('basicInfo')}
                    >
                        <h3>
                            <ChevronDown
                                size={20}
                                className={`section-toggle-icon ${collapsedSections.basicInfo ? 'collapsed' : ''}`}
                            />
                            Basic Information
                        </h3>
                    </div>

                    <div className={`section-content ${collapsedSections.basicInfo ? 'collapsed' : ''}`}>
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
                                rows={4}
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
                                    {[...state.recipes]
                                        .sort((a, b) => a.name.localeCompare(b.name))
                                        .map(recipe => (
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
                        isCollapsible={true}
                        isCollapsed={collapsedSections.primaryIngredients}
                        onToggle={() => toggleSection('primaryIngredients')}
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
                        isCollapsible={true}
                        isCollapsed={collapsedSections.secondaryIngredients}
                        onToggle={() => toggleSection('secondaryIngredients')}
                    >
                    </IngredientList>
                </div>

                {/* To Do List */}
                <div className="form-section">
                    <div
                        className="section-header collapsible"
                        onClick={() => toggleSection('todo')}
                    >
                        <h3>
                            <ChevronDown
                                size={20}
                                className={`section-toggle-icon ${collapsedSections.todo ? 'collapsed' : ''}`}
                            />
                            To Do List
                        </h3>
                    </div>

                    <div className={`section-content ${collapsedSections.todo ? 'collapsed' : ''}`}>
                        {(formState.recipeId) ? (
                            <div className="form-group">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="small"
                                    onClick={() => navigate(`/recipes/${formState.recipeId}`)}
                                    disabled={!formState.recipeId}
                                    fullWidth={true}
                                >
                                    Go to Recipe
                                </Button>
                            </div>
                        ) : null
                        }

                        <div className="form-group">
                            <ActivityList
                                formData={formState}
                                setFormData={updateFormDataCallback}
                                topic={ActivityTopicEnum.ToDo}
                                headerLabel=""
                                itemLabel=""
                                sectionInfoMessage="Follow along with a recipe, or set yourself a list of tasks to do."
                                brewLogId={id}
                            >
                            </ActivityList>
                        </div>
                    </div>
                </div>

                {/* Yeast */}
                <div className="form-section">
                    <div
                        className="section-header collapsible"
                        onClick={() => toggleSection('yeast')}
                    >
                        <h3>
                            <ChevronDown
                                size={20}
                                className={`section-toggle-icon ${collapsedSections.yeast ? 'collapsed' : ''}`}
                            />
                            Yeast
                        </h3>
                    </div>
                    <div className={`section-content ${collapsedSections.yeast ? 'collapsed' : ''}`}>
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
                </div>

                {/* Nutrients */}
                <div className="form-section">
                    <div
                        className="section-header collapsible"
                        onClick={() => toggleSection('nutrients')}
                    >
                        <h3>
                            <ChevronDown
                                size={20}
                                className={`section-toggle-icon ${collapsedSections.nutrients ? 'collapsed' : ''}`}
                            />
                            Nutrients
                        </h3>
                    </div>
                    <div className={`section-content ${collapsedSections.nutrients ? 'collapsed' : ''}`}>
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
                </div>

                {/* Acids and Bases */}
                <div className="form-section">
                    <div
                        className="section-header collapsible"
                        onClick={() => toggleSection('acidsAndBases')}
                    >
                        <h3>
                            <ChevronDown
                                size={20}
                                className={`section-toggle-icon ${collapsedSections.acidsAndBases ? 'collapsed' : ''}`}
                            />
                            Acids and Bases
                        </h3>
                    </div>
                    <div className={`section-content ${collapsedSections.acidsAndBases ? 'collapsed' : ''}`}>

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
                </div>

                {/* Tannins */}
                <div className="form-section">
                    <div
                        className="section-header collapsible"
                        onClick={() => toggleSection('tannins')}
                    >
                        <h3>
                            <ChevronDown
                                size={20}
                                className={`section-toggle-icon ${collapsedSections.tannins ? 'collapsed' : ''}`}
                            />
                            Tannins
                        </h3>
                    </div>
                    <div className={`section-content ${collapsedSections.tannins ? 'collapsed' : ''}`}>

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
                </div>

                {/* Pectic Enzyme */}
                <div className="form-section">
                    <div
                        className="section-header collapsible"
                        onClick={() => toggleSection('pecticEnzyme')}
                    >
                        <h3>
                            <ChevronDown
                                size={20}
                                className={`section-toggle-icon ${collapsedSections.pecticEnzyme ? 'collapsed' : ''}`}
                            />
                            Pectic Enzyme
                        </h3>
                    </div>
                    <div className={`section-content ${collapsedSections.pecticEnzyme ? 'collapsed' : ''}`}>
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
                </div>

                {/* Gravity Readings */}
                <div className="form-section">
                    <div
                        className="section-header collapsible"
                        onClick={() => toggleSection('gravity')}
                    >
                        <h3>
                            <ChevronDown
                                size={20}
                                className={`section-toggle-icon ${collapsedSections.gravity ? 'collapsed' : ''}`}
                            />
                            Gravity Readings
                        </h3>
                    </div>
                    <div className={`section-content ${collapsedSections.gravity ? 'collapsed' : ''}`}>
                        {getActivitiesByTopic(formState, ActivityTopicEnum.Gravity).length === 0 && (
                            <p className="section-description">Please add gravity entries below to see calculated values</p>
                        )}

                        <div className="gravity-stats-container">
                            <div className="gravity-stat-card accent20">
                                <div className="gravity-stat-label">Original Gravity</div>
                                <div className="gravity-stat-value">
                                    {getGravityOriginal(gravityActivities) || '—'}
                                </div>
                                {getGravityOriginal(gravityActivities) && (
                                    <div className="gravity-stat-subtitle">Starting point</div>
                                )}
                            </div>

                            <div className="gravity-stat-card accent15">
                                <div className="gravity-stat-label">1/3 Break Gravity</div>
                                <div className="gravity-stat-value">
                                    {getGravity13Break(gravityActivities) || '—'}
                                </div>
                                {getGravity13Break(gravityActivities) && (
                                    <div className="gravity-stat-subtitle">Add nutrient at this point</div>
                                )}
                            </div>

                            <div className="gravity-stat-card accent10">
                                <div className="gravity-stat-label">Final Gravity</div>
                                <div className="gravity-stat-value">
                                    {getGravityFinal(gravityActivities) || '—'}
                                </div>
                                {getGravityFinal(gravityActivities) && (
                                    <div className="gravity-stat-subtitle">Fermentation complete</div>
                                )}
                            </div>

                            <div className="gravity-stat-card accent08">
                                <div className="gravity-stat-label">Current ABV</div>
                                <div className="gravity-stat-value">
                                    {getCurrentAbv(gravityActivities) || '—'}
                                    {getCurrentAbv(gravityActivities) && <span className="gravity-stat-unit">%</span>}
                                </div>
                                {getCurrentAbv(gravityActivities) && (
                                    <div className="gravity-stat-subtitle">Present alcohol content</div>
                                )}
                            </div>

                            <div className="gravity-stat-card accent05">
                                <div className="gravity-stat-label">Potential Final ABV</div>
                                <div className="gravity-stat-value">
                                    {getPotentialAbv(gravityActivities) || '—'}
                                    {getPotentialAbv(gravityActivities) && <span className="gravity-stat-unit">%</span>}
                                </div>
                                {getPotentialAbv(gravityActivities) && (
                                    <div className="gravity-stat-subtitle">Estimated at completion</div>
                                )}
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="name" className="form-label">
                                Starting Volume <small>(Required)</small>
                            </label>
                            <input
                                type="number"
                                id="volume"
                                name="volume"
                                className="form-input"
                                value={formState.volume}
                                onChange={handleChange}
                                maxLength={Validation.InputMaxLength}
                                placeholder="e.g., 5 gallons, 1 gallon"
                                required={true}
                                min={0}
                                step="0.001"
                            />
                            <p className="section-description">
                                In order to calculate gravity, you must provide a starting volume.
                            </p>
                        </div>

                        <ActivityList
                            formData={formState}
                            setFormData={updateFormDataCallback}
                            topic={ActivityTopicEnum.Gravity}
                            headerLabel="Gravity Readings"
                            itemLabel="Gravity Reading"
                            sectionInfoMessage=""
                            brewLogId={id}
                            showBottomButton={true}
                        >
                        </ActivityList>

                        <GravityChart gravityActivities={gravityActivities} />
                    </div>
                </div>

                {/* Additions */}
                <div className="form-section">
                    <div className="section-header collapsible" onClick={() => toggleSection('additions')}>
                        <h3>
                            <ChevronDown
                                size={20}
                                className={`section-toggle-icon ${collapsedSections.additions ? 'collapsed' : ''}`}
                            />
                            Additions
                        </h3>
                    </div>
                    <div className={`section-content ${collapsedSections.additions ? 'collapsed' : ''}`}>

                        <div className="form-group">
                            <div className="section-header collapsible" onClick={() => toggleSection('additionsInstructions')}>
                                <label className="form-label">
                                    Instructions & Info
                                    <ChevronDown
                                        size={14}
                                        className={`section-toggle-icon ${collapsedSections.additionsInstructions ? 'collapsed' : ''}`}
                                    />
                                </label>
                            </div>
                            <div className={`section-content ${collapsedSections.additionsInstructions ? 'collapsed' : ''}`}>
                                <div className="form-group">
                                    <p className="section-description">
                                        Use this to record step feeds or backsweetening. It will automatically calculate the ABV and gravity after blending a solution.
                                        <br />If adding a solid or soluble granule (such as sugar) with a negligible volume, a gravity reading must be taken normally.
                                        <br />
                                        <br /><strong>It is recommended to take a gravity reading prior to any addition(s).</strong>
                                        <br />
                                        <br />An entry here will create a new estimated gravity reading. When adding volume, all fields must filled out before the gravity reading is created. You cannot edit that gravity reading from the Gravity Readings section, but you can change the values entered here. 
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="name" className="form-label">
                                Starting Volume <small>(Required)</small>
                            </label>
                            <input
                                type="number"
                                id="volume"
                                name="volume"
                                className="form-input"
                                value={formState.volume}
                                onChange={handleChange}
                                maxLength={Validation.InputMaxLength}
                                placeholder="e.g., 5 gallons, 1 gallon"
                                required={true}
                                min={0}
                                step="0.001"
                            />
                            <p className="section-description">
                                In order to calculate gravity, you must provide a starting volume.
                            </p>
                        </div>

                        {formState.activity.filter(x => x.topic === ActivityTopicEnum.Addition && Number(x.addedVolume) > 0).length > 0 && (
                            <div className="form-group">
                                <label htmlFor="name" className="form-label">
                                    Final Volume
                                </label>
                                <input
                                    type="number"
                                    id="finalVolume"
                                    name="finalVolume"
                                    className="form-input"
                                    value={finalVolume.toFixed(3)}
                                    onChange={handleChange}
                                    maxLength={Validation.InputMaxLength}
                                    placeholder="Final volume after additions"
                                    required={true}
                                    readOnly={true}
                                />
                                <p className="section-description">
                                    Starting volume + total additions ({totalAddedVolume.toFixed(3)})
                                </p>
                            </div>
                        )}

                        <div className="additions-container">
                            <ActivityList
                                formData={formState}
                                setFormData={updateFormDataCallback}
                                topic={ActivityTopicEnum.Addition}
                                sectionInfoMessage=""
                                brewLogId={id}
                                showTopButton={true}
                                showBottomButton={true}
                                headerLabel="*Added Volume must be in the same unit as the Starting Volume"
                            />
                        </div>
                    </div>
                </div>

                {/* Important Dates */}
                <div className="form-section">
                    <div
                        className="section-header collapsible"
                        onClick={() => toggleSection('importantDates')}
                    >
                        <h3>
                            <ChevronDown
                                size={20}
                                className={`section-toggle-icon ${collapsedSections.importantDates ? 'collapsed' : ''}`}
                            />
                            Important Dates
                        </h3>
                    </div>
                    <div className={`section-content ${collapsedSections.importantDates ? 'collapsed' : ''}`}>
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
                </div>

                {/*Other Activities*/}
                <div className="form-section">
                    <div
                        className="section-header collapsible"
                        onClick={() => toggleSection('otherActivities')}
                    >
                        <h3>
                            <ChevronDown
                                size={20}
                                className={`section-toggle-icon ${collapsedSections.otherActivities ? 'collapsed' : ''}`}
                            />
                            Other Activities
                        </h3>
                    </div>
                    <div className={`section-content ${collapsedSections.otherActivities ? 'collapsed' : ''}`}>
                        <div className="form-group">
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
                </div>

                {/* Journal Entries */}
                <div className="form-section brewlog-journal">
                    <div
                        className="section-header collapsible"
                        onClick={() => toggleSection('journal')}
                    >
                        <h3>
                            <ChevronDown
                                size={20}
                                className={`section-toggle-icon ${collapsedSections.journal ? 'collapsed' : ''}`}
                            />
                            Journal
                        </h3>
                    </div>
                    <div className={`section-content ${collapsedSections.journal ? 'collapsed' : ''}`}>
                        <div className="form-group brewlog-journal-header">
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
                            <JournalEntryList brewLogId={id} />
                        </div>
                    </div>
                </div>

                {/* Notes */}
                <div className="form-section">
                    <div
                        className="section-header collapsible"
                        onClick={() => toggleSection('notes')}
                    >
                        <h3>
                            <ChevronDown
                                size={20}
                                className={`section-toggle-icon ${collapsedSections.notes ? 'collapsed' : ''}`}
                            />
                            Notes
                        </h3>
                    </div>
                    <div className={`section-content ${collapsedSections.notes ? 'collapsed' : ''}`}>
                        <div className="form-group">
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
                </div>

                {/* Copy */}
                <div className="form-section brewlog-copy">
                    <div
                        className="section-header collapsible"
                        onClick={() => toggleSection('copy')}
                    >
                        <h3>
                            <ChevronDown
                                size={20}
                                className={`section-toggle-icon ${collapsedSections.copy ? 'collapsed' : ''}`}
                            />
                            Make a Copy
                        </h3>
                    </div>
                    <div className={`section-content ${collapsedSections.copy ? 'collapsed' : ''}`}>
                        <p className="section-description">
                            Make a copy of this brew log. Use this if you are splitting up a batch or making a similar brew. All info will be duplicated into a new log, except for journal entries.
                        </p>
                        <div className="form-group">
                            <Button
                                type="button"
                                variant="secondary"
                                size="small"
                                onClick={() => makeCopy()}
                            >
                                <Copy size={16} />
                                Copy
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Archived */}
                <div className="form-section brewlog-archived">
                    <div
                        className="section-header collapsible"
                        onClick={() => toggleSection('archived')}
                    >
                        <h3>
                            <ChevronDown
                                size={20}
                                className={`section-toggle-icon ${collapsedSections.archived ? 'collapsed' : ''}`}
                            />
                            Archive
                        </h3>
                    </div>
                    <div className={`section-content ${collapsedSections.archived ? 'collapsed' : ''}`}>
                        <p className="section-description">
                            Mark this brew as archived when you're done with it. All info will be retained until you choose to delete it.
                        </p>
                        <div className="form-group">
                            <Button
                                type="button"
                                variant={formState.archived ? "primary" : "secondary"}
                                size="small"
                                onClick={() => updateFormData({ archived: formState.archived ? '' : getDate() })}
                            >
                                <Archive size={16} />
                                {formState.archived ? 'Archived' : 'Archive This Brew'}
                            </Button>
                            {formState.archived && (
                                <p className="field-hint" style={{ marginTop: '0.5rem' }}>
                                    Archived on {new Date(formState.archived).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </form>

            <FormFooter
                isEditing={isEditing}
                showCancel={!isEditing}
                cancelIcon={<X size={18} />}
                onCancel={() => navigate('/brewlogs')}
                showDelete={true}
                onDelete={onDelete}
            />
        </div>
    );
}

export default BrewLogForm;