import { ChevronDown, ChevronUp, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../../Styles/RecipeForm.css';
import BrewTypes from '../../constants/BrewTypes';
import { Validation } from '../../constants/ValidationConstants';
import { ActionTypes, useApp } from '../../contexts/AppContext';
import Recipe from '../../models/Recipe';
import IngredientList from '../Ingredients/IngredientList';
import InstructionForm from '../Instructions/InstructionForm';
import FormFooter from '../Layout/FormFooter';
import FormHeader from '../Layout/FormHeader';
import Button from '../UI/Button';
import Rating from '../UI/Rating';

function RecipeForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { state, dispatch } = useApp();
    const isEditing = Boolean(id);

    // Collapsible section state with localStorage persistence
    const [collapsedSections, setCollapsedSections] = useState(() => {
        const saved = localStorage.getItem('recipeFormCollapsedSections');
        return saved ? JSON.parse(saved) : {};
    });

    const toggleSection = (sectionName) => {
        setCollapsedSections(prev => {
            const newState = {
                ...prev,
                [sectionName]: !prev[sectionName]
            };
            localStorage.setItem('recipeFormCollapsedSections', JSON.stringify(newState));
            return newState;
        });
    };

    const collapseAll = () => {
        const allSections = ['basicInfo', 'primaryIngredients', 'secondaryIngredients', 'instructions', 'notes', 'connectedBrewLogs'];
        const newState = {};
        allSections.forEach(section => {
            newState[section] = true;
        });
        setCollapsedSections(newState);
        localStorage.setItem('recipeFormCollapsedSections', JSON.stringify(newState));
    };

    const hasExpandedSections = () => {
        if (Object.keys(collapsedSections).length === 0) return true;
        return Object.values(collapsedSections).some(isCollapsed => isCollapsed !== true);
    };

    const [formState, setFormState] = useState(() => new Recipe());

    useEffect(() => {
        const recipe = state.recipes.find(r => r.id === id);
        if (recipe) {
            setFormState(Recipe.fromJSON({
                ...recipe,
                instructions: recipe.instructions && recipe.instructions.length > 0 ? recipe.instructions : ['']
            }));
        }
    }, [id, state.recipes]);

    const onDelete = (e) => {
        e.preventDefault();

        const brewLogs = state.brewLogs.filter(b => b.recipeId === id);
        if (brewLogs.length > 0) {
            // Delete from connected brew logs
            brewLogs.forEach(brewLog => {
                dispatch({
                    type: ActionTypes.updateBrewLog,
                    payload: { ...brewLog, recipeId: '' }
                });
            });
        }
        else {
            if (!window.confirm('Are you sure you want to delete this recipe?')) return;
        }

        dispatch({ type: ActionTypes.deleteRecipe, payload: id });
        navigate('/recipes');
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        const recipeData = formState.toJSON();

        dispatch({
            type: ActionTypes.updateRecipe,
            payload: { ...recipeData, id }
        });
        navigate(`/recipes/${id}`);
    };

    const updateFormData = (updates) => {
        const updatedData = Recipe.fromJSON({ ...formState.toJSON(), ...updates });
        setFormState(updatedData);

        dispatch({
            type: ActionTypes.updateRecipe,
            payload: { ...updatedData.toJSON(), id }
        });
    };

    const updateFormDataCallback = (updaterFn) => {
        const currentData = formState.toJSON();
        const updatedData = typeof updaterFn === 'function' ? updaterFn(currentData) : updaterFn;
        const newRecipe = Recipe.fromJSON(updatedData);
        setFormState(newRecipe);

        dispatch({
            type: ActionTypes.updateRecipe,
            payload: { ...newRecipe.toJSON(), id }
        });
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
        <div className="main-content-container form-container form-with-footer">
            <FormHeader
                isEditing={isEditing}
                name={formState.name}
                entityName="Recipe"
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
                                Recipe Name *
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
                                value={formState.dateCreated}
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

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="difficulty" className="form-label">
                                    Difficulty Level
                                </label>
                                <select
                                    id="difficulty"
                                    name="difficulty"
                                    className="form-select"
                                    value={formState.difficulty}
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
                                    value={formState.volume}
                                    onChange={handleChange}
                                    maxLength={Validation.InputMaxLength}
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
                                    value={formState.estimatedABV}
                                    onChange={handleChange}
                                    min={Validation.NumberMin}
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
                                value={formState.description}
                                onChange={handleChange}
                                maxLength={Validation.TextareaMaxLength}
                                placeholder="Brief description of this recipe"
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
                        sectionInfoMessage="List ingredients used during primary fermentation. No primary ingredients added yet."
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
                        sectionInfoMessage="List ingredients used during secondary fermentation or any used to backsweeten your brew. No secondary ingredients added yet."
                        isCollapsible={true}
                        isCollapsed={collapsedSections.secondaryIngredients}
                        onToggle={() => toggleSection('secondaryIngredients')}
                    >
                    </IngredientList>
                </div>

                {/* Instructions */}
                <div className="form-section">
                    <InstructionForm
                        instructions={formState.instructions}
                        onInstructionsChange={handleInstructionsChange}
                        isCollapsible={true}
                        isCollapsed={collapsedSections.instructions}
                        onToggle={() => toggleSection('instructions')}
                    />
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
                            Notes & Tips
                        </h3>
                    </div>
                    <div className={`section-content ${collapsedSections.notes ? 'collapsed' : ''}`}>
                        <div className="form-group">
                            <label htmlFor="notes" className="form-label">
                                Notes & Tips
                            </label>
                            <textarea
                                id="notes"
                                name="notes"
                                className="form-textarea"
                                value={formState.notes}
                                onChange={handleChange}
                                maxLength={Validation.TextareaMaxLength}
                                placeholder="Additional notes, tips, and observations for this recipe"
                                rows={4}
                            />
                        </div>
                    </div>
                </div>

                {/* Connected Brew Logs (only show when editing) */}
                {isEditing && (
                    <div className="form-section">
                        <div
                            className="section-header collapsible"
                            onClick={() => toggleSection('connectedBrewLogs')}
                        >
                            <h3>
                                <ChevronDown
                                    size={20}
                                    className={`section-toggle-icon ${collapsedSections.connectedBrewLogs ? 'collapsed' : ''}`}
                                />
                                Connected Brew Logs
                            </h3>
                        </div>
                        <div className={`section-content ${collapsedSections.connectedBrewLogs ? 'collapsed' : ''}`}>
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
                    </div>
                )}
            </form>

            <FormFooter
                isEditing={isEditing}
                cancelIcon={<X size={18} />}
                onCancel={() => navigate(`/recipes`)}
                showCancel={!isEditing}
                showDelete={true}
                onDelete={onDelete}
            />
        </div>
    );
}

export default RecipeForm;