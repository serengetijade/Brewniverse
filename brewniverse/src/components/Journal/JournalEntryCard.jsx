import { BookOpen, Calendar, MapPin, Percent, SquarePen, Tag } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getBrewTypeConfig } from '../../constants/BrewTypes';
import Button from '../UI/Button';
import Rating from '../UI/Rating';

function JournalEntryCard({ entry, displayOption = 'grid' }) {
    const navigate = useNavigate();
    const brewTypeConfig = getBrewTypeConfig(entry.type);

    if (displayOption === 'grid') {
        return (
            <div className="item-card grid-view journal-entry-card" style={{ '--item-color': brewTypeConfig.color }}>
                <div className="item-card-accent"></div>
                
                <div className="item-card-header journal-entry-header">
                    <div className="journal-entry-type">
                        <span className="item-type-icon-large">{brewTypeConfig.icon}</span>
                        <div className="journal-entry-type-info">
                            <span className="type-text">{entry.type}</span>
                            <div className="journal-entry-date">
                                <Calendar size={14} />
                                <span>{new Date(entry.date).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                    {entry.brand && entry.brand !== "Brewniverse" && (
                        <div className="journal-entry-brand-badge">
                            <Tag size={12} />
                            <span>{entry.brand}</span>
                        </div>
                    )}
                </div>

                <div className="item-card-content">
                    <h3 className="item-title">{entry.name}</h3>
                    
                    {entry.style && (
                        <p className="journal-entry-style">{entry.style}</p>
                    )}

                    <Rating value={entry.rating || 0} isEditing={false} />

                    {(entry.abv || entry.venue) && (
                        <div className="item-card-stat-grid">
                            {entry.abv && (
                                <div className="item-card-stat">
                                    <div className="item-card-stat-icon">
                                        <Percent size={16} />
                                    </div>
                                    <div className="item-card-stat-info">
                                        <span className="item-card-stat-label">ABV</span>
                                        <span className="item-card-stat-value">
                                            {parseFloat(entry.abv) ? parseFloat(entry.abv) + '%' : '--'}
                                        </span> 
                                    </div>
                                </div>
                            )}
                            {entry.venue && (
                                <div className="item-card-stat">
                                    <div className="item-card-stat-icon">
                                        <MapPin size={16} />
                                    </div>
                                    <div className="item-card-stat-info">
                                        <span className="item-card-stat-label">Venue</span>
                                        <span className="item-card-stat-value">{entry.venue}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="item-card-actions">
                    {entry.brewLogId &&
                        <Button
                            className="item-card-actions-col2"
                            variant="ghost"
                            size="medium"
                            onClick={() => navigate(`/brewlogs/${entry.brewLogId}`)}
                        >
                            <BookOpen size={18} />Brew Log
                        </Button>}
                    <Button
                        variant="ghost"
                        size="medium"
                        onClick={() => navigate(`/journal/${entry.id}`)}
                    >
                        <SquarePen size={18} />Edit
                    </Button>
                </div>
            </div>
        );
    } else {
        // List display mode
        return (
            <div className="item-card journal-card list-view" style={{ '--item-color': brewTypeConfig.color }}>
                <div className="item-card-accent journal-card-accent"></div>
                <div className="list-view-row">
                    <div className="list-view-body">
                        <div className="item-header journal-header">
                            <div className="item-type journal-type">
                                <span className="item-type-icon-large journal-type-icon-large">{brewTypeConfig.icon}</span>
                                <h3 className="item-title">{entry.name}</h3>
                            </div>
                        </div>
                        {/*<div className="item-content">*/}
                        {/*    <div className="item-date journal-date">*/}
                        {/*        <Calendar size={14} />*/}
                        {/*        <span>{new Date(entry.date).toLocaleDateString()}</span>*/}
                        {/*    </div>*/}
                        {/*    <Rating value={entry.rating || 0} isEditing={false} />*/}
                        {/*</div>*/}
                    </div>
                    <div className="list-view-actions item-card-actions">
                        {entry.brewLogId &&
                            <Button
                                variant="ghost"
                                size="medium"
                                onClick={() => navigate(`/brewlogs/${entry.brewLogId}`)}
                            >
                                <BookOpen size={18} />
                            </Button>}
                        <Button
                            variant="ghost"
                            size="medium"
                            onClick={() => navigate(`/journal/${entry.id}/edit`)}
                        >
                            <SquarePen size={18} />
                        </Button>
                    </div>
                </div>
            </div>
        );
    }
}

export default JournalEntryCard;
