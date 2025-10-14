import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Calendar, Search, Beaker, ListTree} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import Button from '../UI/Button';
import ListHeader from '../Layout/ListHeader';
import SearchSortControls from '../UI/SearchSortControls';
import RecipeCard from './RecipeCard';
import BrewTypes from '../BrewType';
import '../../Styles/BrewLogsList.css';
import '../../Styles/Shared/search.css';

function RecipesList() {
  const navigate = useNavigate();
  const { state } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

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
    <div className="brewlogs-list">
        <ListHeader
            h1="Recipes"
            description="Manage your brewing recipes and ingredients"
            buttonText="New Recipe"
            url="/recipes/new"
        >
        </ListHeader>

        <SearchSortControls
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={(newSortBy, newSortOrder) => {
            setSortBy(newSortBy);
            setSortOrder(newSortOrder);
          }}
          sortOptions={[
            { key: 'date', label: 'Date', icon: Calendar },
            { key: 'name', label: 'Name', icon: FileText },
            { key: 'type', label: 'Type', icon: ListTree },
            { key: 'brewlog', label: 'Usage', icon: Beaker }
          ]}
          searchPlaceholder="Search recipes by name or description..."
        />

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
          {sortBy === 'date' || sortBy === 'name' ? (
            // Sort by date or name
            <div className="items-grid">
              {sortedRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                />
              ))}
            </div>
          ) 
          : sortBy === 'brewlog' ? (
            // Sort/Grouped by Usage (Used vs Unused)
            <div className="items-grouped">
              {Object.entries(sortedRecipes).map(([groupKey, recipes]) => {
                const groupName = groupKey === 'used' ? 'Used in Brew Logs' : 'Not Yet Used';
                const groupIcon = groupKey === 'used' ? <Beaker size={20} /> : <FileText size={20} />;
                
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
                                        <RecipeCard key={recipe.id} recipe={recipe} />
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
  );
}

export default RecipesList;

