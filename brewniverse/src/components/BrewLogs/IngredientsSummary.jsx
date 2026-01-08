import React from 'react';
import {
    Atom,
    Barrel,
    CirclePlus,
    Pill,
    Sparkles,
    TestTubeDiagonal,
    FlaskConical,
    FlaskRound,
    Leaf
} from 'lucide-react';
import { getActivitiesByTopic } from '../Activity/Activity';
import { ActivityTopicEnum } from '../../constants/ActivityTopics.jsx';
import '../../Styles/Shared/ingredientsSummary.css';

function IngredientsSummary({ brewLog }) {
    // Get ingredients and sort by order
    const primaryIngredients = (brewLog.ingredientsPrimary || []).sort((a, b) => {
        const orderA = a.order !== undefined ? a.order : 999999;
        const orderB = b.order !== undefined ? b.order : 999999;
        return orderA - orderB;
    });
    const secondaryIngredients = (brewLog.ingredientsSecondary || []).sort((a, b) => {
        const orderA = a.order !== undefined ? a.order : 999999;
        const orderB = b.order !== undefined ? b.order : 999999;
        return orderA - orderB;
    });

    // Get additions from activities
    const yeastActivities = getActivitiesByTopic(brewLog, ActivityTopicEnum.Yeast);
    const nutrientActivities = getActivitiesByTopic(brewLog, ActivityTopicEnum.Nutrient);
    const pecticEnzymeActivities = getActivitiesByTopic(brewLog, ActivityTopicEnum.PecticEnzyme);
    const acidActivities = getActivitiesByTopic(brewLog, ActivityTopicEnum.Acid);
    const baseActivities = getActivitiesByTopic(brewLog, ActivityTopicEnum.Base);
    const tanninActivities = getActivitiesByTopic(brewLog, ActivityTopicEnum.Tannin);
    const additionActivities = getActivitiesByTopic(brewLog, ActivityTopicEnum.Addition);

    // Check if we have any content to display
    const hasContent =
        primaryIngredients.length > 0 ||
        secondaryIngredients.length > 0 ||
        yeastActivities.length > 0 ||
        nutrientActivities.length > 0 ||
        pecticEnzymeActivities.length > 0 ||
        acidActivities.length > 0 ||
        baseActivities.length > 0 ||
        tanninActivities.length > 0 ||
        additionActivities.length > 0;

    if (!hasContent) {
        return (
            <div className="ingredients-summary-empty">
                <FlaskConical size={48} />
                <h3>No Ingredients Recorded</h3>
                <p>Start adding ingredients to track your brew composition.</p>
            </div>
        );
    }

    const renderIngredient = (ingredient) => (
        <div key={ingredient.id} className="main-ingredient-item">
            <span className="main-ingredient-name">{ingredient.name}</span>
            {ingredient.amount && ingredient.unit && (
                <span className="main-ingredient-amount">
                    {ingredient.amount} {ingredient.unit}
                </span>
            )}
        </div>
    );

    const renderActivityCard = (activity) => (
        <div key={activity.id} className="ingredient-card activity-card">
            <div className="ingredient-card-name">{activity.description || activity.name}</div>
            <div className="ingredient-card-date">
                {new Date(activity.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: '2-digit'
                })}
            </div>
        </div>
    );

    // Check if we have any additions to show
    const hasAdditions = yeastActivities.length > 0 ||
        nutrientActivities.length > 0 ||
        pecticEnzymeActivities.length > 0 ||
        acidActivities.length > 0 ||
        baseActivities.length > 0 ||
        tanninActivities.length > 0;

    return (
        <div className="ingredients-summary">
            <div className="ingredients-summary-header">
                <h2>Ingredients & Additions</h2>
                <p className="ingredients-summary-subtitle">
                    Complete composition breakdown of your brew
                </p>
            </div>

            {/* Main Ingredients Section */}
            {(primaryIngredients.length > 0 || secondaryIngredients.length > 0) && (
                <div className="main-ingredients-container">
                    {/* Primary Ingredients */}
                    {primaryIngredients.length > 0 && (
                        <div className="main-ingredient-section primary-section">
                            <div className="main-section-header">
                                <div className="main-icon-wrapper">
                                    <Atom size={22} />
                                </div>
                                <div className="main-section-info">
                                    <h3>Primary Ingredients</h3>
                                    <span className="ingredient-count-badge">
                                        {primaryIngredients.length} ingredient{primaryIngredients.length !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            </div>
                            <div className="main-ingredient-list">
                                {primaryIngredients.map(renderIngredient)}
                            </div>
                        </div>
                    )}

                    {/* Secondary Ingredients */}
                    {secondaryIngredients.length > 0 && (
                        <div className="main-ingredient-section secondary-section">
                            <div className="main-section-header">
                                <div className="main-icon-wrapper">
                                    <Barrel size={22} />
                                </div>
                                <div className="main-section-info">
                                    <h3>Secondary Ingredients</h3>
                                    <span className="ingredient-count-badge">
                                        {secondaryIngredients.length} ingredient{secondaryIngredients.length !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            </div>
                            <div className="main-ingredient-list">
                                {secondaryIngredients.map(renderIngredient)}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Other Additions Section */}
            {hasAdditions && (
                <>
                    <div className="additions-divider">
                        <span>Other Additions</span>
                    </div>
                    <div className="ingredients-grid">
                        {/* Yeast */}
                        {yeastActivities.length > 0 && (
                            <div className="ingredient-section yeast-section">
                                <div className="ingredient-section-header">
                                    <div className="ingredient-section-icon yeast-icon">
                                        <Sparkles size={20} />
                                    </div>
                                    <div className="ingredient-section-title">
                                        <h3>Yeast</h3>
                                        <span className="ingredient-count">{yeastActivities.length} addition{yeastActivities.length !== 1 ? 's' : ''}</span>
                                    </div>
                                </div>
                                <div className="ingredient-cards">
                                    {yeastActivities.map(renderActivityCard)}
                                </div>
                            </div>
                        )}

                        {/* Nutrients */}
                        {nutrientActivities.length > 0 && (
                            <div className="ingredient-section nutrient-section">
                                <div className="ingredient-section-header">
                                    <div className="ingredient-section-icon nutrient-icon">
                                        <Pill size={20} />
                                    </div>
                                    <div className="ingredient-section-title">
                                        <h3>Nutrients</h3>
                                        <span className="ingredient-count">{nutrientActivities.length} addition{nutrientActivities.length !== 1 ? 's' : ''}</span>
                                    </div>
                                </div>
                                <div className="ingredient-cards">
                                    {nutrientActivities.map(renderActivityCard)}
                                </div>
                            </div>
                        )}

                        {/* Pectic Enzyme */}
                        {pecticEnzymeActivities.length > 0 && (
                            <div className="ingredient-section enzyme-section">
                                <div className="ingredient-section-header">
                                    <div className="ingredient-section-icon enzyme-icon">
                                        <TestTubeDiagonal size={20} />
                                    </div>
                                    <div className="ingredient-section-title">
                                        <h3>Pectic Enzyme</h3>
                                        <span className="ingredient-count">{pecticEnzymeActivities.length} addition{pecticEnzymeActivities.length !== 1 ? 's' : ''}</span>
                                    </div>
                                </div>
                                <div className="ingredient-cards">
                                    {pecticEnzymeActivities.map(renderActivityCard)}
                                </div>
                            </div>
                        )}

                        {/* Acids */}
                        {acidActivities.length > 0 && (
                            <div className="ingredient-section acid-section">
                                <div className="ingredient-section-header">
                                    <div className="ingredient-section-icon acid-icon">
                                        <FlaskConical size={20} />
                                    </div>
                                    <div className="ingredient-section-title">
                                        <h3>Acids</h3>
                                        <span className="ingredient-count">{acidActivities.length} addition{acidActivities.length !== 1 ? 's' : ''}</span>
                                    </div>
                                </div>
                                <div className="ingredient-cards">
                                    {acidActivities.map(renderActivityCard)}
                                </div>
                            </div>
                        )}

                        {/* Bases */}
                        {baseActivities.length > 0 && (
                            <div className="ingredient-section base-section">
                                <div className="ingredient-section-header">
                                    <div className="ingredient-section-icon base-icon">
                                        <FlaskRound size={20} />
                                    </div>
                                    <div className="ingredient-section-title">
                                        <h3>Bases</h3>
                                        <span className="ingredient-count">{baseActivities.length} addition{baseActivities.length !== 1 ? 's' : ''}</span>
                                    </div>
                                </div>
                                <div className="ingredient-cards">
                                    {baseActivities.map(renderActivityCard)}
                                </div>
                            </div>
                        )}

                        {/* Tannins */}
                        {tanninActivities.length > 0 && (
                            <div className="ingredient-section tannin-section">
                                <div className="ingredient-section-header">
                                    <div className="ingredient-section-icon tannin-icon">
                                        <Leaf size={20} />
                                    </div>
                                    <div className="ingredient-section-title">
                                        <h3>Tannins</h3>
                                        <span className="ingredient-count">{tanninActivities.length} addition{tanninActivities.length !== 1 ? 's' : ''}</span>
                                    </div>
                                </div>
                                <div className="ingredient-cards">
                                    {tanninActivities.map(renderActivityCard)}
                                </div>
                            </div>
                        )}                        
                    </div>
                </>
            )}

            {/* Volume +/- Additions Section */}
            {additionActivities.length > 0 && (
                <>
                    <div className="additions-divider">
                        <span>Volume +/- Changes</span>
                    </div>

                    <div className="ingredient-section addition-section">
                        <div className="ingredient-section-header">
                            <div className="ingredient-section-icon addition-icon">
                                <CirclePlus size={20} />
                            </div>
                            <div className="ingredient-section-title">
                                <h3>Volume +/-</h3>
                                <span className="ingredient-count">{additionActivities.length} addition{additionActivities.length !== 1 ? 's' : ''}</span>
                            </div>
                        </div>
                        <div className="ingredient-cards">
                            {additionActivities.map(renderActivityCard)}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default IngredientsSummary;

