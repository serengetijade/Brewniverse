import { Bell, BellPlus, Trash2 } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../Styles/Activity.css';
import { ActivityTopicEnum, getTopicDisplayName, getTopicDisplayNameForAlerts } from '../../constants/ActivityTopics.jsx';
import { Validation } from '../../constants/ValidationConstants';
import { ActionTypes, generateId, getDate, useApp } from '../../contexts/AppContext';
import ActivityModel from '../../models/Activity';
import { UpdateAllGravityActivityData, UpdateGravityActivityData, getGravityActivities } from '../../utils/GravityCalculations';
import Button from '../UI/Button';

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
    }, [activity, brewLogId, activity.date, activity.description, activity.addedVolume, activity.addedAbv, activity.addedGravity]);

    const alertExists = activityState.alertId && (state.alerts || []).some(alert => alert.id === activityState.alertId);

    const handleDelete = () => {
        // Cascade delete alerts
        if (activityState.alertId) {
            dispatch({
                type: ActionTypes.deleteAlert,
                payload: activityState.alertId
            });
        }

        // Cascade delete gravity readings associated with an addition
        if (activityState.topic == ActivityTopicEnum.Addition) {
            deleteAdditionAndGravityReading(setFormData, activityState.id);
            return;
        }

        deleteActivity(setFormData, activityState.id);
    };

    const handleChange = (id, field, value) => {
        if (activity.topic === ActivityTopicEnum.Gravity && field == "description") {
            const numValue = parseFloat(value);
            if (isNaN(numValue) && numValue < 0) {
                alert("Please enter a valid number.");
                return;
            }
        }

        if (setFormData) {
            updateActivity(setFormData, id, field, value);
        }

        // If the date field is changed and this activity has an alert, update the alert's date
        if (field === 'date' && activityState.alertId) {
            const alert = (state.alerts || []).find(alert => alert.id === activityState.alertId);
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

    const handleBlur = (e) => {
        const value = e.target.value;
        const field = e.target.name;

        if (setFormData &&
            (activity.topic === ActivityTopicEnum.Gravity || activity.topic === ActivityTopicEnum.Addition)) {
            updateSubsequentActivities(setFormData, activityState.id, field, value);
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
                'This activity has an alert set.\n\nWould you like to go to that alert?'
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
            <div className="activity activity-addition">
                <div className="activity-inputs">
                    <div className="form-group">
                        <label className="form-label">Date</label>
                        <input
                            type="datetime-local"
                            className="form-input"
                            name="date"
                            value={activityState.date}
                            onChange={(e) => {
                                handleChange(activityState.id, 'date', e.target.value);
                            }}
                            onBlur={handleBlur}
                        />

                        <label className="form-label">Description</label>
                        <textarea
                            type="text"
                            className="form-input"
                            value={activityState.description || ''}
                            onChange={(e) => {
                                handleChange(activityState.id, 'description', e.target.value);
                            }}
                            rows={3}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Added Volume*</label>
                        <input
                            type="number"
                            className="form-input"
                            name="addedVolume"
                            value={activityState.addedVolume || ''}
                            onChange={(e) => {
                                handleChange(activityState.id, 'addedVolume', e.target.value);
                            }}
                            onBlur={handleBlur}
                            step=".001"
                        />

                        <label className="form-label">Added ABV%</label>
                        <input
                            type="number"
                            className="form-input"
                            name="addedAbv"
                            value={activityState.addedAbv || ''}
                            onChange={(e) => {
                                handleChange(activityState.id, 'addedAbv', e.target.value);
                            }}
                            onBlur={handleBlur}
                            min="0"
                            max="100"
                            step=".01"
                        />

                        <label className="form-label">Added Gravity</label>
                        <input
                            type="number"
                            className="form-input"
                            name="addedGravity"
                            value={activityState.addedGravity || ''}
                            onChange={(e) => {
                                handleChange(activityState.id, 'addedGravity', e.target.value);
                            }}
                            onBlur={handleBlur}
                            min="0.6"
                            max="2"
                            step=".001"
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
                            onClick={handleDelete}
                            title="Delete addition"
                        >
                            <Trash2 size={buttonSize} />
                        </Button>
                    </div>

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
                        name="description"
                        placeholder="Item details"
                        value={activityState.description}
                        onChange={(e) => {
                            handleChange(activityState.id, 'description', e.target.value);
                        }}
                        onBlur={handleBlur}
                        maxLength={(activity.topic === ActivityTopicEnum.Gravity) ? undefined : Validation.InputMaxLength}
                    />
                </div>
                <div className="form-group">
                    <input
                        type="datetime-local"
                        className="form-input"
                        name="date"
                        value={activityState.date}
                        onChange={(e) => handleChange(activityState.id, 'date', e.target.value)}
                        onBlur={handleBlur}
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
    const result = activities.filter(a => a && String(a.topic).toLowerCase() === target);
    return result.sort((a, b) => {
        const ta = Date.parse(a?.date) || 0;
        const tb = Date.parse(b?.date) || 0;
        return ta - tb;
    });
};

export function deleteAdditionAndGravityReading(setFormData, additionId) {
    setFormData(prev => {
        const prevData = prev.toJSON ? prev.toJSON() : prev;

        const linkedGravityReadings = prevData.activity.filter(
            activity => activity.additionActivityId === additionId &&
                activity.topic === ActivityTopicEnum.Gravity
        );

        if (linkedGravityReadings.length > 0) {
            const confirmDelete = window.confirm(
                `Deleting this addition will also delete associated gravity reading.\n\nDo you want to continue?`
            );

            if (!confirmDelete) {
                return prevData;
            }

            const updatedActivities = prevData.activity.filter(
                activity => activity.id !== additionId
                    && !(activity.additionActivityId === additionId
                        && activity.topic === ActivityTopicEnum.Gravity)
            );

            // Recalculate gravity activities
            const gravityActivities = getGravityActivities(updatedActivities);
            if (gravityActivities.length > 0) {
                const firstGravityActivityId = gravityActivities[0].id;
                const recalculatedData = updateGravityActivities(
                    { ...prevData, activity: updatedActivities },
                    firstGravityActivityId
                );
                return recalculatedData;
            }

            return {
                ...prevData,
                activity: updatedActivities
            };
        }

        return {
            ...prevData,
            activity: prevData.activity.filter(x => x.id !== additionId)
        };
    });
}

export function deleteActivity(setFormData, id) {
    setFormData(prev => {
        // Handle both BrewLog instances and plain objects
        const prevData = prev.toJSON ? prev.toJSON() : prev;

        let thisActivity = prevData.activity.find(x => String(x.id) === String(id));
        if (thisActivity?.topic === ActivityTopicEnum.Gravity) {
            //Do NOT delete if a gravity activity is tied to an addition - unless the addition has been deleted
            const additionId = thisActivity?.additionActivityId;
            if (additionId) {
                const additionActivity = prevData.activity.find(x => String(x.id) === String(additionId));
                if (additionActivity) {
                    alert("Cannot delete - this is associated with an addition. Delete that addition and try again.");
                    return {
                        ...prevData,
                    };
                }
            };

            prevData.activity = prevData.activity.filter(x => x.id !== id);

            // Recalculate gravity activities
            const gravityActivities = getGravityActivities(prevData.activity);
            if (0 < gravityActivities.length) {
                const firstGravityActivityId = gravityActivities[0].id;
                return updateGravityActivities(prevData, firstGravityActivityId);
            }
        }

        return {
            ...prevData,
            activity: prevData.activity.filter(x => x.id !== id)
        };
    });
};

export function updateActivity(setFormData, id, field, value) {
    setFormData(prev => {
        const prevData = prev.toJSON ? prev.toJSON() : prev;

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

export function updateAllActivities(setFormData, id, field, value) {
    setFormData(prev => {
        const prevData = prev.toJSON ? prev.toJSON() : prev;

        const additionUpdate = updateAdditionActivities(prevData, id, field, value);
        if (additionUpdate !== null) {
            return additionUpdate;
        }

        const gravityUpdate = updateGravityActivities(prevData, id, field, value);
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

export function updateSubsequentActivities(setFormData, id, field, value) {
    setFormData(prev => {
        const prevData = prev.toJSON ? prev.toJSON() : prev;

        const additionUpdate = updateAdditionActivities(prevData, id, field, value);
        if (additionUpdate !== null) {
            return additionUpdate;
        }

        const gravityUpdate = updateGravityActivities(prevData, id, field, value);
        if (gravityUpdate !== null) {
            return gravityUpdate;
        }

        return null;
    });
};

export { ActivityTopicEnum, getTopicDisplayName } from '../../constants/ActivityTopics.jsx';

export const ACTIVITY_STATUSES = ["Pending", "Complete"];

export default Activity;


// Helper functions - not exported
function updateAdditionActivities(prevData, id, field, value) {
    const thisActivity = prevData.activity.find(x => String(x.id) === String(id));

    if (thisActivity?.topic != ActivityTopicEnum.Addition) return null;

    let updatedAddition;

    let updatedActivities = prevData.activity.map(item => {
        if (item.id === id) {
            const updated = { ...item };
            updated[field] = value;

            if (updated.addedAbv === undefined) updated.addedAbv = 0;
            if (updated.addedVolume === undefined) updated.addedVolume = 0;
            if (updated.addedGravity === undefined) updated.addedGravity = 0;

            updatedAddition = updated;

            return updated;
        }
        return item;
    });

    let gravityActivities = getGravityActivities(updatedActivities);

    const linkedGravityActivities = updatedActivities.filter(
        activity => activity.additionActivityId === id && activity.topic === ActivityTopicEnum.Gravity
    );

    // Check if we have the required fields to create/update a gravity activity
    const hasRequiredFields = (parseFloat(updatedAddition.addedVolume) > 0
        && parseFloat(updatedAddition.addedAbv) >= 0
        && parseFloat(updatedAddition.addedGravity) > 0)
        || parseFloat(updatedAddition.addedVolume) < 0;

    if (hasRequiredFields && linkedGravityActivities.length === 0) {
        // Create new gravity activity linked to this addition
        const newGravityActivity = new ActivityModel({
            date: getDate(updatedAddition.date) ?? getDate(),
            name: getTopicDisplayName(ActivityTopicEnum.Gravity),
            topic: ActivityTopicEnum.Gravity,
            brewLogId: updatedAddition.brewLogId,
            additionActivityId: id,
            addedAbv: updatedAddition.addedAbv,
            addedVolume: updatedAddition.addedVolume,
            addedGravity: updatedAddition.addedGravity
        });

        const currentInputs = {
            addedAbv: updatedAddition.addedAbv,
            addedGravity: updatedAddition.addedGravity,
            addedVolume: updatedAddition.addedVolume,
            date: updatedAddition.date,
            id: newGravityActivity.id
        };

        const calculatedGravity = UpdateGravityActivityData(
            newGravityActivity,
            currentInputs,
            gravityActivities,
            parseFloat(prevData.volume) || 0
        );

        updatedActivities.push(calculatedGravity.toJSON());
        gravityActivities = getGravityActivities(updatedActivities);

        return {
            ...prevData,
            activity: updatedActivities
        };
    }
    else if (0 < linkedGravityActivities.length) {
        const linkedGravity = linkedGravityActivities[0];

        const gravityActivityToUpdate = gravityActivities.find(g => g.id === linkedGravity.id);

        if (gravityActivityToUpdate) {
            const currentInputs = {
                addedAbv: updatedAddition.addedAbv,
                addedGravity: updatedAddition.addedGravity,
                addedVolume: updatedAddition.addedVolume,
                date: updatedAddition.date,
                description: linkedGravity.description,
                id: linkedGravity.id
            };

            const recalculatedGravities = UpdateAllGravityActivityData(
                gravityActivityToUpdate,
                currentInputs,
                gravityActivities,
                parseFloat(prevData.volume) || 0
            );

            updatedActivities = updatedActivities.map(item => {
                const recalculated = recalculatedGravities.find(rg => rg.id === item.id);
                return recalculated ? recalculated : item;
            });

            gravityActivities = getGravityActivities(updatedActivities);
        }

        return {
            ...prevData,
            activity: updatedActivities
        };
    }

    return {
        ...prevData,
        activity: updatedActivities
    };
}

function updateGravityActivities(prevData, id) {
    const thisActivity = prevData.activity.find(x => String(x.id) === String(id));

    if (thisActivity?.topic != ActivityTopicEnum.Gravity) return null;

    let gravityActivities = getGravityActivities(prevData.activity);

    const updatedGravityActivities = UpdateAllGravityActivityData(
        thisActivity,
        thisActivity,
        gravityActivities,
        parseFloat(prevData.volume)
    )

    // Update all gravity activities with the recalculated values
    const updatedActivityArray = prevData.activity.map(item => {
        const updatedActivity = updatedGravityActivities.find(x => x.id === item.id);
        return updatedActivity ? updatedActivity : item;
    });

    return {
        ...prevData,
        activity: updatedActivityArray
    };
}