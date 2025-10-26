import { Calendar, ChefHat, Droplet, Edit, RotateCcw, TrendingUp } from 'lucide-react';
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../../Styles/RecipeDetail.css';
import { ActionTypes, useApp } from '../../contexts/AppContext';
import IngredientDisplay from '../Ingredients/IngredientDisplay';
import InstructionCheckbox from '../Instructions/InstructionCheckbox';
import FormFooter from '../Layout/FormFooter';
import Button from '../UI/Button';

function RecipeDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { state, dispatch } = useApp();

    const recipe = state.recipes.find(r => r.id === id);
    const recipeProgress = state.recipeProgress[id] || { completedSteps: [] };

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
                type: ActionTypes.deleteRecipe,
                payload: id
            });
            navigate('/recipes');
        }
    };

    const handleToggleStep = (stepIndex) => {
        dispatch({
            type: ActionTypes.toggleRecipeStep,
            payload: { recipeId: id, stepIndex }
        });
    };

    const handleResetProgress = () => {
        if (confirm('Reset your progress on this recipe?')) {
            dispatch({
                type: ActionTypes.resetRecipeProgress,
                payload: id
            });
        }
    };

    const isStepCompleted = (stepIndex) => {
        return recipeProgress.completedSteps.includes(stepIndex);
    };

    const calculateProgress = () => {
        if (!recipe.instructions || recipe.instructions.length === 0) return 0;
        const completed = recipeProgress.completedSteps.length;
        const total = recipe.instructions.length;
        return Math.round((completed / total) * 100);
    };

    // Get brew logs that use this recipe
    const getConnectedBrewLogs = () => {
        return state.brewLogs.filter(brewLog => brewLog.recipeId === id);
    };

    const hasIngredients =
        (recipe.ingredientsAdjunct && recipe.ingredientsAdjunct.length > 0) ||
        (recipe.ingredientsPrimary && recipe.ingredientsPrimary.length > 0) ||
        (recipe.ingredientsSecondary && recipe.ingredientsSecondary.length > 0);

    const hasInstructions = recipe.instructions && recipe.instructions.length > 0 && recipe.instructions[0] !== '';

    const progress = calculateProgress();

    return (
        <div className="recipe-detail">
            <div className="recipe-detail-card">
                {/* Hero Section */}
                <div className="recipe-hero">
                    <h1>{recipe.name}</h1>
                    <div className="recipe-meta">
                        <div className="recipe-meta-item">
                            <Calendar size={18} />
                            <span>Created {new Date(recipe.dateCreated).toLocaleDateString()}</span>
                        </div>
                        {recipe.difficulty && (
                            <div className="recipe-meta-item">
                                <ChefHat size={18} />
                                <span>{recipe.difficulty}</span>
                            </div>
                        )}
                        {recipe.estimatedABV && (
                            <div className="recipe-meta-item">
                                <TrendingUp size={18} />
                                <span>{recipe.estimatedABV}% ABV</span>
                            </div>
                        )}
                        {recipe.volume && (
                            <div className="recipe-meta-item">
                                <Droplet size={18} />
                                <span>{recipe.volume}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Content Section */}
                <div className="recipe-content">
                    {/* Description */}
                    {recipe.description && (
                        <div className="recipe-section">
                            <p className="recipe-description">{recipe.description}</p>
                        </div>
                    )}

                    {/* Ingredients Section */}
                    {hasIngredients && (
                        <div className="recipe-section">
                            <h2 className="recipe-section-title">
                                <ChefHat size={24} />
                                Ingredients
                            </h2>
                            <div className="ingredients-grid">
                                <IngredientDisplay
                                    ingredients={recipe.ingredientsPrimary}
                                    title="Primary Ingredients"
                                />
                                <IngredientDisplay
                                    ingredients={recipe.ingredientsSecondary}
                                    title="Secondary Ingredients"
                                />
                            </div>
                        </div>
                    )}

                    {/* Instructions Section */}
                    {hasInstructions && (
                        <div className="recipe-section">
                            <h2 className="recipe-section-title">Instructions</h2>

                            {/* Progress Tracker */}
                            {recipe.instructions.length > 0 && (
                                <div className="progress-container">
                                    <div className="progress-header">
                                        <span className="progress-label">Your Progress</span>
                                        <span className="progress-percentage">{progress}%</span>
                                    </div>
                                    <div className="progress-bar-bg">
                                        <div
                                            className="progress-bar-fill"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    {progress > 0 && (
                                        <Button
                                            variant="ghost"
                                            size="small"
                                            onClick={handleResetProgress}
                                            className="reset-progress-btn"
                                        >
                                            <RotateCcw size={14} />
                                            Reset Progress
                                        </Button>
                                    )}
                                </div>
                            )}

                            <div className="recipe-steps">
                                {recipe.instructions.map((instruction, index) => (
                                    <InstructionCheckbox
                                        key={index}
                                        stepIndex={index}
                                        instruction={instruction}
                                        isCompleted={isStepCompleted(index)}
                                        onToggle={handleToggleStep}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Notes Section */}
                    {recipe.notes && (
                        <div className="recipe-section">
                            <div className="recipe-notes">
                                <h4>Notes & Tips</h4>
                                <p>{recipe.notes}</p>
                            </div>
                        </div>
                    )}

                    {/* Connected Brew Logs */}
                    {getConnectedBrewLogs().length > 0 && (
                        <div className="recipe-section">
                            <h2 className="recipe-section-title">Connected Brew Logs</h2>
                            <div className="connected-brews">
                                {getConnectedBrewLogs().map((brewLog) => (
                                    <div
                                        key={brewLog.id}
                                        className="connected-brew-card"
                                        onClick={() => navigate(`/brewlogs/${brewLog.id}`)}
                                    >
                                        <div className="brew-card-header">
                                            <h3 className="brew-card-title">{brewLog.name}</h3>
                                            <span className="brew-card-status">{brewLog.type}</span>
                                        </div>
                                        <p className="brew-card-info">
                                            Created {new Date(brewLog.dateCreated).toLocaleDateString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <FormFooter
                isEditing={true}
                entityName="Recipe"
                onCancel={() => navigate('/recipes')}
                onDelete={handleDelete}
                onSubmit={() => navigate(`/recipes/${id}/edit`)}
                showDelete={false}
                collapsible={true}
                defaultExpanded={false}
                submitLabel="Edit Recipe"
                submitIcon={<Edit size={16} />}
                cancelLabel="Back to Recipes"
            />
        </div>
    );
}

export default RecipeDetail;
