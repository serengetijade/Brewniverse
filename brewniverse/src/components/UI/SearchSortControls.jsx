import { BookOpen, Calendar, FileText, Grid3x3, List, Search, Star } from 'lucide-react';
import React from 'react';
import Button from './Button';

function SearchSortControls({
    searchTerm,
    onSearchChange,
    sortBy,
    sortOrder,
    onSortChange,
    onDisplayChange,
    sortOptions = [
        { key: 'date', label: 'Date', icon: Calendar },
        { key: 'rating', label: 'Rating', icon: Star },
        { key: 'brewlog', label: 'Brew Log', icon: BookOpen },
        { key: 'recipe', label: 'Recipe', icon: FileText }
    ],
    searchPlaceholder = "Search items..."
}) {
    const handleSortClick = (sortKey) => {
        if (sortBy === sortKey) {
            onSortChange(sortKey, sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            // Find the sort option to check if it has a defaultOrder
            const sortOption = sortOptions.find(opt => opt.key === sortKey);
            const defaultOrder = sortOption?.defaultOrder || 'asc';
            onSortChange(sortKey, defaultOrder);
        }
    };

    return (
        <div className="search-sort-controls">
            {onDisplayChange && (
                <div className="display-controls">
                    <Button
                        variant="ghost"
                        size="small"
                        onClick={() => onDisplayChange('grid')}
                        className="display-button"
                    >
                        <Grid3x3 size={16} />
                        Grid
                    </Button>
                    <Button
                        variant="ghost"
                        size="small"
                        onClick={() => onDisplayChange('list')}
                        className="display-button"
                    >
                        <List size={16} />
                        List
                    </Button>
                </div>
            )}
            <div className="search-bar">
                <Search size={20} className="search-icon" />
                <input
                    type="text"
                    placeholder={searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="search-input"
                />
            </div>

            <div className="sort-controls">
                <div className="sort-buttons">
                    {sortOptions.map(({ key, label, icon: Icon }) => (
                        <Button
                            key={key}
                            variant={sortBy === key ? 'primary' : 'outline'}
                            size="small"
                            onClick={() => handleSortClick(key)}
                            className="sort-button"
                        >
                            <Icon size={16} />
                            {label} {sortBy === key && (sortOrder === 'asc' ? '↑' : '↓')}
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default SearchSortControls;
