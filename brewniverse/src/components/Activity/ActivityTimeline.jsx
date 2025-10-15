import React from 'react';
import '../../Styles/Shared/activityTimeline.css';

function ActivityTimeline({ formData, showActivityTimeline, setShowActivityTimeline }) {
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

    return (<div className="card mt-4">
        <div className="card-header" style={{ cursor: 'pointer' }} onClick={() => setShowActivityTimeline(!showActivityTimeline)}>
            <h3>Activity Timeline {showActivityTimeline ? '▼' : '▶'}</h3>
            <p>Click to {showActivityTimeline ? 'hide' : 'show'} chronological events</p>
        </div>
        {showActivityTimeline && formData.activity.length > 0 && (
            <div className="activity-timeline">
                {formData.activity
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .map(item => (
                        <div key={item.id} className="activity-timeline-item">
                            <div className="activity-date">{formatDate(item.date)}</div>
                            <div className="activity-content">
                                <strong>{item.name}</strong>
                                {item.description && <div className="activity-description">{item.description}</div>}
                                <div className="activity-status">
                                    {new Date(item.date) < Date.now() ? '' : '⏳ Pending'}
                                    {item.alert && ' 🔔 Has Alert'}
                                </div>
                            </div>
                        </div>
                    ))}
            </div>
        )}
        {showActivityTimeline && formData.activity.length === 0 && (
            <p className="empty-message">No events recorded yet.</p>
        )}
        </div>
    );
};

export default ActivityTimeline;