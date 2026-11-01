import { Plus, Trash2 } from 'lucide-react';
import React from 'react';
import '../../Styles/Activity.css';
import { CustomTopicDefaultColor, CustomTopicKeyPrefix, getTopicDisplayName } from '../../constants/ActivityTopics.jsx';
import { Validation } from '../../constants/ValidationConstants';
import { ActionTypes, generateId, useApp } from '../../contexts/AppContext';
import Button from '../UI/Button';

function CustomActivityTopics() {
    const { state, dispatch } = useApp();
    const buttonSize = 14;
    const customTopics = state.customActivityTopics || [];

    const handleAdd = () => {
        dispatch({
            type: ActionTypes.addCustomActivityTopic,
            payload: {
                key: `${CustomTopicKeyPrefix}${generateId()}`,
                color: CustomTopicDefaultColor,
                description: '',
                displayName: 'Appearance in options list and timeline',
                displayName_Alert: 'Memo when this activity is due',
                label: 'New Activity Name'
            }
        });
    };

    const handleChange = (key, field, value) => {
        dispatch({
            type: ActionTypes.updateCustomActivityTopic,
            payload: { key, [field]: value }
        });
    };

    const handleDelete = (key) => {
        const activityCount = state.brewLogs
            .flatMap(brewLog => brewLog.activity || [])
            .filter(activity => activity.topic === key)
            .length;
        const alertCount = state.alerts.filter(alert => alert.topic === key).length;

        const confirmDelete = window.confirm(
            `Delete "${getTopicDisplayName(key)}"?\n\n` +
            `${activityCount} activities and ${alertCount} alerts use this topic. ` +
            'They will not be deleted, but will now show as Other Activity.'
        );

        if (confirmDelete) {
            dispatch({
                type: ActionTypes.deleteCustomActivityTopic,
                payload: key
            });
        }
    };

    return (
        <div className="card">
            <div className="card-header">
                <h2 className="card-title">Custom Activity Topics</h2>
                <Button
                    type="button"
                    variant="outline"
                    size="small"
                    onClick={handleAdd}
                >
                    <Plus size={buttonSize} />
                    Add Topic
                </Button>
            </div>
            <div className="card-content">
                {customTopics.length === 0
                    ? (<p className="empty-message">Add your own activity topics to record anything the built-in topics don't cover.</p>)
                    : customTopics.map(topic => (
                        <div key={topic.key} className="activity activity-addition">
                            <div className="activity-inputs">
                                <div className="form-group">
                                    <label className="form-label">Name</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={topic.label || ''}
                                        onChange={(e) => handleChange(topic.key, 'label', e.target.value)}
                                        maxLength={Validation.InputMaxLength}
                                    />

                                    <label className="form-label">Display Name in Lists</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={topic.displayName || ''}
                                        onChange={(e) => handleChange(topic.key, 'displayName', e.target.value)}
                                        maxLength={Validation.InputMaxLength}
                                    />

                                    <label className="form-label">Alert Message</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={topic.displayName_Alert || ''}
                                        onChange={(e) => handleChange(topic.key, 'displayName_Alert', e.target.value)}
                                        maxLength={Validation.InputMaxLength}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Description</label>
                                    <textarea
                                        className="form-input"
                                        value={topic.description || ''}
                                        onChange={(e) => handleChange(topic.key, 'description', e.target.value)}
                                        rows={3}
                                    />

                                    <label className="form-label">Color</label>
                                    <input
                                        type="color"
                                        className="form-input"
                                        value={topic.color || CustomTopicDefaultColor}
                                        onChange={(e) => handleChange(topic.key, 'color', e.target.value)}
                                    />
                                </div>

                                <div className="activity-editor-actions">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="small"
                                        onClick={() => handleDelete(topic.key)}
                                        title="Delete topic"
                                    >
                                        <Trash2 size={buttonSize} />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))
                }
                <p className="setting-description">
                    Custom topics appear in a brew log's Activities section and in the Activity Timeline.
                </p>
            </div>
        </div>
    );
}

export default CustomActivityTopics;
