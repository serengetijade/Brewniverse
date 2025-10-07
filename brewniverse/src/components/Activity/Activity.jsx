import React, { useEffect, useRef } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Button from '../UI/Button';
import AlertButton from '../Alerts/AlertButton';
import '../../Styles/Activity.css';

const topics = [
    'Acid', 'Base', 'Gravity', 'GravityFinal',
    'Nutrient', 'PecticEnzyme', 'Racked', 'Tannin', 'Yeast', 'Other'
];

const activityStatus = [ "Pending", "Complete"]

function Activity({
    formData,
    setFormData,
    topic,
    headerLabel,
    itemLabel,
    sectionInfoMessage,
    brewLogId })
{
    const [editingActivity, setEditingActivity] = React.useState(null);

    const nameInputRef = useRef(null);
    useEffect(() => {
        if (nameInputRef.current) {
            nameInputRef.current.focus();
        }
    }, []);

    let buttonSize = 14;

    const createActivity = (topic, alertId, date, description, name, statusOfActivity) => {
        let setName = "";
        switch (topic) {
            case "Gravity":
                setName = "Gravity Reading";
                break;
            //case "GravityOriginal":
            //    setName = "Original Gravity Reading";
            //    break;
            //case "GravityFinal":
            //    setName = "Final Gravity Reading";
            //    break;
            case "PecticEnzyme":
                setName = "Pectic Enzyme Added";
                break;
            case "Racked":
                setName = "Brew Racked";
                break;
            case "Other":
                setName = "Activity";
                break;
            default:
                setName = `${topic} Added`;
        }

        // Get today's date in local timezone (YYYY-MM-DD format)
        const getTodayLocal = () => {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        let result = {
            id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
            alertId: alertId,
            date: date ? date : getTodayLocal(),
            description: description,
            name: name ?? setName,
            statusOfActivity: statusOfActivity ?? "Complete",
            topic: topic
        };
        return(result);
    };

    const addActivity = (topic, alertId, date, description, name) => {
        let newActivity = createActivity(
            topic = topic,
            alertId = alertId,
            date = date, 
            description = description,
            name = name,
        );
        setFormData(prev => ({
            ...prev,
            activity: [...prev.activity, newActivity]
        }));
        setEditingActivity({
            id: newActivity.id,
            topic: topic,
            alertId: newActivity.alertId,
            date: newActivity.date,
            name: newActivity.name
        });
    };

    const getActivitiesByTopic = (topic) => {
        return formData.activity.filter(x => x.topic === topic);
    };

    const updateActivity = (id, field, value) => {
        setFormData(prev => ({
            ...prev,
            activity: prev.activity.map(item =>
                item.id === id ? { ...item, [field]: value } : item
            )
        }));
    };

    const removeActivity = (id) => {
        setFormData(prev => ({
            ...prev,
            activity: prev.activity.filter(item => item.id !== id)
        }));
    };

    const handleAlertCreated = (activityId, alertId) => {
        updateActivity(activityId, 'alertId', alertId);
    };

    return (
        <div className="form-group">
            <div className="section-header">
                <label className="form-label">{headerLabel}</label>
                <Button
                    type="button"
                    variant="outline"
                    size="small"
                    onClick={() => addActivity(topic)}
                >
                    <Plus size={buttonSize} />
                    Add Entry
                </Button>
            </div>

            {getActivitiesByTopic(topic).length === 0
                ? (sectionInfoMessage
                    ? (<p className="empty-message">{sectionInfoMessage}</p>)
                    : null)
                : (                    
                getActivitiesByTopic(topic).length > 0 
                && (
                    <div className="compact-list">
                        {getActivitiesByTopic(topic).map((item) => (
                            <div key={item.id} className="compact-item">
                                <div className="form-group">
                                    <label className="form-label">{itemLabel}</label>
                                    <input
                                        type={(item.topic == "Gravity") ? "number" : "text"}
                                        step="0.001"
                                        className="form-input"
                                        placeholder="Item details"
                                        value={item.description}
                                        onChange={(e) => updateActivity(item.id, 'description', e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Date</label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        value={item.date}
                                        onChange={(e) => updateActivity(item.id, 'date', e.target.value)}
                                    />
                                </div>
                                <div className="activity-editor-actions">
                                    <AlertButton
                                        activity={item}
                                        brewLogId={brewLogId}
                                        onAlertCreated={handleAlertCreated}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="small"
                                        onClick={() => removeActivity(item.id)}
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )                    
            )}
        </div>
    );
};

export default Activity;