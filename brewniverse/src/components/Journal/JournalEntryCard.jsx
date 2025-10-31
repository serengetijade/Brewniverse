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
                    <h4>{brewTypeConfig.icon} {entry.name} {(entry.brand && entry.brand != "Brewniverse") && <span>({entry.brand})</span>}</h4>
                    <p>{entry.type}</p>
                    <Rating value={entry.rating || 0} isEditing={false} />
                    <small>{new Date(entry.date).toLocaleDateString()}</small>
                </div>
                <Button
                    variant="ghost"
                    size="small"
                    onClick={() => navigate(`/journal/${entry.id}`)}
                >
                    <SquarePen size={18} />Edit
                </Button>
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
                                <h3 className="item-title journal-name">{entry.name}</h3>
                            </div>
                        </div>
                        <div className="item-content">
                            <div className="item-date journal-date">
                                <Calendar size={14} />
                                <span>{new Date(entry.date).toLocaleDateString()}</span>
                            </div>
                            <Rating value={entry.rating || 0} isEditing={false} />
                        </div>
                    </div>
                    <div className="list-view-actions item-actions">
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
