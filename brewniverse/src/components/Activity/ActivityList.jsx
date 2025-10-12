import { Plus } from 'lucide-react';
import React from 'react';
import '../../Styles/Activity.css';
import { generateId, getDate } from '../../contexts/AppContext';
import Button from '../UI/Button';
import Activity, { createActivity, getActivityDisplayName } from './Activity';


export function ActivityList({
    formData,
    setFormData,
    topic,
    headerLabel,
    itemLabel,
    sectionInfoMessage,
    brewLogId
}) {
    const buttonSize = 14;

    const addActivity = () => {
        const newActivity = createActivity(
            getDate(),
            getActivityDisplayName(topic),
            null,
            topic,
            null,
            null
        );
        
        // Set the brewLogId
        newActivity.brewLogId = brewLogId;
        
        setFormData(prev => ({
            ...prev,
            activity: [...prev.activity, newActivity]
        }));
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

    const getActivitiesByTopic = () => {
        return formData.activity.filter(x => x.topic === topic);
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

            {getActivitiesByTopic().length === 0
                ? (sectionInfoMessage
                    ? (<p className="empty-message">{sectionInfoMessage}</p>)
                    : null)
                : (
                    <div>
                        {getActivitiesByTopic().map((item) => (
                            <Activity
                                key={item.id}
                                activity={item}
                                itemLabel={itemLabel}
                                brewLogId={brewLogId}
                                onUpdate={updateActivity}
                                onRemove={removeActivity}
                            />
                        ))}
                    </div>         
                )
            }
        </div>
    );
};

export default ActivityList;
