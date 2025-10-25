import { BookOpen, Calendar, CheckCircle2, Clock, Trash2 } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getTopicConfig } from '../../constants/ActivityTopics';
import { ActionTypes, useApp } from '../../contexts/AppContext';
import Button from '../UI/Button';

function AlertCard({ alert, editUrl }) {
    const navigate = useNavigate();
    const { state, dispatch } = useApp();
    const brewLog = state.brewLogs.find(x => x.id === alert.brewLogId);
    const topicConfig = getTopicConfig(alert.topic);
    const TopicIcon = topicConfig.icon;

    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete "${alert.name}"?`)) {
            dispatch({
                type: ActionTypes.DELETE_ALERT,
                payload: alert.id
            });
        }
    };

    const handleComplete = () => {
        if (alert.isCompleted) {
            if (window.confirm(`Are you sure you want to delete "${alert.name}"?`)) {
                dispatch({
                    type: ActionTypes.DELETE_ALERT,
                    payload: alert.id
                });
            }
        } else {
            dispatch({
                type: ActionTypes.UPDATE_ALERT,
                payload: { ...alert, isCompleted: true }
            });
        }
    };

    return (
        <div className={`item-card alert-card ${alert.isCompleted ? 'alert-completed-card' : ''}`}
            style={{ '--item-color': topicConfig.color }}>
            <div className="alert-card-accent"></div>
            <div className="alert-header">
                <div className="alert-header-left">
                    <div className="alert-title-row">
                        <div className="alert-topic-badge" style={{ backgroundColor: `${topicConfig.color}15`, color: topicConfig.color }}>
                            <TopicIcon size={16} />
                        </div>
                        <h3 className="alert-name">{alert.name}</h3>
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

            <div className="item-content">
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

                <div className="alert-brewlog-reference">
                    <BookOpen size={14} />
                    <span>Brew: <span className="alert-brewlog-name">{brewLog?.name || 'Unknown Brew'}</span></span>
                </div>
            </div>

            <div className="item-actions">
                <Button
                    variant="outline"
                    size="small"
                    onClick={() => navigate(`/brewlogs/${alert.brewLogId}`)}
                >
                    <BookOpen size={16} />
                </Button>
                <Button
                    variant="outline"
                    size="small"
                    onClick={() => navigate(editUrl)}
                >
                    Edit
                </Button>
                <Button
                    variant={alert.isCompleted ? "error" : "success"}
                    size="small"
                    onClick={handleComplete}
                >
                    {alert.isCompleted ? <Trash2 size={16} /> : "Complete"}
                </Button>
            </div>
        </div>
    );
}

export default AlertCard;