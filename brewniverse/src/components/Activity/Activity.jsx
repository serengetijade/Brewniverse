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
    item,
    itemLabel,
    brewLogId })
{
    const [editActivity, setActivity] = React.useState(null);

    const nameInputRef = useRef(null);
    useEffect(() => {
        if (nameInputRef.current) {
            nameInputRef.current.focus();
        }
    }, []);

    let buttonSize = 14;

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
        <div key={item.id} className="compact-item">
            <div className="form-group">
                <label className="form-label">{itemLabel}</label>
                <input
                    type={(item.topic == "Gravity") ? "number" : "text"}
                    step="0.001"
                    className="form-input"
                    placeholder="Item details"
                    value={item.description ?? ''}
                    onChange={(e) => updateActivity(item.id, 'description', e.target.value)}
                />
            </div>
            <div className="form-group">
                <label className="form-label">Date</label>
                <input
                    type="datetime-local"
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
                    <Trash2 size={buttonSize} />
                </Button>
            </div>
        </div>        
    );
};

export default Activity;