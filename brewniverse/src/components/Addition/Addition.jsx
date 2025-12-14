import React, { useState } from 'react';
import { ActivityTopicEnum } from '../../constants/ActivityTopics';
import { generateId, getDate } from '../../contexts/AppContext';
import ActivityModel from '../../models/Activity';
import { getGravityAbvVolumeData, getGravityActivities } from '../../utils/GravityCalculations';
import ActivityList from '../Activity/ActivityList';

function Addition({ formData, setFormData, brewLogId }) {
    const gravityActivities = getGravityActivities(formData.activity || [], ActivityTopicEnum.Gravity);

    const getGravityActivityByAddition = (additionActivity, gravityActivity) => {
        const data = getGravityAbvVolumeData(
            {
                addedAbv: parseFloat(additionActivity.addedAbv),
                addedVolume: parseFloat(additionActivity.addedVolume),
                date: additionActivity.date,
                description: additionActivity.description
            },
            gravityActivities,
            parseFloat(formData.volume) || 1
        );

        const result = new ActivityModel({
            alertId: gravityActivity?.alertId ?? null,
            brewLogId: additionActivity.brewLogId,
            date: additionActivity.date,
            description: data.description,
            id: gravityActivity?.Id ?? generateId(),
            name: 'Gravity Reading (Addition)',
            topic: ActivityTopicEnum.Gravity,
            //Gravity-specific fields
            addedAbv: data.addedAbv,
            addedGravity: data.addedGravity,
            addedVolume: data.addedVolume,
            abv: data.finalAbv,
            volume: data.finalVolume,
        });

        return result
    }

    const handleChange = (additionActivityId, field, value) => {
        const additionActivity = formData.activity?.find(act => act.id === additionActivityId);
        if (!additionActivity) {
            return;
        }

        const inputActivity = {
            ...additionActivity,
            [field]: value,
        };

        const { date, addedVolume } = inputActivity;

        if (!date || !addedVolume) {
            return;
        }

        if (field == "addedVolume" && isNaN(parseFloat(addedVolume))) {
            alert('Please provide a numeric volume.');
            return;
        }

        const existingGravityActivity = formData.activity?.find(act => act.additionActivityId === additionActivityId);

        const currentGravityActivity = getGravityActivityByAddition(
            {
                addedAbv: field === 'addedAbv' ? parseFloat(value) : inputActivity.addedAbv,
                addedVolume: field === 'addedVolume' ? parseFloat(value) : inputActivity.addedVolume,
                date: inputActivity.date ?? getDate(),
                description: field === 'description' ? value : inputActivity.description,
                brewLogId: brewLogId,
            },
            existingGravityActivity
        );

        setFormData(prev => {
            const prevData = prev.toJSON ? prev.toJSON() : prev;

            currentGravityActivity.additionActivityId = additionActivityId;

            if (!existingGravityActivity) {
                // Create new gravity activity
                return {
                    ...prevData,
                    activity: prevData.activity.concat(currentGravityActivity.toJSON())
                };
            }
            else {
                // Update existing gravity activity
                return {
                    ...prevData,
                    activity: prevData.activity.map(x =>
                        x.id === existingGravityActivity.id
                            ? currentGravityActivity.toJSON()
                            : x
                    )
                };
            }
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