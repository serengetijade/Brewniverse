import { Bell, BellPlus, Trash2 } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../Styles/Activity.css';
import { ActivityTopicEnum, getTopicDisplayName, getTopicDisplayNameForAlerts } from '../../constants/ActivityTopics.jsx';
import { Validation } from '../../constants/ValidationConstants';
import { ActionTypes, generateId, getDate, useApp } from '../../contexts/AppContext';
import ActivityModel from '../../models/Activity';
import Button from '../UI/Button';

function Activity({
    activity,
    itemLabel,
    brewLogId,
    setFormData
}) {
    const { state, dispatch } = useApp();
    const navigate = useNavigate();
    const [activityState, setActivityState] = useState(() =>
        ActivityModel.fromJSON({
            ...activity,
            brewLogId: activity.brewLogId || brewLogId || '',
        })
    );

    const descriptionInputRef = useRef(null);

    useEffect(() => {
        setActivityState(ActivityModel.fromJSON({
            ...activity,
            brewLogId: activity.brewLogId || brewLogId || '',
        }));
    }, [activity, brewLogId]);

    const alertExists = activityState.alertId && state.alerts.some(alert => alert.id === activityState.alertId);

    const handleDelete = () => {
        // Cascade delete alerts
        if (activityState.alertId) {
            dispatch({
                type: ActionTypes.deleteAlert,
                payload: activityState.alertId
            });
        }
        
        deleteActivity(setFormData, activityState.id);
    };

    const handleChange = (id, field, value) => {
        const updatedData = ActivityModel.fromJSON({ ...activityState.toJSON(), [field]: value });
        setActivityState(updatedData);
        if (setFormData) {
            updateActivity(setFormData, id, field, value);
        }
        
        // If the date field is changed and this activity has an alert, update the alert's date
        if (field === 'date' && activityState.alertId) {
            const alert = state.alerts.find(alert => alert.id === activityState.alertId);
            if (alert) {
                dispatch({
                    type: ActionTypes.updateAlert,
                    payload: {
                        id: activityState.alertId,
                        date: new Date(value).toISOString()
                    }
                });
            }
        }
    };

    const handleDescriptionChange = (e) => {
        const value = e.target.value;
        // For gravity readings (numeric), validate positive numbers
        if (activity.topic === ActivityTopicEnum.Gravity) {
            // Allow empty string to clear
            if (value === '') {
                handleChange(activityState.id, 'description', '');
                return;
            }
            const numValue = parseFloat(value);
            if (!isNaN(numValue) && numValue >= 0) {
                handleChange(activityState.id, 'description', value);
            }
        } else {
            // For text fields, update directly
            handleChange(activityState.id, 'description', value);
        }
    };

    const isDateInFuture = (dateString) => {
        const activityDate = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return activityDate > today;
    };

    const handleAlertButtonClick = () => {
        const activityDate = new Date(activityState.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Only allow alerts for future dates
        if (activityDate <= today) {
            return;
        }

        // If alert already exists, navigate to it
        if (activityState.alertId && alertExists) {
            const confirmNavigate = window.confirm(
                'This activity already has an alert. Would you like to go to that alert?\n\nClick OK to navigate to the alert, or Cancel to stay here.'
            );

            if (confirmNavigate) {
                navigate(`/alerts/${activityState.alertId}`);
            }
        }
        else {
            // Create new alert
            const newAlertId = generateId();
            const newAlert = {
                id: newAlertId,
                name: getTopicDisplayNameForAlerts(activity.topic) || `${activityState.topic} Alert`,
                description: activityState.description || '',
                date: new Date(activityState.date).toISOString(),
                brewLogId: activityState.brewLogId || brewLogId || '',
                activityId: activityState.id,
                topic: activityState.topic,
                alertGroupId: '',
                isRecurring: false,
                recurringType: 'daily',
                recurringInterval: 1,
                endDate: '',
                isCompleted: false,
                priority: 'low'
            };

            // Dispatch to create alert in global state
            dispatch({
                type: ActionTypes.addAlert,
                payload: newAlert
            });

            // Update activity with alert ID
            handleChange(activityState.id, 'alertId', newAlertId);
        }
    };

    const buttonSize = 14;
    const showAlertButton = isDateInFuture(activityState.date);

    return (
        <div className="activity">
            <div className="activity-inputs">
                <div className="form-group">
                    <label className="form-label">{itemLabel}</label>
                        <input
                            ref={descriptionInputRef}
                            type={(activity.topic === ActivityTopicEnum.Gravity) ? "number" : "text"}
                            step="0.001"
                            min={(activity.topic === ActivityTopicEnum.Gravity) ? Validation.NumberMin : undefined}
                            className="form-input"
                            placeholder="Item details"
                            value={activityState.description}
                            onChange={handleDescriptionChange}
                            maxLength={(activity.topic === ActivityTopicEnum.Gravity) ? undefined : Validation.InputMaxLength}
                        />
                </div>
                <div className="form-group">
                    <label className="form-label">Date</label>
                    <input
                        type="datetime-local"
                        className="form-input"
                        value={activityState.date}
                        onChange={(e) => handleChange(activityState.id, 'date', e.target.value)}
                    />
                </div>
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
                    onClick={handleDelete}
                >
                    <Trash2 size={buttonSize} />
                </Button>
            </div>
        </div>
    );
}

export function addActivity(setFormData, date, name, description, topic, brewLogId, alertId) {
    const newActivity = createActivity(
        date ? date : getDate(),
        name ? name : getTopicDisplayName(topic),
        description,
        topic,
        brewLogId,
        alertId
    );

    setFormData(prev => {
        const prevData = prev.toJSON ? prev.toJSON() : prev;
        return {
            ...prevData,
            activity: [...prevData.activity, newActivity]
        };
    });

    return newActivity;
};

export function createActivity(date, name, description, topic, brewLogId, alertId) {
    const activity = new ActivityModel({
        date: date || getDate(),
        name: name || getTopicDisplayName(topic),
        description: description,
        topic: topic,
        brewLogId: brewLogId,
        alertId: alertId
    });
    return activity.toJSON();
}

export const getActivitiesByTopic = (formData, topic) => {
    if (!formData || !topic) return [];
    const data = typeof formData === 'string' ? JSON.parse(formData) : formData;
    const activities = Array.isArray(data.activity) ? data.activity : [];
    const target = String(topic).toLowerCase();
    return activities.filter(a => a && String(a.topic).toLowerCase() === target);
};

export function deleteActivity(setFormData, id) {
    setFormData(prev => {
        // Handle both BrewLog instances and plain objects.
        const prevData = prev.toJSON ? prev.toJSON() : prev;
        return {
            ...prevData,
            activity: prevData.activity.filter(item => item.id !== id),
        };
    });
};

export function updateActivity(setFormData, id, field, value) {
    setFormData(prev => {
        const prevData = prev.toJSON ? prev.toJSON() : prev;
        return {
            ...prevData,
            activity: prevData.activity.map(item =>
                item.id === id ? { ...item, [field]: value } : item
            )
        };
    });
};

export { ActivityTopicEnum, getTopicDisplayName } from '../../constants/ActivityTopics.jsx';

export const ACTIVITY_STATUSES = ["Pending", "Complete"];

export default Activity;