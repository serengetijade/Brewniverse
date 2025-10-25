import { Plus } from 'lucide-react';
import React from 'react';
import '../../Styles/Activity.css';
import { getDate } from '../../contexts/AppContext';
import Button from '../UI/Button';
import Activity, { addActivity, getActivitiesByTopic, getTopicDisplayName } from './Activity';

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
                        getTopicDisplayName(topic),
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

            {getActivitiesByTopic(formData, topic).length === 0
                ? (sectionInfoMessage
                    ? (<p className="empty-message">{sectionInfoMessage}</p>)
                    : null)
                : (
                    <div>
                        {getActivitiesByTopic(formData, topic).map((item) => (
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