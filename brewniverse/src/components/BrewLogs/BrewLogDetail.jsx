import { ArrowLeft, BookOpen, Calendar, Edit, FileText, NotebookPen } from 'lucide-react';
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../../Styles/BrewLogDetail.css';
import { ActionTypes, useApp } from '../../contexts/AppContext';
import { getGravityActivities } from '../../utils/GravityCalculations';
import ActivityTimeline from '../Activity/ActivityTimeline';
import JournalEntryList from '../Journal/JournalEntryList';
import FormFooter from '../Layout/FormFooter';
import Button from '../UI/Button';
import AlcoholConversionChart from './AlcoholConversionChart';
import BrewLogStats from './BrewLogStats';
import GravityChart from './GravityChart';
import IngredientsSummary from './IngredientsSummary';
import RatingsChart from './RatingsChart';
import SugarProgressChart from './SugarProgressChart';

function BrewLogDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { state, dispatch } = useApp();

    const brewLog = state.brewLogs.find(log => log.id === id);

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
    const journalEntriesCount = state.journalEntries.filter(entry => entry.brewLogId === id).length;

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

                {/* Statistics Section */}
                <div className="brewlog-content-section">
                    <BrewLogStats brewLog={brewLog} />
                </div>

                {/* Gravity Chart Section */}
                <div className="brewlog-content-section">
                    <GravityChart gravityActivities={gravityActivities} />
                </div>

                {/* Alcohol & Sugar Charts Row */}
                <div className="brewlog-charts-row">
                    <AlcoholConversionChart gravityActivities={gravityActivities} />
                    <SugarProgressChart gravityActivities={gravityActivities} />
                </div>

                {/* Ingredients Section */}
                {brewLog.recipeId &&
                    <div className="brewlog-content-section">
                        <Button
                            variant="secondary"
                            onClick={() => navigate(`/recipes/${brewLog.recipeId}/`)}
                            fullWidth={true}
                        >
                            <Edit size={16} />
                            Go to Recipe
                        </Button>
                    </div>}
                <div className="brewlog-content-section">
                    <IngredientsSummary brewLog={brewLog} />
                </div>

                {/* Notes Section */}
                {brewLog.notes && (
                    <div className="brewlog-content-section">
                        <div className="brewlog-notes">
                            <h3>
                                <FileText size={20} />
                                Notes
                            </h3>
                            <div className="brewlog-notes-content">
                                {brewLog.notes}
                            </div>
                        </div>
                    </div>
                )}

                {/* Journal Entries & Ratings */}
                {journalEntriesCount > 0 &&
                    (<div className="brewlog-content-section">
                        <div className="brewlog-notes">
                            <h3>
                                <NotebookPen size={20} />
                                Journal
                            </h3>
                            <JournalEntryList brewLogId={id} />
                        </div>
                    </div>
                    )}

                <div className="brewlog-content-section">
                    <RatingsChart brewLogId={id} />
                </div>

                {/* Activity Timeline Section */}
                <div className="brewlog-content-section">
                    <ActivityTimeline activity={brewLog.activity || []} />
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

