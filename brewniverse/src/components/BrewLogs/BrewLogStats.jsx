import React from 'react';
import {
    Calendar,
    Beaker,
    Droplets,
    BottleWine,
    Shield,
    MoveVertical,
    Clock,
    TrendingDown,
    Zap
} from 'lucide-react';
import { getGravityActivities, getGravityOriginal, getGravityFinal, getGravity13Break, getCurrentAbv, getPotentialAbv } from '../../utils/gravityCalculations';
import '../../Styles/Shared/brewLogStats.css';

function BrewLogStats({ brewLog }) {
    const gravityActivities = getGravityActivities(brewLog.activity || []);

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

    const stats = [
        {
            id: 'dateCreated',
            icon: <Calendar size={20} />,
            label: 'Started',
            value: formatDate(brewLog.dateCreated),
            subtext: brewLog.dateCreated ? `${calculateDaysSince(brewLog.dateCreated)} days ago` : null,
            color: 'primary'
        },
        {
            id: 'type',
            icon: <Beaker size={20} />,
            label: 'Type',
            value: brewLog.type || 'Not specified',
            subtext: brewLog.volume ? `${brewLog.volume} volume` : null,
            color: 'accent'
        },
        {
            id: 'og',
            icon: <Droplets size={20} />,
            label: 'Original Gravity',
            value: gravityActivities.length > 0 ? getGravityOriginal(gravityActivities) : 'Not recorded',
            subtext: gravityActivities.length > 0 ? `1/3 Break: ${getGravity13Break(gravityActivities)}` : null,
            color: 'info'
        },
        {
            id: 'fg',
            icon: <TrendingDown size={20} />,
            label: 'Current Gravity',
            value: gravityActivities.length > 1 ? getGravityFinal(gravityActivities) : 'In progress',
            subtext: gravityActivities.length > 0 ? `${gravityActivities.length} readings` : null,
            color: 'secondary'
        },
        {
            id: 'abv',
            icon: <Zap size={20} />,
            label: 'Current ABV',
            value: gravityActivities.length > 0 ? `${getCurrentAbv(gravityActivities)}%` : 'N/A',
            subtext: gravityActivities.length > 0 ? `Potential: ${getPotentialAbv(gravityActivities)}%` : null,
            color: 'success'
        },
        {
            id: 'dateRacked',
            icon: <MoveVertical size={20} />,
            label: 'Racked',
            value: formatDate(brewLog.dateRacked),
            subtext: brewLog.dateRacked ? `${calculateDaysSince(brewLog.dateRacked)} days ago` : null,
            color: 'highlight'
        },
        {
            id: 'dateStabilized',
            icon: <Shield size={20} />,
            label: 'Stabilized',
            value: formatDate(brewLog.dateStabilized),
            subtext: brewLog.dateStabilized ? `${calculateDaysSince(brewLog.dateStabilized)} days ago` : null,
            color: 'warning'
        },
        {
            id: 'dateBottled',
            icon: <BottleWine size={20} />,
            label: 'Bottled',
            value: formatDate(brewLog.dateBottled),
            subtext: brewLog.dateBottled ? `${calculateDaysSince(brewLog.dateBottled)} days ago` : null,
            color: 'success'
        }
    ];

    // Calculate brew status
    const getBrewStatus = () => {
        if (brewLog.dateBottled) {
            return { label: 'Bottled', color: 'success', icon: <BottleWine size={16} /> };
        } else if (brewLog.dateStabilized) {
            return { label: 'Stabilized', color: 'warning', icon: <Shield size={16} /> };
        } else if (brewLog.dateRacked) {
            return { label: 'Racked', color: 'info', icon: <MoveVertical size={16} /> };
        } else if (gravityActivities.length > 0) {
            return { label: 'Fermenting', color: 'primary', icon: <Clock size={16} /> };
        }
        return { label: 'Started', color: 'accent', icon: <Calendar size={16} /> };
    };

    const status = getBrewStatus();

    return (
        <div className="brewlog-stats-container">
            <div className="brewlog-stats-header">
                <h3>Brew Statistics</h3>
                <div className={`brew-status-badge ${status.color}`}>
                    {status.icon}
                    {status.label}
                </div>
            </div>

            <div className="brewlog-stats-grid">
                {stats.map((stat) => (
                    <div key={stat.id} className="stat-card">
                        <div className={`stat-icon ${stat.color}`}>
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

