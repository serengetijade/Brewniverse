import React, { useState, useEffect, useRef } from 'react';
import { Save, X, Plus, Trash2 } from 'lucide-react';
import Button from './Button';

const topics = [
    'Acid', 'Base', 'Gravity', 'GravityOriginal', 'GravityFinal',
    'Nutrient', 'PecticEnzyme', 'Tannin', 'Yeast', 'Other'
];

function Activity({
    formData,
    setFormData,
    topic,
    labelName,
    labelDetailsName,
    sectionInfoMessage })
{
    const [editingActivity, setEditingActivity] = React.useState(null);

    const nameInputRef = useRef(null);
    useEffect(() => {
    if (nameInputRef.current) {
        nameInputRef.current.focus();
    }
    }, []);
    let buttonSize = 14;

    const createActivity = (topic, alert = false, date, description, name) => {
        let setName = "";
        switch (topic) {
            case "Gravity":
                setName = "Gravity Reading";
                break;
            case "GravityOriginal":
                setName = "Original Gravity Reading";
                break;
            case "GravityFinal":
                setName = "Final Gravity Reading";
                break;
            case "PecticEnzyme":
                setName = "Pectic Enzyme Added";
                break;
            case "Other":
                setName = "Activity";
                break;
            default:
                setName = `${topic} Added`;
        }

        let result = {
            id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
            //activityStatus = "Completed",
            alert: alert,
            date: date ? date : new Date().toISOString().split('T')[0],
            description: description,
            name: name ?? setName,
            topic: topic
        };
        return(result);
    };

    const addActivity = (topic, alert, date, description, name) => {
        let newActivity = createActivity(
            topic = topic,
            alert = alert,
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
            alert: newActivity.alert,
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

    return (
        <div className="form-group">
            <div className="section-header">
                <label className="form-label">{labelName}</label>
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
                                    <label className="form-label">{labelDetailsName}</label>
                                    <input
                                        type="text"
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
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="small"
                                    onClick={() => removeActivity(item.id)}
                                >
                                    <Trash2 size={16} />
                                </Button>
                            </div>
                        ))}
                    </div>
                )                    
            )}
        </div>
    );
};

export default Activity;