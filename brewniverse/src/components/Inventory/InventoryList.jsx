import React, { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Star } from 'lucide-react';
import '../../Styles/Inventory.css';
import '../../Styles/Rating.css';
import { ActionTypes, useApp } from '../../contexts/AppContext';
import InventoryRecord from './InventoryRecord';

function InventoryList({ showHeader = true }) {
    const { state, dispatch } = useApp();
    const [sortBy, setSortBy] = useState('date'); //default selection
    const [sortOrder, setSortOrder] = useState('desc'); //default order
    const [showRatings, setShowRatings] = useState(true);
    const [showAllBrewLogs, setShowAllBrewLogs] = useState(true);
    const hasAnyBrewLogs = (state.brewLogs || []).length > 0;

    const sortedBrewLogs = useMemo(() => {
        const brewLogs = [...(state.brewLogs || [])];
        const getName = (brewLog) => (brewLog.name || '').toLowerCase();
        const getInventory = (brewLog) => {
            const value = Number.parseFloat(brewLog.inventory);
            return Number.isNaN(value) ? 0 : value;
        };
        const getRating = (brewLog) => {
            const value = Number.parseFloat(brewLog.rating);
            return Number.isNaN(value) ? 0 : value;
        };

        const filteredBrewLogs = showAllBrewLogs
            ? brewLogs
            : brewLogs.filter((brewLog) => getInventory(brewLog) > 0);

        filteredBrewLogs.sort((a, b) => {
            let comparison = 0;
            if (sortBy === 'name') {
                comparison = getName(a).localeCompare(getName(b));
            }
            else if (sortBy === 'date') {
                comparison = new Date(a.dateCreated) - new Date(b.dateCreated);
            }
            else if (sortBy === 'count') {
                comparison = getInventory(a) - getInventory(b);
            }
            else if (sortBy === 'rating') {
                comparison = getRating(a) - getRating(b);
            }

            if (comparison === 0 && sortBy !== 'name') {
                comparison = getName(a).localeCompare(getName(b));
            }

            return sortOrder === 'asc' ? comparison : comparison * -1;
        });

        return filteredBrewLogs;
    }, [state.brewLogs, sortBy, sortOrder, showAllBrewLogs]);

    const handleInventoryChange = (brewLogId, value) => {
        dispatch({
            type: ActionTypes.updateBrewLog,
            payload: {
                id: brewLogId,
                inventory: value
            }
        });
    };

    return (
        <div className="inventory-list">
            <div className="inventory-sort-controls">
                <select
                    className="inventory-sort-select"
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value)}
                    aria-label="Sort inventory list by"
                >
                    <option value="date">Date Created</option>
                    <option value="count">Inventory Count</option>
                    <option value="name">Name</option>
                    <option value="rating">Rating</option>
                </select>
                <button
                    type="button"
                    className="inventory-sort-button"
                    onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                    aria-label={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
                >
                    {sortOrder === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                </button>
                <button
                    type="button"
                    className="inventory-sort-button"
                    onClick={() => setShowAllBrewLogs((prev) => !prev)}
                    aria-label={showAllBrewLogs ? 'Show only inventory on hand' : 'Show all brew logs'}
                    aria-pressed={!showAllBrewLogs}
                >
                    {showAllBrewLogs ? 'All' : '#'}
                </button>
                <button
                    type="button"
                    className="inventory-sort-button"
                    onClick={() => setShowRatings((prev) => !prev)}
                    aria-label={showRatings ? 'Hide ratings' : 'Show ratings'}
                    aria-pressed={showRatings}
                >
                    <Star
                        size={16}
                        className={`star ${showRatings ? 'star-filled' : 'star-empty'}`}
                        fill={showRatings ? 'currentColor' : 'none'}
                    />
                </button>
            </div>
            {showHeader && (
                <div className="inventory-header">
                    <span>Brew Log</span>
                    <span>Quantity</span>
                </div>
            )}
            {sortedBrewLogs.length > 0 ? (
                sortedBrewLogs.map((brewLog) => (
                    <InventoryRecord
                        key={brewLog.id}
                        name={brewLog.name}
                        quantity={brewLog.inventory ?? ''}
                        showName={true}
                        showRating={showRatings}
                        rating={brewLog.rating || 0}
                        inputId={`inventory-${brewLog.id}`}
                        onQuantityChange={(value) => handleInventoryChange(brewLog.id, value)}
                    />
                ))
            ) : (
                <div className="inventory-empty">
                    {hasAnyBrewLogs && !showAllBrewLogs
                        ? 'No inventory'
                        : 'No brew logs available to track inventory yet.'}
                </div>
            )}
        </div>
    );
}

export default InventoryList;