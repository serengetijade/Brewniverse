import React from 'react';
import '../../Styles/Activity.css';

const topics = [
    'Acid', 'Base', 'Gravity', 'GravityOriginal', 'GravityFinal',
    'Nutrient', 'PecticEnzyme', 'Tannin', 'Yeast', 'Other'
];
function ActivityTimeline({ formData, showActivityTimeline, setShowActivityTimeline }) {
    const formatDate = (dateString) => {
        if (!dateString) return '';
        // Parse YYYY-MM-DD format without timezone conversion
        const [year, month, day] = dateString.split('-');
        const date = new Date(year, month - 1, day); // month is 0-indexed
        return date.toLocaleDateString();
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
                                <span className="activity-topic">({item.topic})</span>
                                {item.description && <div className="activity-description">{item.description}</div>}
                                <div className="activity-status">
                                    {item.statusOfActivity == "Complete" ? '✅ Completed' : '⏳ Pending'}
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