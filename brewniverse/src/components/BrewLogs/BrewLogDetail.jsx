import { BookOpen, ChartLine, ChevronDown, ChevronUp, Edit, FileText, FlaskConical, ListOrdered, NotebookPen, Scale, Star, TrendingUp } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../../Styles/BrewLogDetail.css';
import { ActionTypes, useApp } from '../../contexts/AppContext';
import { getGravityActivities } from '../../utils/GravityCalculations';
import ActivityTimeline from '../Activity/ActivityTimeline';
import JournalEntryList from '../Journal/JournalEntryList';
import FormFooter from '../Layout/FormFooter';
import Button from '../UI/Button';
import AlcoholConversionChart from './AlcoholConversionChart';
import BrewLogStats, { BrewStatusBadge } from './BrewLogStats';
import GravityStatsAndChart from './GravityStatsAndChart';
import IngredientsSummary from './IngredientsSummary';
import RatingsChart from './RatingsChart';
import SugarProgressChart from './SugarProgressChart';

const COLLAPSED_SECTIONS_STORAGE_KEY = 'brewLogDetailCollapsedSections';

const allSections = [
    'statistics', 'gravity', 'charts', 'ingredients', 'notes', 'journal', 'ratings', 'activity'
];

function BrewLogDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { state, dispatch } = useApp();

    // Collapsible section state with localStorage persistence
    const [collapsedSections, setCollapsedSections] = useState(() => {
        const saved = localStorage.getItem(COLLAPSED_SECTIONS_STORAGE_KEY);
        return saved ? JSON.parse(saved) : {};
    });

    const toggleSection = (sectionName) => {
        setCollapsedSections(prev => {
            const newState = {
                ...prev,
                [sectionName]: !prev[sectionName]
            };
            localStorage.setItem(COLLAPSED_SECTIONS_STORAGE_KEY, JSON.stringify(newState));
            return newState;
        });
    };

    const collapseAll = () => {
        const newState = {};
        allSections.forEach(section => {
            newState[section] = true;
        });
        setCollapsedSections(newState);
        localStorage.setItem(COLLAPSED_SECTIONS_STORAGE_KEY, JSON.stringify(newState));
    };

    const hasExpandedSections = () => {
        if (Object.keys(collapsedSections).length === 0) return true;
        return allSections.some(section => collapsedSections[section] !== true);
    };

    const brewLog = state.brewLogs?.find(log => log.id === id);

    if (!brewLog) {
        return (
            <div className="brewlog-detail">
                <div className="brewlog-empty-state">
                    <BookOpen size={64} />
                    <h3>Brew Log Not Found</h3>
                    <p>The brew log you're looking for doesn't exist.</p>
                    <Button variant="primary" onClick={() => navigate('/brewlogs')}>
                        Back to Brew Logs
                    </Button>
                </div>
            </div>
        );
    }

    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete "${brewLog.name}"?`)) {
            dispatch({
                type: ActionTypes.deleteBrewLog,
                payload: id
            });
            navigate('/brewlogs');
        }
    };

    const gravityActivities = getGravityActivities(brewLog.activity || []);
    const journalEntriesCount = (state.journalEntries || []).filter(entry => entry.brewLogId === id).length;

    const renderSectionHeader = (sectionName, icon, title, headerContent = null) => (
        <div
            className="section-header collapsible"
            onClick={() => toggleSection(sectionName)}
        >
            <h3>
                <ChevronDown
                    size={20}
                    className={`section-toggle-icon ${collapsedSections[sectionName] ? 'collapsed' : ''}`}
                />
                {icon}
                {title}
            </h3>
            {headerContent}
        </div>
    );

    const sectionContentClass = (sectionName) =>
        `section-content ${collapsedSections[sectionName] ? 'collapsed' : ''}`;

    return (
        <div className="brewlog-detail main-content-container">
            {/* Header Section */}
            <div className="main-content-section brewlog-detail-header">
                <div className="brewlog-header-content">
                    <h1>{brewLog.name}</h1>
                </div>
                <div className="brewlog-header-actions">
                    <Button
                        variant="secondary"
                        onClick={() => navigate(`/brewlogs/${id}/edit`)}
                    >
                        <Edit size={16} />
                        Edit
                    </Button>
                </div>
            </div>

            <div className="main-content-section">
                {/* Description Section */}
                {brewLog.description && (
                    <div className="brewlog-description">
                        {brewLog.description}
                    </div>
                )}

                {hasExpandedSections() && (
                    <div className="brewlog-content-section collapse-all-container">
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

                {/* Statistics Section */}
                <div className="brewlog-content-section">
                    {renderSectionHeader('statistics', <ChartLine size={20} />, 'Brew Statistics', <BrewStatusBadge brewLog={brewLog} />)}
                    <div className={sectionContentClass('statistics')}>
                        <BrewLogStats brewLog={brewLog} showHeader={false} />
                    </div>
                </div>

                {/* Gravity Stats & Chart Section */}
                <div className="brewlog-content-section">
                    {renderSectionHeader('gravity', <Scale size={20} />, 'Gravity Stats')}
                    <div className={sectionContentClass('gravity')}>
                        <GravityStatsAndChart gravityActivities={gravityActivities} />
                    </div>
                </div>

                {/* Alcohol & Sugar Charts Section */}
                <div className="brewlog-content-section">
                    {renderSectionHeader('charts', <TrendingUp size={20} />, 'Alcohol & Sugar')}
                    <div className={sectionContentClass('charts')}>
                        <div className="brewlog-charts-row">
                            <AlcoholConversionChart gravityActivities={gravityActivities} />
                            <SugarProgressChart gravityActivities={gravityActivities} />
                        </div>
                    </div>
                </div>

                {/* Ingredients Section */}
                <div className="brewlog-content-section">
                    {renderSectionHeader('ingredients', <FlaskConical size={20} />, 'Ingredients & Additions')}
                    <div className={sectionContentClass('ingredients')}>
                        {brewLog.recipeId &&
                            <div className="brewlog-recipe-link">
                                <Button
                                    variant="secondary"
                                    onClick={() => navigate(`/recipes/${brewLog.recipeId}/`)}
                                    fullWidth={true}
                                >
                                    <Edit size={16} />
                                    Go to Recipe
                                </Button>
                            </div>}
                        <IngredientsSummary brewLog={brewLog} showHeader={false} />
                    </div>
                </div>

                {/* Notes Section */}
                {brewLog.notes && (
                    <div className="brewlog-content-section">
                        {renderSectionHeader('notes', <FileText size={20} />, 'Notes')}
                        <div className={sectionContentClass('notes')}>
                            <div className="brewlog-notes">
                                <div className="brewlog-notes-content">
                                    {brewLog.notes}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Journal Entries Section */}
                {journalEntriesCount > 0 && (
                    <div className="brewlog-content-section">
                        {renderSectionHeader('journal', <NotebookPen size={20} />, 'Journal')}
                        <div className={sectionContentClass('journal')}>
                            <div className="brewlog-notes">
                                <JournalEntryList brewLogId={id} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Ratings Section */}
                {journalEntriesCount > 0 && (
                <div className="brewlog-content-section">
                    {renderSectionHeader('ratings', <Star size={20} />, 'Ratings')}
                    <div className={sectionContentClass('ratings')}>
                        <RatingsChart brewLogId={id} showTitle={false} />
                    </div>
                </div>
                )}

                {/* Activity Timeline Section */}
                <div className="brewlog-content-section">
                    {renderSectionHeader('activity', <ListOrdered size={20} />, 'Activity Timeline')}
                    <div className={sectionContentClass('activity')}>
                        <ActivityTimeline activity={brewLog.activity || []} showTitle={false} />
                    </div>
                </div>

                {/* Footer */}
                <FormFooter
                    isEditing={false}
                    showCancel={true}
                    cancelLabel="List"
                    onCancel={() => navigate(`/brewlogs`)}
                    showDelete={false}
                    onDelete={handleDelete}
                    submitLabel="Edit"
                    submitIcon={<Edit size={16} />}
                    onSubmit={() => navigate(`/brewlogs/${id}/edit`)}
                />
            </div>
        </div>
    );
}

export default BrewLogDetail;
