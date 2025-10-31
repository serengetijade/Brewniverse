import { ArrowDownAZ, BookOpen, Calendar, FileText, ListTree, Plus, Search, Star } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../Styles/RecipesList.css';
import '../../Styles/Shared/list.css';
import '../../Styles/Shared/search.css';
import BrewTypes from '../../constants/BrewTypes';
import { useApp } from '../../contexts/AppContext';
import ListHeader from '../Layout/ListHeader';
import Button from '../UI/Button';
import SearchSortControls from '../UI/SearchSortControls';
import RecipeCard from './RecipeCard';

function RecipesList() {
    const navigate = useNavigate();
    const { state } = useApp();
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('date');
    const [sortOrder, setSortOrder] = useState('desc');
    const [displayMode, setDisplayMode] = useState(() => {
        return localStorage.getItem('recipes-display-mode') || 'grid';
    });

    const handleDisplayChange = (mode) => {
        setDisplayMode(mode);
        localStorage.setItem('recipes-display-mode', mode);
    };

    // Process and filter recipes based on search and sort criteria
    const sortedRecipes = useMemo(() => {
        let filteredRecipes = state.recipes.filter(recipe =>
            (recipe.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (recipe.description || '').toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (sortBy === 'date') {
            filteredRecipes.sort((a, b) => {
                const dateA = new Date(a.dateCreated);
                const dateB = new Date(b.dateCreated);
                return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
            });
        }
        else if (sortBy === 'name') {
            filteredRecipes.sort((a, b) => {
                const nameA = a.name.toLowerCase();
                const nameB = b.name.toLowerCase();
                return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
            });
        }
        else if (sortBy === 'rating') {
            filteredRecipes.sort((a, b) => {
                const ratingA = a.rating || 0;
                const ratingB = b.rating || 0;
                if (ratingA === ratingB) {
                    // ThenBy date
                    const dateA = new Date(a.dateCreated);
                    const dateB = new Date(b.dateCreated);
                    return dateB - dateA; // Most recent first
                }
                return sortOrder === 'asc' ? ratingA - ratingB : ratingB - ratingA;
            });
        }
        else if (sortBy === 'brewlog') {
            const grouped = {};
            filteredRecipes.forEach(recipe => {
                const brewLogsUsingRecipe = state.brewLogs.filter(bl => bl.recipeId === recipe.id);
                const groupKey = brewLogsUsingRecipe.length > 0 ? 'used' : 'unused';
                if (!grouped[groupKey]) {
                    grouped[groupKey] = [];
                }
                grouped[groupKey].push(recipe);
            })

            Object.keys(grouped).forEach(groupKey => {
                grouped[groupKey].sort((a, b) => {
                    const dateA = new Date(a.dateCreated);
                    const dateB = new Date(b.dateCreated);
                    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
                });
            });

            return grouped;
        }
        else if (sortBy === 'type') {
            const grouped = {};
            filteredRecipes.forEach(recipe => {
                const groupKey = recipe.type;
                if (!grouped[groupKey]) {
                    grouped[groupKey] = [];
                }
                grouped[groupKey].push(recipe);
            });

            Object.keys(grouped).forEach(groupKey => {
                grouped[groupKey].sort((a, b) => {
                    const dateA = new Date(a.dateCreated);
                    const dateB = new Date(b.dateCreated);
                    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
                });
            });

            return grouped;
        }

        return filteredRecipes;
    }, [state.recipes, state.brewLogs, searchTerm, sortBy, sortOrder]);

    return (
        <div className="main-content-container">
            <div className="main-content-section brewlogs-list">
                <ListHeader
                    h1="Recipes"
                    description="Manage your brewing recipes and ingredients"
                    buttonText="New Recipe"
                    url="/recipes/new"
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
                        { key: 'rating', label: 'Rating', icon: Star, defaultOrder: 'desc' },
                        { key: 'type', label: 'Type', icon: ListTree },
                        { key: 'brewlog', label: 'Usage', icon: BookOpen }
                    ]}
                    searchPlaceholder="Search recipes by name or description..."
                />
            </div>

            <div className="main-content-section">
                {state.recipes.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">
                            <FileText size={64} />
                        </div>
                        <h3>No Recipes Yet</h3>
                        <p>Create your first recipe to start building your brewing library.</p>
                        <Button
                            variant="primary"
                            size="large"
                            onClick={() => navigate('/recipes/new')}
                        >
                            <Plus size={20} />
                            Create Your First Recipe
                        </Button>
                    </div>
                ) : (
                    <div className="items-container">
                        {sortBy === 'date' || sortBy === 'name' || sortBy === 'rating' ? (
                            // Sort by date, name, or rating
                            <div className="items-grid">
                                {sortedRecipes.map((recipe) => (
                                    <RecipeCard
                                        key={recipe.id}
                                        recipe={recipe}
                                        displayOption={displayMode}
                                    />
                                ))}
                            </div>
                        )
                            : sortBy === 'brewlog' ? (
                                // Sort/Grouped by Usage (Used vs Unused)
                                <div className="items-grouped">
                                    {Object.entries(sortedRecipes).map(([groupKey, recipes]) => {
                                        const groupName = groupKey === 'used' ? 'Used in Brew Logs' : 'Not Yet Used';
                                        const groupIcon = groupKey === 'used' ? <BookOpen size={20} /> : <FileText size={20} />;

                                        return (
                                            <div key={groupKey} className="item-group">
                                                <div className="group-header">
                                                    <h3 className="group-title">
                                                        {groupIcon}
                                                        {groupName}
                                                    </h3>
                                                </div>
                                                <div className="items-grid">
                                                    {recipes.map((recipe) => (
                                                        <RecipeCard
                                                            key={recipe.id}
                                                            recipe={recipe}
                                                            displayOption={displayMode}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )
                                : sortBy === 'type' ? (
                                    // Sort/Grouped by Recipe Type  
                                    <div className="items-grouped">
                                        {Object.entries(sortedRecipes).map(([type, recipes]) => {
                                            let brewType = BrewTypes.find(x => x.name === type);
                                            return (
                                                <div key={type} className="item-group">
                                                    <div className="group-header">
                                                        <h3 className="group-title">
                                                            {brewType.icon} {brewType.name}
                                                        </h3>
                                                    </div>
                                                    <div className="items-grid">
                                                        {recipes.map((recipe) => (
                                                            <RecipeCard key={recipe.id} recipe={recipe} displayOption={displayMode} />
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )
                                    : null}

                        {searchTerm && sortedRecipes.length === 0 && (
                            <div className="empty-state">
                                <div className="empty-icon">
                                    <Search size={64} />
                                </div>
                                <h3>No Results Found</h3>
                                <p>No recipes match your search criteria. Try adjusting your search terms.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default RecipesList;

