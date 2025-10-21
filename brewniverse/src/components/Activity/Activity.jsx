import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Bell, BellPlus } from 'lucide-react';
import { generateId, getDate, useApp, ActionTypes } from '../../contexts/AppContext';
import Button from '../UI/Button';
import { ActivityTopicEnum, getTopicDisplayName, getTopicDisplayNameForAlerts } from '../../constants/ActivityTopics.jsx';
import '../../Styles/Activity.css';

function Activity({
    activity,
    itemLabel,
    brewLogId,
    setFormData
}) {
    const { state, dispatch } = useApp();
    const navigate = useNavigate();
    const [activityData, setActivityData] = useState({
        id: activity.id || generateId(),
        date: activity.date || getDate(),
        description: activity.description || '',
        topic: activity.topic || 'Other',
        brewLogId: activity.brewLogId || brewLogId || '',
        alertId: activity.alertId || null,
    });

    const descriptionInputRef = useRef(null);

    // Sync local state with prop changes
    useEffect(() => {
        setActivityData({
            id: activity.id || generateId(),
            date: activity.date || getDate(),
            description: activity.description || '',
            topic: activity.topic || 'Other',
            brewLogId: activity.brewLogId || brewLogId || '',
            alertId: activity.alertId || null,
        });
    }, [activity, brewLogId]);

    const alertExists = activityData.alertId && state.alerts.some(alert => alert.id === activityData.alertId);

    const handleChange = (id, field, value) => {
        const updatedData = { ...activityData, [field]: value };
        setActivityData(updatedData);
        if (setFormData) {
            updateActivity(setFormData, id, field, value);
        }
    };

    const isDateInFuture = (dateString) => {
        const activityDate = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return activityDate > today;
    };

    const handleAlertButtonClick = () => {
        const activityDate = new Date(activityData.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Only allow alerts for future dates
        if (activityDate <= today) {
            return;
        }

        // If alert already exists, navigate to it
        if (activityData.alertId && alertExists) {
            const confirmNavigate = window.confirm(
                'This activity already has an alert. Would you like to go to that alert?\n\nClick OK to navigate to the alert, or Cancel to stay here.'
            );
            
            if (confirmNavigate) {
                navigate(`/alerts/${activityData.alertId}`);
            }
        }
        else {
            // Create new alert
            const newAlertId = generateId();
            const newAlert = {
                id: newAlertId,
                name: getTopicDisplayNameForAlerts(activity.topic) || `${activityData.topic} Alert`,
                description: activityData.description || '',
                date: new Date(activityData.date).toISOString(),
                brewLogId: activityData.brewLogId || brewLogId || '',
                activityId: activityData.id,
                topic: activityData.topic,
                alertGroupId: '',
                isRecurring: false,
                recurringType: 'daily',
                recurringInterval: 1,
                endDate: '',
                isCompleted: false,
                priority: 'medium'
            };

            // Dispatch to create alert in global state
            dispatch({
                type: ActionTypes.ADD_ALERT,
                payload: newAlert
            });

            // Update activity with alert ID
            handleChange(activityData.id, 'alertId', newAlertId);
        }
    };

    const buttonSize = 14;
    const showAlertButton = isDateInFuture(activityData.date);

    return (        
        <div className="activity">
            <div className="form-group">
                <label className="form-label">{itemLabel}</label>
                <input
                    ref={descriptionInputRef}
                    type={(activity.topic === ActivityTopicEnum.Gravity) ? "number" : "text"}
                    step="0.001"
                    className="form-input"
                    placeholder="Item details"
                    value={activityData.description}
                    onChange={(e) => handleChange(activityData.id, 'description', e.target.value)}
                />
            </div>
            <div className="form-group">
                <label className="form-label">Date</label>
                <input
                    type="datetime-local"
                    className="form-input"
                    value={activityData.date}
                    onChange={(e) => handleChange(activityData.id, 'date', e.target.value)}
                />
            </div>
            <div className="activity-editor-actions">
                {showAlertButton && (
                    <Button
                        type="button"
                        variant={alertExists ? "primary" : "ghost"}
                        size="small"
                        onClick={handleAlertButtonClick}
                        title={alertExists ? "Alert exists - click to view" : "Create alert for this activity"}
                    >
                        {alertExists ? <Bell size={buttonSize} /> : <BellPlus size={buttonSize} />}
                    </Button>
                )}
                <Button
                    type="button"
                    variant="ghost"
                    size="small"
                    onClick={() => deleteActivity(setFormData, activityData.id)}
                >
                    <Trash2 size={buttonSize} />
                </Button>
            </div>
        </div>        
    );
}

export function addActivity (setFormData, date, name, description, topic, brewLogId, alertId){
    const newActivity = createActivity(
        date ? date : getDate(),
        name ? name : getTopicDisplayName(topic),
        description,
        topic,
        brewLogId,
        alertId
    );

    setFormData(prev => ({
        ...prev,
        activity: [...prev.activity, newActivity]
    }));

    return newActivity;
};

export function createActivity(date, name, description, topic, brewLogId, alertId) {
    return {
        id: generateId(),
        date: date ? date : getDate(),
        name: name || getTopicDisplayName(topic),
        description: description,
        topic: topic,
        brewLogId: brewLogId,
        alertId: alertId
    };
}

export const getActivitiesByTopic = (formData, topic) => {
    if (!formData || !topic) return [];
    const data = typeof formData === 'string' ? JSON.parse(formData) : formData;
    const activities = Array.isArray(data.activity) ? data.activity : [];
    const target = String(topic).toLowerCase();
    return activities.filter(a => a && String(a.topic).toLowerCase() === target);
};

export function deleteActivity (setFormData, id) {
    setFormData(prev => ({
        ...prev,
        activity: prev.activity.filter(item => item.id !== id)
    }));

    //ToDo: delete any associated alerts: 

};

export function updateActivity (setFormData, id, field, value) {
    setFormData(prev => ({
        ...prev,
        activity: prev.activity.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        )
    }));
};

export { getTopicDisplayName, ActivityTopicEnum } from '../../constants/ActivityTopics.jsx';

export const ACTIVITY_STATUSES = ["Pending", "Complete"];

export default Activity;