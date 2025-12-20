import React from 'react';
import { useApp } from '../../contexts/AppContext';
import JournalEntryCard from './JournalEntryCard';

function JournalEntryList({ brewLogId }) {
    const { state } = useApp();

    const journalEntries = state.journalEntries
        .filter(entry => entry.brewLogId === brewLogId)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
        <div>
            {journalEntries.length === 0 ? (
                <div className="empty-state-small">
                    <p>No journal entries for this brew log yet. Add an entry to record tasting notes and impressions.</p>
                </div>
            ) : (
                <div className="recent-items">
                    {journalEntries.map(entry => (
                        <JournalEntryCard
                            key={entry.id}
                            entry={entry}
                            displayOption="list"
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default JournalEntryList;