import React, { useState } from 'react';
import { 
    ArrowUpDown, 
    ArrowUp,
    ArrowDown,
    Clock, 
    CircleEllipsis,
    Bell, 
    Scale,
    Droplet,
    Grape,
    Sparkles,
    BottleWine,
    PlayCircle,
    MoveVertical,
    Shield,
    Pill,
    Activity as ActivityIcon
} from 'lucide-react';
import '../../Styles/Shared/activityTimeline.css';

function ActivityTimeline({ formData, showActivityTimeline, setShowActivityTimeline }) {
    const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'

    const formatDate = (dateString) => {
        if (!dateString) return '';
        let date;
        if (dateString.includes('T')) {
            date = new Date(dateString);
        } else {
            const [year, month, day] = dateString.split('-');
            date = new Date(year, month - 1, day);
        }
        const datePart = date.toLocaleDateString(undefined, { year: '2-digit', month: '2-digit', day: '2-digit' });
        const timePart = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true });
        return `${datePart} ${timePart}`;
    };

    const getTopicIcon = (topic, size = 18) => {
        const topicLower = topic?.toLowerCase() || '';
        switch (topicLower) {
            case 'gravity':
                return <Scale size={size} />;
            case 'yeast':
                return <CircleEllipsis size={size} />;
            case 'nutrient':
                return <Pill size={size} />;
            case 'pecticenzyme':
                return <Grape size={size} />;
            case 'acid':
                return <Droplet size={size} />;
            case 'base':
                return <Droplet size={size} />;
            case 'tannin':
                return <Sparkles size={size} />;
            case 'ph':
                return <ActivityIcon size={size} />;
            case 'datebottled':
                return <BottleWine size={size} />;
            case 'datecreated':
                return <PlayCircle size={size} />;
            case 'dateracked':
                return <MoveVertical size={size} />;
            case 'datestabilized':
                return <Shield size={size} />;
            default:
                return <ActivityIcon size={size} />;
        }
    };

    const getIconColor = (topic) => {
        const topicLower = topic?.toLowerCase() || '';
        switch (topicLower) {
            case 'gravity':
                return '#3b82f6'; // blue
            case 'yeast':
                return '#8b5cf6'; // purple
            case 'nutrient':
                return '#10b981'; // green
            case 'pecticenzyme':
                return '#a855f7'; // purple
            case 'acid':
                return '#eab308'; // yellow
            case 'base':
                return '#06b6d4'; // cyan
            case 'tannin':
                return '#f59e0b'; // amber
            case 'ph':
                return '#ec4899'; // pink
            case 'datebottled':
                return '#14b8a6'; // teal
            case 'datecreated':
                return '#22c55e'; // green
            case 'dateracked':
                return '#6366f1'; // indigo
            case 'datestabilized':
                return '#84cc16'; // lime
            default:
                return '#6b7280'; // gray
        }
    };

    const toggleSortOrder = (e) => {
        e.stopPropagation();
        setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    };

    const sortedActivities = [...formData.activity].sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    const isDateInFuture = (dateString) => {
        return new Date(dateString) > Date.now();
    };

    return (
        <div className="card mt-4">
            <div 
                className="card-header timeline-header" 
                onClick={() => setShowActivityTimeline(!showActivityTimeline)}
            >
                <div className="timeline-header-content">
                    <h3 className="timeline-title">Activity Timeline {showActivityTimeline ? '▼' : '▶'}</h3>
                    {showActivityTimeline && formData.activity.length > 0 && (
                        <button 
                            className="sort-toggle-btn"
                            onClick={toggleSortOrder}
                            title={sortOrder === 'asc' ? 'Sort newest first' : 'Sort oldest first'}
                        >
                            {sortOrder === 'asc' ? <ArrowDown size={16} /> : <ArrowUp size={16} />}
                            <span>{sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}</span>
                        </button>
                    )}
                </div>
                {!showActivityTimeline && (
                    <p className="timeline-subtitle">Click to show chronological events</p>
                )}
            </div>
            
            {showActivityTimeline && formData.activity.length > 0 && (
                <div className="activity-timeline-container">
                    <div className="activity-timeline">
                        {sortedActivities.map((item, index) => {
                            const isFuture = isDateInFuture(item.date);
                            const iconColor = getIconColor(item.topic);
                            return (
                                <div key={item.id} className={`activity-timeline-item ${isFuture ? 'future' : 'past'}`}>
                                    <div className="timeline-line-section">
                                        <div className="timeline-icon-dot" style={{ color: iconColor, borderColor: iconColor }}>
                                            {getTopicIcon(item.topic)}
                                        </div>
                                        {index < sortedActivities.length - 1 && <div className="timeline-line"></div>}
                                    </div>
                                    <div className="activity-card">
                                        <div className="activity-info">
                                            <div className="activity-title">{item.name}</div>
                                            <div className="activity-date">{formatDate(item.date)}</div>
                                            {item.description && (
                                                <div className="activity-description">{item.description}</div>
                                            )}
                                        </div>
                                        <div className="activity-badges">
                                            {isFuture && (
                                                <span className="badge badge-pending">
                                                    <Clock size={12} />
                                                    Pending
                                                </span>
                                            )}
                                            {item.alertId && (
                                                <span className="badge badge-alert">
                                                    <Bell size={12} />
                                                    Alert
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
            {showActivityTimeline && formData.activity.length === 0 && (
                <p className="empty-message">No events recorded yet.</p>
            )}
        </div>
    );
}

export default ActivityTimeline;