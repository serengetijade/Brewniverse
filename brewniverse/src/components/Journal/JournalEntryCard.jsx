import { BookOpen, Calendar, SquarePen } from 'lucide-react';
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
            <div className="recent-item" style={{ borderLeftColor: brewTypeConfig.color }}>
                <div className="recent-item-content">
                    <h4>{brewTypeConfig.icon} {entry.name} {(entry.brand && entry.brand != "Brewniverse") && <span>({ entry.brand })</span>}</h4>
                    <p>{entry.type}</p>
                    <Rating value={entry.rating || 0} isEditing={false} />
                    <small>{new Date(entry.date).toLocaleDateString()}</small>
                </div>
                <Button
                    variant="outline"
                    size="small"
                    onClick={() => navigate(`/journal/${entry.id}`)}
                >
                    View
                </Button>
            </div>
        );
    } else {
        // List display mode
        return (
            <div className="item-card journal-card displayList" style={{ '--item-color': brewTypeConfig.color }}>
                <div className="recipe-card-accent"></div>
                <div className="displayList-grid">
                    <div className="displayList-body">
                        <div className="brewlog-header">
                            <div className="brewlog-type">
                                <span className="brewlog-type-icon-large">{brewTypeConfig.icon}</span>
                                <h3 className="brewlog-name">{entry.name}</h3>
                            </div>
                        </div>
                        <div className="item-content">
                            <div className="brewlog-date">
                                <Calendar size={14} />
                                <span>{new Date(entry.date).toLocaleDateString()}</span>
                            </div>
                            <Rating value={entry.rating || 0} isEditing={false} />
                        </div>
                    </div>
                    <div className="displayList-actions item-actions">
                        {entry.brewLogId &&  
                        <Button
                            variant="ghost"
                            size="small"
                            onClick={() => navigate(`/brewlogs/${entry.brewLogId}`)}
                        >
                            <BookOpen size={16} />
                        </Button>}
                        <Button
                            variant="ghost"
                            size="small"
                            onClick={() => navigate(`/journal/${entry.id}/edit`)}
                        >
                            <SquarePen size={16} />
                        </Button>
                    </div>
                </div>
            </div>
        );
    }
}

export default JournalEntryCard;
