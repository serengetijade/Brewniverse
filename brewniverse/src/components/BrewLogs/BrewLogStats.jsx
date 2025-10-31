import { BottleWine, Calendar, ChartLine, Clock, ListTree, MoveVertical, Shield, TrendingDown, Zap } from 'lucide-react';
import React from 'react';
import '../../Styles/BrewLogStats.css';
import { getTopicColorRgb, getTopicConfig, getTopicIcon } from '../../constants/ActivityTopics';
import { getCurrentAbv, getGravity13Break, getGravityActivities, getGravityFinal, getGravityOriginal, getPotentialAbv } from '../../utils/gravityCalculations';
import { ActivityTopicEnum, getActivitiesByTopic } from '../Activity/Activity';

function BrewLogStats({ brewLog }) {
    const gravityActivities = getGravityActivities(brewLog.activity || []);

    const stabilizedActivities = getActivitiesByTopic(brewLog, ActivityTopicEnum.DateStabilized);
    const dateStabilized = stabilizedActivities ?
        stabilizedActivities[stabilizedActivities.length - 1]?.date
        : undefined;

    const dateRackedActivities = getActivitiesByTopic(brewLog, ActivityTopicEnum.DateRacked);
    const dateRacked = dateRackedActivities ?
        dateRackedActivities[dateRackedActivities.length - 1]?.date
        : undefined;

    const dateBottledActivities = getActivitiesByTopic(brewLog, ActivityTopicEnum.DateBottled);
    const dateBottled = dateBottledActivities ?
        dateBottledActivities[dateBottledActivities.length - 1]?.date
        : undefined;

    const formatDate = (dateString) => {
        if (!dateString) return 'Not set';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const calculateDaysSince = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const topicConfig = getTopicConfig();

    const stats = [
        {
            id: 'dateCreated',
            icon: <Calendar size={20} />,
            label: 'Started',
            value: formatDate(brewLog.dateCreated),
            subtext: brewLog.dateCreated ? `${calculateDaysSince(brewLog.dateCreated)} days ago` : null,
            color: getTopicColorRgb(ActivityTopicEnum.DateCreated)
        },
        {
            id: 'type',
            icon: <ListTree size={20} />,
            label: 'Type',
            value: brewLog.type || 'Not specified',
            subtext: brewLog.volume ? `${brewLog.volume} volume` : null,
            color: '255,208,51'
        },
        {
            id: 'og',
            icon: getTopicIcon(ActivityTopicEnum.Gravity),
            label: 'Original Gravity',
            value: gravityActivities.length > 0 ? getGravityOriginal(gravityActivities) : 'Not recorded',
            subtext: gravityActivities.length > 0 ? `1/3 Break: ${getGravity13Break(gravityActivities)}` : null,
            color: getTopicColorRgb(ActivityTopicEnum.Gravity)
        },
        {
            id: 'fg',
            icon: <TrendingDown size={20} />,
            label: 'Current Gravity',
            value: gravityActivities.length > 1 ? getGravityFinal(gravityActivities) : 'In progress',
            subtext: gravityActivities.length > 0 ? `${gravityActivities.length} readings` : null,
            color: '153,51,255'
        },
        {
            id: 'abv',
            icon: <Zap size={20} />,
            label: 'Current ABV',
            value: gravityActivities.length > 0 ? `${getCurrentAbv(gravityActivities)}%` : 'N/A',
            subtext: gravityActivities.length > 0 ? `Potential: ${getPotentialAbv(gravityActivities)}%` : null,
            color: '204,102,204'
        },
        {
            id: 'dateRacked',
            icon: getTopicIcon(ActivityTopicEnum.DateRacked),
            label: 'Racked',
            value: formatDate( dateRacked),
            subtext: dateRacked ? `${calculateDaysSince(dateRacked)} days ago` : null,
            color: getTopicColorRgb(ActivityTopicEnum.DateRacked)
        },
        {
            id: 'dateStabilized',
            icon: getTopicIcon(ActivityTopicEnum.DateStabilized),
            label: 'Stabilized',
            value: formatDate(dateStabilized),
            subtext: dateStabilized ? `${calculateDaysSince(dateStabilized)} days ago` : null,
            color: getTopicColorRgb(ActivityTopicEnum.DateStabilized)
        },
        {
            id: 'dateBottled',
            icon: getTopicIcon(ActivityTopicEnum.DateBottled),
            label: 'Bottled',
            value: formatDate(dateBottled),
            subtext: dateBottled ? `${calculateDaysSince(dateBottled)} days ago` : null,
            color: getTopicColorRgb(ActivityTopicEnum.DateBottled)
        }
    ];

    const getBrewStatus = () => {
        if (dateBottledActivities.length > 0) {
            return { label: 'Bottled', color: 'highlight', icon: <BottleWine size={16} /> };
        } else if (stabilizedActivities.length > 0) {
            return { label: 'Stabilized', color: 'accent', icon: <Shield size={16} /> };
        } else if (dateRackedActivities.length > 0) {
            return { label: 'Racked', color: 'secondary', icon: <MoveVertical size={16} /> };
        } else if (gravityActivities.length > 0) {
            return { label: 'Fermenting', color: 'primary', icon: <Clock size={16} /> };
        }
        return { label: 'Started', color: 'accent', icon: <Calendar size={16} /> };
    };

    const status = getBrewStatus();

    return (
        <div className="brewlog-stats-container">
            <div className="brewlog-stats-header">
                <h3><ChartLine size={20} /> Brew Statistics</h3>
                <div className={`brew-status-badge ${status.color}`}>
                    {status.icon}
                    {status.label}
                </div>
            </div>

            <div className="brewlog-stats-grid">
                {stats.map((stat) => (
                    <div key={stat.id} className="stat-card">
                        <div className={`stat-icon`} style={{ color: `rgb(${stat.color}`, backgroundColor: `rgba(${stat.color}, 0.2)` }}  >
                            {stat.icon}
                        </div>
                        <div className="stat-content">
                            <div className="stat-label">{stat.label}</div>
                            <div className="stat-value">{stat.value}</div>
                            {stat.subtext && <div className="stat-subtext">{stat.subtext}</div>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default BrewLogStats;

