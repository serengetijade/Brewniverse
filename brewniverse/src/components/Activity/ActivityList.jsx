import { Plus } from 'lucide-react';
import React, { useEffect, useState } from 'react';
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
    brewLogId,
    showTopButton = true,
    showBottomButton = false,
    modeAction
}) {
    const buttonSize = 14;
    const [newActivityId, setNewActivityId] = useState(null);

    const handleAddEntry = () => {
        const newActivity = addActivity(
            setFormData,
            getDate(),
            getTopicDisplayName(topic),
            null,
            topic,
            formData.id,
            null);
        setNewActivityId(newActivity?.id ?? null);
    };

    // Once the new entry has rendered, bring it into view and focus its first field
    useEffect(() => {
        if (!newActivityId) return;

        const newEntry = document.querySelector(`[data-activity-id="${newActivityId}"]`);
        if (newEntry) {
            newEntry.scrollIntoView({ behavior: 'smooth', block: 'center' });
            newEntry.querySelector('input, select, textarea')?.focus({ preventScroll: true });
        }
        setNewActivityId(null);
    }, [newActivityId]);

    return (
        <div className="form-group">
            <div className="section-header">
                <label className="form-label">{headerLabel}</label>
                {showTopButton &&
                    < Button
                        type="button"
                        variant="outline"
                        size="small"
                        onClick={handleAddEntry}
                    >
                        <Plus size={buttonSize} />
                        Add Entry
                    </Button>
                }
            </div>

            {getActivitiesByTopic(formData, topic).length === 0
                ? (sectionInfoMessage
                    ? (<p className="empty-message">{sectionInfoMessage}</p>)
                    : null)
                : (
                    <div>
                        {getActivitiesByTopic(formData, topic).map((item) => {
                            return (
                                <Activity
                                    key={item.id}
                                    activity={item}
                                    itemLabel={itemLabel}
                                    brewLogId={brewLogId}
                                    setFormData={setFormData}
                                    modeAction={modeAction}
                                />
                            );
                        })}

                        {showBottomButton &&
                            <div className="activity-bottom-button">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="small"
                                    onClick={handleAddEntry}
                                >
                                    <Plus size={buttonSize} />
                                    Add Entry
                                </Button>
                            </div>
                        }
                    </div>
                )
            }
        </div>
    );
};

export default ActivityList;