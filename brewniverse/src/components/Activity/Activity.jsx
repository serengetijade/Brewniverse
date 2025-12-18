import { Bell, BellPlus, Trash2 } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../Styles/Activity.css';
import { ActivityTopicEnum, getTopicDisplayName, getTopicDisplayNameForAlerts } from '../../constants/ActivityTopics.jsx';
import { Validation } from '../../constants/ValidationConstants';
import { ActionTypes, generateId, getDate, useApp } from '../../contexts/AppContext';
import ActivityModel from '../../models/Activity';
import Button from '../UI/Button';
import { getCurrentAbv, getGravityAbvVolumeData, getGravityActivities, UpdateAllGravityActivity } from '../../utils/GravityCalculations';

function Activity({
    activity,
    itemLabel,
    brewLogId,
    setFormData,
    modeAction,
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
            if (value === '') {
                handleChange(activityState.id, 'description', '');
                return;
            }
            const numValue = parseFloat(value);
            if (!isNaN(numValue) && numValue >= 0) {
                handleChange(activityState.id, 'description', value);
            }
        }
        else {
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
                navigate(`/alerts/${activityState.alertId}/edit`);
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

    if (activity.topic === ActivityTopicEnum.Addition) {
        return (
            <div className="activity">
                <div className="activity-inputs">
                    <div className="form-group">
                        <label className="form-label">Date</label>
                        <input
                            type="datetime-local"
                            className="form-input"
                            value={activityState.date}
                            onChange={(e) => {
                                handleChange(activityState.id, 'date', e.target.value);
                            }}
                        />

                        <label className="form-label">Description</label>
                        <textarea
                            type="text"
                            className="form-input"
                            value={activityState.description || ''}
                            onChange={(e) => {
                                handleChange(activityState.id, 'description', e.target.value);
                            }}
                            rows={4}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Added Volume</label>
                        <input
                            type="number"
                            className="form-input"
                            value={activityState.addedVolume || ''}
                            onChange={(e) => {
                                handleChange(activityState.id, 'addedVolume', e.target.value);
                            }}
                            step=".001"
                        />

                        <label className="form-label">Added ABV%</label>
                        <input
                            type="number"
                            className="form-input"
                            value={activityState.addedAbv || ''}
                            onChange={(e) => {
                                handleChange(activityState.id, 'addedAbv', e.target.value);
                            }}
                            min="0"
                            max="100"
                            step=".01"
                        />

                        <label className="form-label">Added Gravity</label>
                        <input
                            type="number"
                            className="form-input"
                            value={activityState.addedGravity || ''}
                            onChange={(e) => {
                                handleChange(activityState.id, 'addedGravity', e.target.value);
                            }}
                            min="0.6"
                            max="2"
                            step=".001"
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
                        title="Delete addition"
                    >
                        <Trash2 size={buttonSize} />
                    </Button>
                </div>
            </div>
        );
    }

    // Default render mode
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

export function addActivity(setFormData, date, name, description, topic, brewLogId, alertId, volume) {
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

        const additionUpdate = handleAdditionUpdates(prevData, id, field, value);
        if (additionUpdate !== null) {
            return additionUpdate;
        }

        const gravityUpdate = handleGravityUpdates(prevData, id, field, value);
        if (gravityUpdate !== null) {
            return gravityUpdate;
        }

        return {
            ...prevData,
            activity: prevData.activity.map(item =>
                item.id === id
                    ? {
                        ...item,
                        [field]: value
                    }
                    : item
            )
        };
    });
};

export { ActivityTopicEnum, getTopicDisplayName } from '../../constants/ActivityTopics.jsx';

export const ACTIVITY_STATUSES = ["Pending", "Complete"];

export default Activity;


// Helper functions - not exported
function handleAdditionUpdates(prevData, id, field, value) {
    const thisActivity = prevData.activity.find(x => String(x.id) === String(id));

    if (thisActivity?.topic == ActivityTopicEnum.Addition) {
        let updatedActivities = prevData.activity.map(item =>
            item.id === id
                ? {
                    ...item,
                    [field]: value
                }
                : item
        );

        const linkedGravityActivities = updatedActivities.filter(
            activity => activity.additionActivityId === id && activity.topic === ActivityTopicEnum.Gravity
        );

        if (linkedGravityActivities.length > 0) {
            // Get the updated addition activity
            const updatedAddition = updatedActivities.find(x => x.id === id);

            let gravityActivities = getGravityActivities(updatedActivities);

            linkedGravityActivities.forEach(linkedGravity => {
                const currentInputs = {
                    addedAbv: updatedAddition.addedAbv,
                    addedGravity: updatedAddition.addedGravity,
                    addedVolume: updatedAddition.addedVolume,
                    date: linkedGravity.date,
                    description: linkedGravity.description,
                    id: linkedGravity.id
                };

                const recalculatedGravities = UpdateAllGravityActivity(
                    linkedGravity,
                    currentInputs,
                    gravityActivities,
                    parseFloat(prevData.volume)
                );

                // Update the activities array with recalculated values
                updatedActivities = updatedActivities.map(item => {
                    const recalculated = recalculatedGravities.find(rg => rg.id === item.id);
                    return recalculated ? recalculated : item;
                });

                // Update gravityActivities for next iteration
                gravityActivities = getGravityActivities(updatedActivities);
            });

            return {
                ...prevData,
                activity: updatedActivities,
                currentAbv: getCurrentAbv(gravityActivities)
            };
        }

        return {
            ...prevData,
            activity: updatedActivities
        };
    }

    return null;
}

function handleGravityUpdates(prevData, id, field, value) {
    const thisActivity = prevData.activity.find(x => String(x.id) === String(id));

    if (thisActivity?.topic == ActivityTopicEnum.Gravity && field == "description") {
        let gravityActivities = getGravityActivities(prevData.activity);

        var currentInputs = {
            addedAbv: thisActivity.abv,
            addedGravity: thisActivity.addedGravity,
            addedVolume: thisActivity.addedVolume,
            date: thisActivity.date,
            description: thisActivity.description,
            id: thisActivity.id
        }

        currentInputs[field] = value;

        if (field === "date") {
            return {
                ...prevData,
                activity: prevData.activity.map(item =>
                    item.id === id
                        ? {
                            ...item,
                            [field]: value
                        }
                        : item
                )
            };
        }

        const updatedActivities = UpdateAllGravityActivity(
            thisActivity,
            currentInputs,
            gravityActivities,
            parseFloat(prevData.volume)
        )

        // Update all gravity activities with the recalculated values
        const updatedActivityArray = prevData.activity.map(item => {
            const updatedActivity = updatedActivities.find(ua => ua.id === item.id);
            return updatedActivity ? updatedActivity : item;
        });

        return {
            ...prevData,
            activity: updatedActivityArray,
            currentAbv: getCurrentAbv(updatedActivities)
        };
    }

    // Return null if not a gravity update, so caller knows to handle it differently
    return null;
}