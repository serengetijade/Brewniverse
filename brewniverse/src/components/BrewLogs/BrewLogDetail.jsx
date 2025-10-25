import { Beaker, Calendar, Edit, FileText } from 'lucide-react';
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../../Styles/Shared/brewLogDetail.css';
import { ActionTypes, useApp } from '../../contexts/AppContext';
import { getGravityActivities } from '../../utils/gravityCalculations';
import ActivityTimeline from '../Activity/ActivityTimeline';
import JournalEntryList from '../Journal/JournalEntryList';
import FormFooter from '../Layout/FormFooter';
import Button from '../UI/Button';
import AlcoholConversionChart from './AlcoholConversionChart';
import BrewLogStats from './BrewLogStats';
import GravityChart from './GravityChart';
import IngredientsSummary from './IngredientsSummary';
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
                    <Beaker size={64} />
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
                type: ActionTypes.DELETE_BREW_LOG,
                payload: id
            });
            navigate('/brewlogs');
        }
    };

    const handleCancel = () => {
        navigate('/brewlogs');
    };

    const gravityActivities = getGravityActivities(brewLog.activity || []);

    return (
        <div className="brewlog-detail">
            {/* Header Section */}
            <div className="brewlog-detail-header">
                <div className="brewlog-header-content">
                    <h1>{brewLog.name}</h1>
                    <div className="brewlog-meta">
                        <span className="brewlog-type-badge">
                            <Beaker size={18} />
                            {brewLog.type}
                        </span>
                        <span className="brewlog-date-info">
                            <Calendar size={16} />
                            Started {new Date(brewLog.dateCreated).toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric'
                            })}
                        </span>
                    </div>
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

            {/* Journal Entries Section */}
            <JournalEntryList brewLogId={id} />

            {/* Activity Timeline Section */}
            <div className="brewlog-content-section">
                <ActivityTimeline activity={brewLog.activity || []} />
            </div>

            {/* Footer */}
            <FormFooter
                isEditing={true}
                entityName="Brew Log"
                onCancel={handleCancel}
                onDelete={handleDelete}
                showDelete={false}
                collapsible={true}
                defaultExpanded={false}
                submitLabel="Edit Brew Log"
                submitIcon={<Edit size={16} />}
                cancelLabel="Back to List"
                onSubmit={() => navigate(`/brewlogs/${id}/edit`)}
            />
        </div>
    );
}

export default BrewLogDetail;

