import React, { useState } from 'react';
import '../../Styles/Activity.css';
import { ActivityTopicEnum, getOptionTopics, getTopicConfig } from '../../constants/ActivityTopics.jsx';
import ActivityList from './ActivityList';

export function ActivityTopicList({
    formData,
    setFormData,
    brewLogId,
    defaultTopic = ActivityTopicEnum.Other,
    modeAction,
    renderTopicTools
}) {
    const [selectedTopic, setSelectedTopic] = useState(defaultTopic);
    const topicConfig = getTopicConfig(selectedTopic);

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
                    {getOptionTopics().map(topic => (
                        <option key={topic.key} value={topic.key}>{topic.displayName}</option>
                    ))}
                </select>
            </div>

            {renderTopicTools?.(selectedTopic)}

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
        </div>
    );
}

export default ActivityTopicList;
