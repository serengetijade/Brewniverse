import { Bell, Calendar, Info, SquarePen, TrendingUp } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getBrewTypeConfig } from '../../constants/BrewTypes';
import { getCurrentAbv, getGravityActivities, getGravityFinal } from '../../utils/GravityCalculations';
import { ActivityTopicEnum, getActivitiesByTopic } from '../Activity/Activity';
import Button from '../UI/Button';
import Rating from '../UI/Rating';
import { getDaysSinceAsDescription } from '../../utils/DateUtils';
import { getTopicIcon } from '../../constants/ActivityTopics';
import { useApp } from '../../contexts/AppContext';

function BrewLogCard({ brewLog, displayOption = 'grid' }) {
    const navigate = useNavigate();
    const { state } = useApp();
    const brewTypeConfig = getBrewTypeConfig(brewLog.type);

    // Check if this brew log has any associated alerts
    const hasAnyAlerts = state.alerts.some(alert => alert.brewLogId === brewLog.id);

    // Calculate gravity-based values
    const gravityActivities = getGravityActivities(brewLog.activity || []);
    const currentAbv = getCurrentAbv(gravityActivities);
    const gravityFinal = getGravityFinal(gravityActivities);

    // Dates
    let bottledXdays = getDaysSinceAsDescription(brewLog.dateBottled);

    if (displayOption == 'grid')
        return (
            <div className="item-card grid-view brewlog-card" style={{ '--item-color': brewTypeConfig.color }}>
                <div className="item-card-accent"></div>
                <div className="item-card-header brewlog-header">
                    <div className="item-card-type brewlog-type">
                        <span className="item-type-icon-large">{brewTypeConfig.icon}</span>
                        <div className="brewlog-type-info">
                            <span className="type-text">{brewLog.type}</span>
                            <div className="brewlog-date">
                                <Calendar size={14} />
                                <span>{new Date(brewLog.dateCreated).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                    <div className="brewlog-status">
                        {brewLog.archived
                            ? (<span className="status-badge status-archived">Archived</span>)
                            : brewLog.dateBottled
                                ? (<span className="status-badge status-completed">Bottled</span>)
                                : (getActivitiesByTopic(brewLog, ActivityTopicEnum.DateRacked)).length > 0
                                    ? (<span className="status-badge status-racked">Secondary</span>)
                                    : (<span className="status-badge status-fermenting">Fermenting</span>)}
                    </div>
                </div>

                <div className="item-card-content">
                    <h3 className="brewlog-name">
                        {brewLog.name}
                        {hasAnyAlerts && <Button
                            variant="error"
                            size="small"
                            onClick={() => navigate(`/alerts`)}
                        >
                            <Bell size={16} />
                        </Button>}
                    </h3>
                    {brewLog.description && (
                        <p className="item-description">{brewLog.description}</p>
                    )}

                    <Rating value={brewLog.rating || 0} isEditing={false} />

                    {(currentAbv || gravityFinal) && (
                        <div className="item-card-stat-grid">
                            {currentAbv && (
                                <div className="item-card-stat">
                                    <div className="item-card-stat-icon">
                                        <TrendingUp size={16} />
                                    </div>
                                    <div className="item-card-stat-info">
                                        <span className="item-card-stat-label">ABV</span>
                                        <span className="item-card-stat-value">{currentAbv}%</span>
                                    </div>
                                </div>
                            )}
                            {brewLog.dateBottled ? (
                                <div className="item-card-stat">
                                    <div className="item-card-stat-icon">
                                        {getTopicIcon(ActivityTopicEnum.DateBottled)}
                                    </div>
                                    <div className="item-card-stat-info">
                                        <span className="item-card-stat-label">Bottled</span>
                                        <span className="item-card-stat-value">{bottledXdays}</span>
                                    </div>
                                </div>
                            )
                                :
                                (gravityFinal && (
                                    <div className="item-card-stat">
                                        <div className="item-card-stat-icon">
                                            {getTopicIcon(ActivityTopicEnum.Gravity)}
                                        </div>
                                        <div className="item-card-stat-info">
                                            <span className="item-card-stat-label">Current Gravity</span>
                                            <span className="item-card-stat-value">{gravityFinal}</span>
                                        </div>
                                    </div>
                                ))
                            }


                        </div>
                    )}
                </div>

                <div className="item-card-actions">
                    <Button
                        variant="ghost"
                        size="medium"
                        onClick={() => navigate(`/brewlogs/${brewLog.id}`)}
                    >
                        <Info size={18} />View
                    </Button>
                    <Button
                        variant="ghost"
                        size="medium"
                        onClick={() => navigate(`/brewlogs/${brewLog.id}/edit`)}
                    >
                        <SquarePen size={18} />Edit
                    </Button>
                </div>
            </div>
        );

    else return (
        <div className="item-card brewlog-card list-view" style={{ '--item-color': brewTypeConfig.color }}>
            <div className="item-card-accent brewlog-card-accent"></div>
            <div className="list-view-row">
                <div className="list-view-body">
                    <div className="item-header brewlog-header">
                        <div className="item-type">
                            <span className="item-type-icon-large">{brewTypeConfig.icon}</span>
                            <h3 className="item-title">{brewLog.name}
                            </h3>
                        </div>
                    </div>
                    <div className="item-content">
                        <div className="item-date brewlog-date">
                            <Calendar size={14} />
                            <span>{new Date(brewLog.dateCreated).toLocaleDateString()}</span>
                        </div>
                        <Rating value={brewLog.rating || 0} isEditing={false} />
                    </div>
                </div>
                <div className="list-view-actions item-card-actions">
                    <Button
                        variant="ghost"
                        size="small"
                        onClick={() => navigate(`/brewlogs/${brewLog.id}`)}
                    >
                        <Info size={16} />
                    </Button>
                    {hasAnyAlerts && <Button
                        variant="error"
                        size="small"
                        onClick={() => navigate(`/alerts`)}
                    >
                        <Bell size={16} />
                    </Button>}
                    <Button
                        variant="ghost"
                        size="small"
                        onClick={() => navigate(`/brewlogs/${brewLog.id}/edit`)}
                    >
                        <SquarePen size={16} />
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default BrewLogCard;