import { BookOpen, Calendar, FileText, Plus, Search, Star, Type, ArrowDownAZ } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../Styles/BrewLogsList.css';
import '../../Styles/Shared/list.css';
import '../../Styles/Shared/search.css';
import { useApp } from '../../contexts/AppContext';
import ListHeader from '../Layout/ListHeader';
import Button from '../UI/Button';
import SearchSortControls from '../UI/SearchSortControls';
import BrewLogCard from './BrewLogCard';
function BrewLogsList() {
    const navigate = useNavigate();
    const { state } = useApp();
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('date');
    const [sortOrder, setSortOrder] = useState('desc');
    const [displayMode, setDisplayMode] = useState(() => {
        return localStorage.getItem('brewlogs-display-mode') || 'grid';
    });

    const handleDisplayChange = (mode) => {
        setDisplayMode(mode);
        localStorage.setItem('brewlogs-display-mode', mode);
    };

    const processedBrewLogs = useMemo(() => {
        let filteredBrewLogs = state.brewLogs.filter(brewLog =>
            (brewLog.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (brewLog.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (brewLog.type || '').toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (sortBy === 'date') {
            filteredBrewLogs.sort((a, b) => {
                const dateA = new Date(a.dateCreated);
                const dateB = new Date(b.dateCreated);
                return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
            });
        }
        else if (sortBy === 'name') {
            filteredBrewLogs.sort((a, b) => {
                const nameA = a.name.toLowerCase();
                const nameB = b.name.toLowerCase();
                if (nameA === nameB) {
                    // ThenBy date
                    const dateA = new Date(a.dateCreated);
                    const dateB = new Date(b.dateCreated);
                    return dateB - dateA;
                }
                return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
            });
        }
        else if (sortBy === 'type') {
            filteredBrewLogs.sort((a, b) => {
                const typeA = a.type.toLowerCase();
                const typeB = b.type.toLowerCase();
                if (typeA === typeB) {
                    // ThenBy date
                    const dateA = new Date(a.dateCreated);
                    const dateB = new Date(b.dateCreated);
                    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
                }
                return sortOrder === 'asc' ? typeA.localeCompare(typeB) : typeB.localeCompare(typeA);
            });
        }
        else if (sortBy === 'rating') {
            filteredBrewLogs.sort((a, b) => {
                const ratingA = a.rating || 0;
                const ratingB = b.rating || 0;
                if (ratingA === ratingB) {
                    // ThenBy date
                    const dateA = new Date(a.dateCreated);
                    const dateB = new Date(b.dateCreated);
                    return dateB - dateA;
                }
                return sortOrder === 'asc' ? ratingA - ratingB : ratingB - ratingA;
            });
        }
        else if (sortBy === 'recipe') {
            // Group by recipe, ThenBy date 
            const grouped = {};
            filteredBrewLogs.forEach(brewLog => {
                const recipeId = brewLog.recipeId || 'no-recipe';
                if (!grouped[recipeId]) {
                    grouped[recipeId] = [];
                }
                grouped[recipeId].push(brewLog);
            });

            // Sort by date
            Object.keys(grouped).forEach(recipeId => {
                grouped[recipeId].sort((a, b) => {
                    const dateA = new Date(a.dateCreated);
                    const dateB = new Date(b.dateCreated);
                    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
                });
            });

            return grouped;
        }

        return filteredBrewLogs;
    }, [state.brewLogs, searchTerm, sortBy, sortOrder]);

    return (
        <div className="main-content-container brewlogs-list">
            <div className="main-content-section">
                <ListHeader
                    h1="Brew Logs"
                    description="Track your brewing batches and progress"
                    buttonText="New Brew Log"
                    url="/brewlogs/new"
                >
                </ListHeader>
            </div>

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
                        { key: 'name', label: 'Name', icon: ArrowDownAZ },
                        { key: 'type', label: 'Type', icon: Type },
                        { key: 'recipe', label: 'Recipe', icon: FileText },
                        { key: 'rating', label: 'Rating', icon: Star, defaultOrder: 'desc' }
                    ]}
                    searchPlaceholder="Search brew logs by name, description, or type..."
                />
            </div>

            <div className="main-content-section">
                {state.brewLogs.length === 0 ? (

                    <div className="empty-state">
                        <div className="empty-icon">
                            <BookOpen size={64} />
                        </div>
                        <h3>No Brew Logs Yet</h3>
                        <p>Start tracking your brewing journey by creating your first brew log.</p>
                        <Button
                            variant="primary"
                            size="large"
                            onClick={() => navigate('/brewlogs/new')}
                        >
                            <Plus size={20} />
                            Create Your First Brew Log
                        </Button>
                    </div>
                ) : (
                    <div className="items-container">
                        {sortBy === 'date' || sortBy === 'name' || sortBy === 'type' || sortBy === 'rating' ? (
                            <div className="items-grid">
                                {processedBrewLogs.map((brewLog) => (
                                    <BrewLogCard
                                        key={brewLog.id}
                                        brewLog={brewLog}
                                        displayOption={displayMode}
                                    />
                                ))}
                            </div>
                        ) : sortBy === 'recipe' ? (
                            // Grouped by Recipe
                            <div className="items-grouped">
                                {Object.entries(processedBrewLogs).map(([recipeId, brewLogs]) => {
                                    const recipe = state.recipes.find(r => r.id === recipeId);
                                    const recipeName = recipe ? recipe.name : 'No Recipe';

                                    return (
                                        <div key={recipeId} className="item-group">
                                            <div className="group-header">
                                                <h3 className="group-title">
                                                    <FileText size={20} />
                                                    {recipeName}
                                                </h3>
                                                {recipe && (
                                                    <Button
                                                        variant="outline"
                                                        size="small"
                                                        onClick={() => navigate(`/recipes/${recipeId}`)}
                                                    >
                                                        Go To Recipe
                                                    </Button>
                                                )}
                                            </div>
                                            <div className="items-grid">
                                                {brewLogs.map((brewLog) => (
                                                    <BrewLogCard
                                                        key={brewLog.id}
                                                        brewLog={brewLog}
                                                        displayOption={displayMode}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : null}

                        {searchTerm && processedBrewLogs.length === 0 && (
                            <div className="empty-state">
                                <div className="empty-icon">
                                    <Search size={64} />
                                </div>
                                <h3>No Results Found</h3>
                                <p>No brew logs match your search criteria. Try adjusting your search terms.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div >
    );
}

export default BrewLogsList;

