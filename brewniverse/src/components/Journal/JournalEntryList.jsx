import React from 'react';
import { useApp } from '../../contexts/AppContext';
import JournalEntryCard from './JournalEntryCard';

function JournalEntryList({ brewLogId, showHeading = false }) {
    const { state } = useApp();

    const journalEntries = state.journalEntries
        .filter(entry => entry.brewLogId === brewLogId)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
        <div>
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