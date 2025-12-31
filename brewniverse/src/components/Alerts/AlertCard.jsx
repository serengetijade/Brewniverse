import { Calendar, Check, CheckCircle2, Clock, SquarePen, Trash2 } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getTopicConfig } from '../../constants/ActivityTopics';
import { getPriorityConfig } from '../../constants/AlertPriority';
import { getBrewTypeIcon } from '../../constants/BrewTypes';
import { ActionTypes, useApp } from '../../contexts/AppContext';
import Button from '../UI/Button';

function AlertCard({ alert, editUrl, displayOption = 'grid' }) {
    const navigate = useNavigate();
    const { state, dispatch } = useApp();
    const brewLog = state.brewLogs?.find(x => x.id === alert.brewLogId);
    const topicConfig = getTopicConfig(alert.topic);
    const TopicIcon = topicConfig.icon;
    const priorityConfig = getPriorityConfig(alert.priority);
    const brewTypeIcon = brewLog ? getBrewTypeIcon(brewLog.type) : '🧪';

    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete "${alert.name}"?`)) {
            dispatch({
                type: ActionTypes.deleteAlert,
                payload: alert.id
            });
        }
    };

    const handleComplete = () => {
        if (alert.isCompleted) {
            if (window.confirm(`Are you sure you want to delete "${alert.name}"?`)) {
                dispatch({
                    type: ActionTypes.deleteAlert,
                    payload: alert.id
                });
            }
        } else {
            dispatch({
                type: ActionTypes.updateAlert,
                payload: { ...alert, isCompleted: true }
            });
        }
    };

    if (displayOption === 'grid') {
        const cardStyle = {
            '--item-color': topicConfig.color,
            ...(alert.priority !== 'low' && !alert.isCompleted ? { 
                backgroundColor: `${priorityConfig.color}15`,
                borderColor: priorityConfig.color
            } : {})
        };

        return (
            <div className={`item-card grid-view alert-card ${alert.isCompleted ? 'alert-completed-card' : ''}`}
                style={cardStyle}>
                <div className="item-card-accent"></div>
                <div className="item-card-header alert-header">
                    <div className="alert-header-left">
                        <div className="alert-title-row">
                            <div className="alert-topic-badge" style={{ backgroundColor: `${topicConfig.color}15`, color: topicConfig.color }}>
                                <TopicIcon size={16} />
                            </div>
                            <h3 className="item-title">{alert.name}</h3>
                        </div>
                        {alert.description &&
                            <p className="item-description">{alert.description}</p>
                        }
                    </div>
                    {alert.isCompleted && (
                        <div className="alert-completed-badge">
                            <CheckCircle2 size={14} />
                            <span>Completed</span>
                        </div>
                    )}
                </div>

                <div className="item-card-content">
                    <div className="alert-datetime-display">
                        <div className="alert-date-section">
                            <div className="alert-datetime-label">
                                <Calendar size={14} />
                                <span>Date</span>
                            </div>
                            <div className="alert-datetime-value">
                                {new Date(alert.date).toLocaleDateString([], {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}

                            </div>
                        </div>
                        <div className="alert-time-section">
                            <div className="alert-datetime-label">
                                <Clock size={14} />
                                <span>Time</span>
                            </div>
                            <div className="alert-datetime-value">
                                {new Date(alert.date).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </div>
                        </div>
                    </div>

                    {brewLog && (
                        <div 
                            className="alert-brewlog-reference clickable"
                            onClick={() => navigate(`/brewlogs/${alert.brewLogId}`)}
                        >
                            <span className="brew-type-icon">{brewTypeIcon}</span>
                            <span className="alert-brewlog-name">{brewLog.name}</span>
                        </div>
                    )}
                </div>

                <div className="item-card-actions">
                    <Button
                        variant="ghost"
                        size="medium"
                        onClick={() => navigate(editUrl)}
                    >
                        <SquarePen size={18} />Edit
                    </Button>
                    <Button
                        variant="ghost"
                        size="medium"
                        onClick={handleComplete}
                    >
                        {alert.isCompleted ? <Trash2 size={16} /> : (<><Check size={16}/>Complete</>)}
                    </Button>
                </div>
            </div>
        );
    } else {
        // List display mode
        const listCardStyle = {
            '--item-color': topicConfig.color,
            ...(alert.priority !== 'low' && !alert.isCompleted ? { 
                backgroundColor: `${priorityConfig.color}15`,
                borderColor: priorityConfig.color
            } : {})
        };

        return (
            <div className={`item-card alert-card list-view ${alert.isCompleted ? 'alert-completed-card' : ''}`}
                style={listCardStyle}>
                <div className="item-card-accent alert-card-accent"></div>
                <div className="list-view-row">
                    <div className="list-view-body">
                        <div className="item-header alert-header">
                            <div className="item-type alert-type">
                                <div className="alert-topic-badge" style={{ backgroundColor: `${topicConfig.color}15`, color: topicConfig.color }}>
                                    <TopicIcon size={16} />
                                </div>
                                <h3 className="item-title">{alert.name}</h3>
                            </div>
                        </div>
                        <div className="item-content">
                            <div className="item-date alert-date">
                                <Calendar size={14} />
                                {new Date(alert.date).toLocaleDateString('en-US', {
                                    hour: "numeric",
                                    minute: "numeric",
                                    hour12: true
                                })}
                            </div>
                            {alert.isCompleted && (
                                <div className="alert-completed-badge">
                                    <CheckCircle2 size={14} />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="list-view-actions item-card-actions">
                        <Button
                            variant="ghost"
                            size="medium"
                            onClick={() => navigate(editUrl)}
                        >
                            <SquarePen size={16} />
                        </Button>
                        <Button
                            variant={alert.isCompleted ? "error" : "success"}
                            size="medium"
                            onClick={handleComplete}
                        >
                            {alert.isCompleted ? <Trash2 size={16} /> : <CheckCircle2 size={16} />}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }
}

export default AlertCard;