import React, { useState } from 'react';
import { 
  ArrowUp,
  ArrowDown,
  Clock, 
  Bell, 
  ListOrdered
} from 'lucide-react';
import { getTopicIcon, getTopicColor } from '../../constants/ActivityTopics.jsx';
import '../../Styles/Shared/activityTimeline.css';

function BrewLogTimeline({ activity = [] }) {
  const [sortOrder, setSortOrder] = useState('desc'); // Start with newest first for detail view

  const formatDate = (dateString) => {
    if (!dateString) return '';
    let date;
    if (dateString.includes('T')) {
      date = new Date(dateString);
    } else {
      const [year, month, day] = dateString.split('-');
      date = new Date(year, month - 1, day);
    }
    const datePart = date.toLocaleDateString(undefined, { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
    const timePart = date.toLocaleTimeString(undefined, { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    });
    return { date: datePart, time: timePart };
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const sortedActivities = [...activity].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

  const isDateInFuture = (dateString) => {
    return new Date(dateString) > Date.now();
  };

  if (activity.length === 0) {
    return (
      <div className="brewlog-timeline-empty">
        <ListOrdered size={32} />
        <p>No activity recorded yet</p>
      </div>
    );
  }

  return (
    <div className="brewlog-timeline-container">
      <div className="brewlog-timeline-header">
        <h3>
          <ListOrdered size={20} />
          Activity Timeline
        </h3>
        <div className="timeline-controls">
          <span className="timeline-count">{activity.length} events</span>
          <button 
            className="sort-toggle-btn"
            onClick={toggleSortOrder}
          >
            {sortOrder === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
            <span>{sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}</span>
          </button>
        </div>
      </div>
      
      <div className="brewlog-timeline-content">
        <div className="timeline-line-container">
          {sortedActivities.map((item, index) => {
            const isFuture = isDateInFuture(item.date);
            const iconColor = getTopicColor(item.topic);
            const formattedDate = formatDate(item.date);
            
            return (
              <div key={item.id} className={`timeline-event ${isFuture ? 'future' : 'past'}`}>
                <div className="timeline-marker">
                  <div 
                    className="timeline-icon" 
                    style={{ color: iconColor, borderColor: iconColor }}
                  >
                    {getTopicIcon(item.topic, 20)}
                  </div>
                  {index < sortedActivities.length - 1 && (
                    <div className="timeline-connector" />
                  )}
                </div>
                
                <div className="timeline-event-card">
                  <div className="event-header">
                    <div className="event-title">{item.name}</div>
                    <div className="event-badges">
                      {isFuture && (
                        <span className="event-badge pending">
                          <Clock size={12} />
                          Pending
                        </span>
                      )}
                      {item.alertId && (
                        <span className="event-badge alert">
                          <Bell size={12} />
                          Alert
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="event-datetime">
                    <span className="event-date">{formattedDate.date}</span>
                    <span className="event-time">{formattedDate.time}</span>
                  </div>
                  
                  {item.description && (
                    <div className="event-description">{item.description}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default BrewLogTimeline;

