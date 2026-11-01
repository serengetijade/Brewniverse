import React, { useState } from 'react';
import '../../Styles/Activity.css';
import { getOptionTopics, getTopicConfig, getTopicDisplayName } from '../../constants/ActivityTopics.jsx';
import Activity from './Activity';
import ActivityList from './ActivityList';

const AllTopicsValue = 'all';

export function ActivityTopicList({
    formData,
    setFormData,
    brewLogId,
    defaultTopic = AllTopicsValue,
    modeAction,
    renderTopicTools
}) {
    const [selectedTopic, setSelectedTopic] = useState(defaultTopic);
    const topicConfig = getTopicConfig(selectedTopic);

    // View-only list of every activity (no Add Entry), oldest first to match ActivityList
    const renderAllActivities = () => {
        const allActivities = [...(formData?.activity || [])]
            .sort((a, b) => (Date.parse(a?.date) || 0) - (Date.parse(b?.date) || 0));

        return (
            <div className="form-group">
                {allActivities.length === 0
                    ? (<p className="empty-message">No activities recorded.</p>)
                    : allActivities.map(item => (
                        <Activity
                            key={item.id}
                            activity={item}
                            itemLabel={getTopicDisplayName(item.topic)}
                            brewLogId={brewLogId}
                            setFormData={setFormData}
                            modeAction={modeAction}
                        />
                    ))
                }
            </div>
        );
    };

    return (
        <div className="activity-topic-list">
            <div className="form-group">
                <label htmlFor="activityTopicSelect" className="form-label">Activity Topic</label>
                <select
                    id="activityTopicSelect"
                    className="form-select"
                    value={selectedTopic}
                    onChange={(event) => setSelectedTopic(event.target.value)}
                >
                    <option value={AllTopicsValue}>All Activities</option>
                    {getOptionTopics().map(topic => (
                        <option key={topic.key} value={topic.key}>{topic.displayName}</option>
                    ))}
                </select>
            </div>

            {renderTopicTools?.(selectedTopic)}

            {selectedTopic === AllTopicsValue
                ? renderAllActivities()
                : (
                    <ActivityList
                        formData={formData}
                        setFormData={setFormData}
                        topic={selectedTopic}
                        headerLabel=""
                        itemLabel={topicConfig.displayName}
                        sectionInfoMessage={`${topicConfig.description}. No entries recorded.`}
                        brewLogId={brewLogId}
                        showBottomButton={true}
                        modeAction={modeAction}
                    />
                )
            }
        </div>
    );
}

export default ActivityTopicList;
