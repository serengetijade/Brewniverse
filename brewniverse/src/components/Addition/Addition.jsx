import React from 'react';
import { ActivityTopicEnum } from '../../constants/ActivityTopics';
import { generateId, getDate } from '../../contexts/AppContext';
import ActivityModel from '../../models/Activity';
import { getCurrentAbv, getGravityAbvVolumeData, getGravityActivities } from '../../utils/GravityCalculations';
import ActivityList from '../Activity/ActivityList';

function Addition({ formData, setFormData, brewLogId }) {
    const gravityActivities = getGravityActivities(formData.activity || [], ActivityTopicEnum.Gravity);

    const getGravityActivityByAddition = (additionActivity, gravityActivity) => {
        const data = getGravityAbvVolumeData(
            {
                addedAbv: parseFloat(additionActivity.addedAbv),
                addedGravity: parseFloat(additionActivity.addedGravity),
                addedVolume: parseFloat(additionActivity.addedVolume),
                date: additionActivity.date,
                description: additionActivity.description,
            },
            gravityActivities,
            parseFloat(formData.volume) || 1
        );

        const result = new ActivityModel({
            alertId: gravityActivity?.alertId ?? null,
            brewLogId: additionActivity.brewLogId,
            date: additionActivity.date,
            description: data.gravity,
            id: gravityActivity?.Id ?? generateId(),
            name: 'Gravity Reading (Addition)',
            topic: ActivityTopicEnum.Gravity,
            //Gravity-specific fields
            addedAbv: data.addedAbv,
            addedGravity: data.addedGravity,
            addedVolume: data.addedVolume,
            abv: data.abv,
            volume: data.volume,
        });

        return result
    }

    const handleChange = (additionActivityId, field, value) => {
        setFormData(prev => {
            const prevData = prev.toJSON ? prev.toJSON() : prev;
            
            const additionActivity = prevData.activity?.find(act => act.id === additionActivityId);
            if (!additionActivity) {
                return prevData; // No change if activity not found
            }

            const inputActivity = {
                ...additionActivity,
                [field]: value,
            };

            const { date, addedVolume } = inputActivity;

            if (field == "addedVolume" && value !== '' && isNaN(parseFloat(value))) {
                alert('Please provide a numeric volume.');
                return prevData; // No change if validation fails
            }

            // Always update the addition activity with the new field value
            let updatedActivities = prevData.activity.map(x =>
                x.id === additionActivityId
                    ? { ...x, [field]: value}
                    : x
            );

            // Only create/update gravity activity if we have required fields
            if (date && addedVolume) {
                const existingGravityActivity = prevData.activity?.find(act => act.additionActivityId === additionActivityId);

                const currentGravityActivity = getGravityActivityByAddition(
                    {
                        addedAbv: parseFloat(inputActivity.addedAbv) || 0,
                        addedGravity: parseFloat(inputActivity.addedGravity),
                        addedVolume: parseFloat(inputActivity.addedVolume),
                        date: inputActivity.date ?? getDate(),
                        description: inputActivity.description,
                        brewLogId: brewLogId,
                    },
                    existingGravityActivity
                );

                currentGravityActivity.additionActivityId = additionActivityId;

                if (!existingGravityActivity) {
                    // Create new gravity activity
                    updatedActivities = updatedActivities.concat(currentGravityActivity.toJSON());
                } 
                else {
                    // Update existing gravity activity
                    updatedActivities = updatedActivities.map(x =>
                        x.id === existingGravityActivity.id
                            ? currentGravityActivity.toJSON()
                            : x
                    );
                }
            }

            const currentAbv = getCurrentAbv(updatedActivities);

            return {
                ...prevData,
                activity: updatedActivities,
                currentAbv: currentAbv
            };
        });
    };

    return (
        <div className="additions-container">
            <ActivityList
                formData={formData}
                setFormData={setFormData}
                topic={ActivityTopicEnum.Addition}
                sectionInfoMessage=""
                brewLogId={brewLogId}
                modeAction={handleChange}
                showTopButton={true}
                showBottomButton={true}
            />
        </div>
    );
}

export default Addition;