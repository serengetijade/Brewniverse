import { Calendar, Droplet, TrendingUp } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getBrewTypeConfig } from '../../constants/BrewTypes';
import { getCurrentAbv, getGravityActivities, getGravityFinal } from '../../utils/gravityCalculations';
import Button from '../UI/Button';
import Rating from '../UI/Rating';

function BrewLogCard({ brewLog }) {
    const navigate = useNavigate();
    const brewTypeConfig = getBrewTypeConfig(brewLog.type);

    // Calculate gravity-based values
    const gravityActivities = getGravityActivities(brewLog.activity || []);
    const currentAbv = getCurrentAbv(gravityActivities);
    const gravityFinal = getGravityFinal(gravityActivities);

    return (
        <div className="item-card brewlog-card" style={{ '--item-color': brewTypeConfig.color }}>
            <div className="brewlog-card-accent"></div>
            <div className="brewlog-header">
                <div className="brewlog-type">
                    <span className="brewlog-type-icon-large">{brewTypeConfig.icon}</span>
                    <div className="brewlog-type-info">
                        <span className="type-text">{brewLog.type}</span>
                        <div className="brewlog-date">
                            <Calendar size={14} />
                            <span>{new Date(brewLog.dateCreated).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
                <div className="brewlog-status">
                    {brewLog.dateBottled ? (
                        <span className="status-badge status-completed">Bottled</span>
                    ) : brewLog.dateRacked ? (
                        <span className="status-badge status-racked">Secondary</span>
                    ) : (
                        <span className="status-badge status-fermenting">Fermenting</span>
                    )}
                </div>
            </div>

            <div className="item-content">
                <h3 className="brewlog-name">{brewLog.name}</h3>
                {brewLog.description && (
                    <p className="item-description">{brewLog.description}</p>
                )}

                <Rating value={brewLog.rating || 0} isEditing={false} />

                {(currentAbv || gravityFinal) && (
                    <div className="brewlog-card-stats-grid">
                        {currentAbv && (
                            <div className="brewlog-card-stat">
                                <div className="brewlog-card-stat-icon">
                                    <TrendingUp size={16} />
                                </div>
                                <div className="brewlog-card-stat-info">
                                    <span className="brewlog-card-stat-label">Current ABV</span>
                                    <span className="brewlog-card-stat-value">{currentAbv}%</span>
                                </div>
                            </div>
                        )}
                        {gravityFinal && (
                            <div className="brewlog-card-stat">
                                <div className="brewlog-card-stat-icon">
                                    <Droplet size={16} />
                                </div>
                                <div className="brewlog-card-stat-info">
                                    <span className="brewlog-card-stat-label">Current Gravity</span>
                                    <span className="brewlog-card-stat-value">{gravityFinal}</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="item-actions">
                <Button
                    variant="outline"
                    size="medium"
                    onClick={() => navigate(`/brewlogs/${brewLog.id}`)}
                >
                    View Details
                </Button>
                <Button
                    variant="ghost"
                    size="medium"
                    onClick={() => navigate(`/brewlogs/${brewLog.id}/edit`)}
                >
                    Edit
                </Button>
            </div>
        </div>
    );
}

export default BrewLogCard;