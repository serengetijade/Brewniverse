import { Plus } from 'lucide-react';
import React from 'react';
import '../../Styles/Activity.css';
import { generateId, getDate } from '../../contexts/AppContext';
import Button from '../UI/Button';
import Activity, { addActivity, getActivityDisplayName, deleteActivity, updateActivity } from './Activity';

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
                    onClick={() => addActivity(
                        setFormData,
                        getDate(),
                        getActivityDisplayName(topic),
                        null,
                        topic,
                        formData.id,
                        null)
                    }
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
                                setFormData={setFormData}
                            />
                        ))}
                    </div>         
                )
            }
        </div>
    );
};

export default ActivityList;