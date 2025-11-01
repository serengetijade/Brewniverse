import { Atom, Barrel, BookOpen, Calendar, Info, Leaf, SquarePen } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getBrewTypeConfig } from '../../constants/BrewTypes';
import { useApp } from '../../contexts/AppContext';
import Button from '../UI/Button';
import Rating from '../UI/Rating';

function RecipeCard({ recipe, displayOption = 'grid' }) {
    const navigate = useNavigate();
    const { state } = useApp();
    const brewTypeConfig = getBrewTypeConfig(recipe.type);

    const getIngredientCount = () => {
        const primary = recipe.ingredientsPrimary?.length || 0;
        const secondary = recipe.ingredientsSecondary?.length || 0;
        const adjunct = recipe.ingredientsAdjunct?.length || 0;
        return primary + secondary + adjunct;
    };

    const getIngredientBreakdown = () => {
        return {
            primary: recipe.ingredientsPrimary?.length || 0,
            secondary: recipe.ingredientsSecondary?.length || 0,
            adjunct: recipe.ingredientsAdjunct?.length || 0
        };
    };

    // Count how many brew logs use this recipe
    const brewLogCount = state.brewLogs.filter(bl => bl.recipeId === recipe.id).length;

    const breakdown = getIngredientBreakdown();

    if (displayOption === 'grid') {
        return (
            <div className="item-card recipe-card" style={{ '--item-color': brewTypeConfig.color }}>
                <div className="item-card-accent"></div>
                <div className="item-card-header recipe-header">
                    <div className="recipe-type">
                        <span className="item-type-icon-large">{brewTypeConfig.icon}</span>
                        <div className="recipe-type-info">
                            <span className="type-text">{recipe.difficulty}<br/>{recipe.type}</span>
                            <div className="recipe-date">
                                <Calendar size={14} />
                                <span>{new Date(recipe.dateCreated).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                    <div className={`recipe-usage-badge ${brewLogCount === 0 ? 'unused' : ''}`}>
                        <BookOpen size={14} />
                        <span>{brewLogCount} {brewLogCount === 1 ? 'Brew' : 'Brews'}</span>
                    </div>
                </div>

                <div className="item-card-content">
                    <h3 className="recipe-name">{recipe.name}</h3>
                    {recipe.description && (
                        <p className="item-description">{recipe.description}</p>
                    )}

                    <Rating value={recipe.rating || 0} isEditing={false} />

                    <div className="item-card-stat-grid">
                        {breakdown.primary > 0 && (
                            <div className="item-card-stat">
                                <div className="item-card-stat-icon">
                                    <Atom size={16} />
                                </div>
                                <div className="item-card-stat-info">
                                    <span className="item-card-stat-label">Primary</span>
                                    <span className="item-card-stat-value">{breakdown.primary}</span>
                                </div>
                            </div>
                        )}
                        {breakdown.secondary > 0 && (
                            <div className="item-card-stat">
                                <div className="item-card-stat-icon">
                                    <Barrel size={16} />
                                </div>
                                <div className="item-card-stat-info">
                                    <span className="item-card-stat-label">Secondary</span>
                                    <span className="item-card-stat-value">{breakdown.secondary}</span>
                                </div>
                            </div>
                        )}
                        {breakdown.adjunct > 0 && (
                            <div className="item-card-stat">
                                <div className="item-card-stat-icon">
                                    <Leaf size={16} />
                                </div>
                                <div className="item-card-stat-info">
                                    <span className="item-card-stat-label">Adjunct</span>
                                    <span className="item-card-stat-value">{breakdown.adjunct}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {getIngredientCount() === 0 && (
                        <p className="recipe-no-ingredients">No ingredients added yet</p>
                    )}
                </div>

                <div className="item-card-actions">
                    <Button
                        variant="ghost"
                        size="medium"
                        onClick={() => navigate(`/recipes/${recipe.id}`)}
                    >
                        <Info size={18} />View
                    </Button>
                    <Button
                        variant="ghost"
                        size="medium"
                        onClick={() => navigate(`/recipes/${recipe.id}/edit`)}
                    >
                        <SquarePen size={18} />Edit
                    </Button>
                </div>
            </div>
        );
    } else {
        // List display mode
        return (
            <div className="item-card recipe-card list-view" style={{ '--item-color': brewTypeConfig.color }}>
                <div className="item-card-accent recipe-card-accent"></div>
                <div className="list-view-row">
                    <div className="list-view-body">
                        <div className="item-header recipe-header">
                            <div className="item-type recipe-type">
                                <span className="item-type-icon-large">{brewTypeConfig.icon}</span>
                                <h3 className="item-title recipe-name">{recipe.name}</h3>
                            </div>
                        </div>
                        <div className="item-content">
                            <div className="item-date recipe-date">
                                <Calendar size={14} />
                                <span>{new Date(recipe.dateCreated).toLocaleDateString()}</span>
                            </div>
                            <Rating value={recipe.rating || 0} isEditing={false} />
                        </div>
                    </div>

                    <div className="list-view-actions item-card-actions">
                        <Button
                            variant="ghost"
                            size="small"
                            onClick={() => navigate(`/recipes/${recipe.id}`)}
                        >
                            <Info size={16} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="small"
                            onClick={() => navigate(`/recipes/${recipe.id}/edit`)}
                        >
                            <SquarePen size={16} />
                        </Button>
                    </div>
                </div>
            </div>
        );
    }
}

export default RecipeCard;