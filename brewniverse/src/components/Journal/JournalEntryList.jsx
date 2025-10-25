import { Book, Plus } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import Button from '../UI/Button';
import JournalEntryCard from './JournalEntryCard';

function JournalEntryList({ brewLogId }) {
    const navigate = useNavigate();
    const { state } = useApp();

    const journalEntries = state.journalEntries
        .filter(entry => entry.brewLogId === brewLogId)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
        <div className="brewlog-content-section">
            <div className="section-header-with-action">
                <h2>
                    <Book size={24} />
                    Journal Entries
                </h2>
                <Button
                    variant="secondary"
                    size="small"
                    onClick={() => navigate(`/journal/new?brewLogId=${brewLogId}`)}
                >
                    <Plus size={16} />
                    Add Entry
                </Button>
            </div>

            {journalEntries.length === 0 ? (
                <div className="empty-state-small">
                    <p>No journal entries for this brew log yet.</p>
                </div>
            ) : (
                <div className="recent-items">
                    {journalEntries.map(entry => (
                        <JournalEntryCard key={entry.id} entry={entry} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default JournalEntryList;

