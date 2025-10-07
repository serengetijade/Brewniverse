import React, { useEffect, useRef } from 'react';
import { Plus } from 'lucide-react';
import Button from '../UI/Button';
import '../../Styles/Activity.css';
import Activity from './Activity';

const topics = [
    'Acid', 'Base', 'Gravity', 'GravityFinal',
    'Nutrient', 'PecticEnzyme', 'Racked', 'Tannin', 'Yeast', 'Other'
];

const activityStatus = [ "Pending", "Complete"]

function ActivityList({
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

        // Get today's date/time in local timezone (YYYY-MM-DDTHH:MM)
        const getTodayLocal = () => {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            const hour = String(today.getHours()).padStart(2, '0');
            const minute = String(today.getMinutes()).padStart(2, '0');
            return `${year}-${month}-${day}T${hour}:${minute}`;
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
                    <div className="compact-list">
                        {getActivitiesByTopic(topic).map((item) => (
                            <Activity
                                formData={formData}
                                setFormData={setFormData}
                                item={item}
                                itemLabel={itemLabel}
                                brewLogId={formData.id}
                            />
                        ))}
                    </div>         
                )
            }
        </div>
    );
};

export default ActivityList;