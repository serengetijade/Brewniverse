import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getBrewTypeConfig } from '../../constants/BrewTypes';
import Button from '../UI/Button';
import Rating from '../UI/Rating';

function JournalEntryCard({ entry }) {
    const navigate = useNavigate();
    const brewTypeConfig = getBrewTypeConfig(entry.type);

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
}

export default JournalEntryCard;
