import { BookOpen, Calendar, ListTree, Plus, Search, Star, Tag } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../Styles/JournalList.css';
import '../../Styles/Shared/list.css';
import '../../Styles/Shared/search.css';
import JournalEntryCard from './JournalEntryCard';
import ListHeader from '../Layout/ListHeader';
import Button from '../UI/Button';
import SearchSortControls from '../UI/SearchSortControls';
import BrewTypes from '../../constants/BrewTypes';
import { useApp } from '../../contexts/AppContext';

function JournalList() {
    const navigate = useNavigate();
    const { state } = useApp();
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('date');
    const [sortOrder, setSortOrder] = useState('desc');
    const [displayMode, setDisplayMode] = useState(() => {
        return localStorage.getItem('journal-display-mode') || 'grid';
    });

    const handleDisplayChange = (mode) => {
        setDisplayMode(mode);
        localStorage.setItem('journal-display-mode', mode);
    };

    const sortedEntries = useMemo(() => {
        let filteredEntries = state.journalEntries.filter(entry =>
            (entry.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (entry.brand || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (entry.notes || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (entry.venue || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (entry.style || '').toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (sortBy === 'date') {
            filteredEntries.sort((a, b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
            });
        }
        else if (sortBy === 'name') {
            const grouped = {};
            filteredEntries.forEach(entry => {
                const firstLetter = (entry.name || 'Unknown')[0].toUpperCase();
                if (!grouped[firstLetter]) {
                    grouped[firstLetter] = [];
                }
                grouped[firstLetter].push(entry);
            });

            Object.keys(grouped).forEach(groupKey => {
                grouped[groupKey].sort((a, b) => {
                    const nameA = a.name.toLowerCase();
                    const nameB = b.name.toLowerCase();
                    return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
                });
            });

            return grouped;
        }
        else if (sortBy === 'brand') {
            const grouped = {};
            filteredEntries.forEach(entry => {
                const groupKey = entry.brand || 'No Brand';
                if (!grouped[groupKey]) {
                    grouped[groupKey] = [];
                }
                grouped[groupKey].push(entry);
            });

            Object.keys(grouped).forEach(groupKey => {
                grouped[groupKey].sort((a, b) => {
                    const dateA = new Date(a.date);
                    const dateB = new Date(b.date);
                    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
                });
            });

            return grouped;
        }
        else if (sortBy === 'rating') {
            filteredEntries.sort((a, b) => {
                const ratingA = a.rating || 0;
                const ratingB = b.rating || 0;
                if (ratingA === ratingB) {
                    const dateA = new Date(a.date);
                    const dateB = new Date(b.date);
                    return dateB - dateA;
                }
                return sortOrder === 'asc' ? ratingA - ratingB : ratingB - ratingA;
            });
        }
        else if (sortBy === 'type') {
            const grouped = {};
            filteredEntries.forEach(entry => {
                const groupKey = entry.type;
                if (!grouped[groupKey]) {
                    grouped[groupKey] = [];
                }
                grouped[groupKey].push(entry);
            });

            Object.keys(grouped).forEach(groupKey => {
                grouped[groupKey].sort((a, b) => {
                    const dateA = new Date(a.date);
                    const dateB = new Date(b.date);
                    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
                });
            });

            return grouped;
        }

        return filteredEntries;
    }, [state.journalEntries, searchTerm, sortBy, sortOrder]);

    return (
        <div className="main-content-container">
            <div className="main-content-section brewlogs-list">
                <ListHeader
                    h1="Journal"
                    description="Track and rate beverages you've tasted"
                    buttonText="New Entry"
                    url="/journal/new"
                />

                <div className="main-content-section">
                    <SearchSortControls
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onSortChange={(newSortBy, newSortOrder) => {
                            setSortBy(newSortBy);
                            setSortOrder(newSortOrder);
                        }}
                        onDisplayChange={handleDisplayChange}
                        sortOptions={[
                            { key: 'date', label: 'Date', icon: Calendar },
                            { key: 'name', label: 'Name', icon: BookOpen },
                            { key: 'brand', label: 'Brand', icon: Tag },
                            { key: 'type', label: 'Type', icon: ListTree },
                            { key: 'rating', label: 'Rating', icon: Star, defaultOrder: 'desc' }
                        ]}
                        searchPlaceholder="Search entries by name, brand, venue, style, or notes..."
                    />
                </div>

                <div className="main-content-section">
                    {state.journalEntries.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">
                                <BookOpen size={64} />
                            </div>
                            <h3>No Journal Entries Yet</h3>
                            <p>Start tracking beverages you've tasted and rate your favorites.</p>
                            <Button
                                variant="primary"
                                size="large"
                                onClick={() => navigate('/journal/new')}
                            >
                                <Plus size={20} />
                                Create Your First Entry
                            </Button>
                        </div>
                    ) : (
                        <div className="items-container">
                            {sortBy === 'date' || sortBy === 'rating' ? (
                                <div className="recent-items">
                                    {sortedEntries.map((entry) => (
                                        <JournalEntryCard
                                            key={entry.id}
                                            entry={entry}
                                            displayOption={displayMode}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="items-grouped">
                                    {Object.entries(sortedEntries).map(([groupKey, entries]) => {
                                        let groupName = groupKey;
                                        let groupIcon = <BookOpen size={20} />;

                                        if (sortBy === 'type') {
                                            const brewType = BrewTypes.find(x => x.name === groupKey);
                                            if (brewType) {
                                                groupName = `${brewType.icon} ${brewType.name}`;
                                                groupIcon = null;
                                            }
                                        } else if (sortBy === 'brand') {
                                            groupIcon = <Tag size={20} />;
                                        } else if (sortBy === 'name') {
                                            groupIcon = null;
                                            groupName = groupKey;
                                        }

                                        return (
                                            <div key={groupKey} className="item-group">
                                                <div className="group-header">
                                                    <h3 className="group-title">
                                                        {groupIcon}
                                                        {groupName}
                                                    </h3>
                                                </div>
                                                <div className="recent-items">
                                                    {entries.map((entry) => (
                                                        <JournalEntryCard
                                                            key={entry.id}
                                                            entry={entry}
                                                            displayOption={displayMode}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {searchTerm && sortedEntries.length === 0 && (
                                <div className="empty-state">
                                    <div className="empty-icon">
                                        <Search size={64} />
                                    </div>
                                    <h3>No Results Found</h3>
                                    <p>No journal entries match your search criteria. Try adjusting your search terms.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default JournalList;