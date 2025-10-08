import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Bell, Users, Search, ArrowUpDown, Calendar, Beaker, FileText } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import Button from '../UI/Button';
import ListHeader from '../Layout/ListHeader'
import "../../Styles/BrewLogsList.css"
import "../../Styles/Shared/search.css"

function AlertsList() {
  const navigate = useNavigate();
  const { state } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('asc');

  const alertGroups = state.alertGroups;

  // Process and filter alerts based on search and sort criteria
  const processedAlerts = useMemo(() => {
    let filteredAlerts = state.alerts.filter(alert => 
      alert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort alerts based on selected criteria
    if (sortBy === 'date') {
      filteredAlerts.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });
    } else if (sortBy === 'brewlog') {
      // Group by brewLogId, then sort by date within each group
      const grouped = {};
      filteredAlerts.forEach(alert => {
        const brewLogId = alert.brewLogId || 'no-brewlog';
        if (!grouped[brewLogId]) {
          grouped[brewLogId] = [];
        }
        grouped[brewLogId].push(alert);
      });
      
      // Sort alerts within each group by date
      Object.keys(grouped).forEach(brewLogId => {
        grouped[brewLogId].sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });
      });
      
      return grouped;
    } else if (sortBy === 'recipe') {
      // Group by recipe (through brewLog), then sort by date within each group
      const grouped = {};
      filteredAlerts.forEach(alert => {
        const brewLog = state.brewLogs.find(bl => bl.id === alert.brewLogId);
        const recipeId = brewLog?.recipeId || 'no-recipe';
        if (!grouped[recipeId]) {
          grouped[recipeId] = [];
        }
        grouped[recipeId].push(alert);
      });
      
      // Sort alerts within each group by date
      Object.keys(grouped).forEach(recipeId => {
        grouped[recipeId].sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });
      });
      
      return grouped;
    }

    return filteredAlerts;
  }, [state.alerts, state.brewLogs, searchTerm, sortBy, sortOrder]);

  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  return (
    <div className="brewlogs-list">
        <ListHeader
            h1="Alerts & Reminders"
            description="Manage your brewing alerts and reminders - never miss a step!"
            buttonText="New Alert"
            url="/alerts/new"
        >
        </ListHeader>          

        {/* Search Bar & Sort Controls */}
        <div className="search-sort-controls">
          <div className="search-bar">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search alerts by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="sort-controls">
            <div className="sort-buttons">
              <Button
                variant={sortBy === 'date' ? 'primary' : 'outline'}
                size="small"
                onClick={() => handleSortChange('date')}
                className="sort-button"
              >
                <Calendar size={16} />
                Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
              </Button>
              <Button
                variant={sortBy === 'brewlog' ? 'primary' : 'outline'}
                size="small"
                onClick={() => handleSortChange('brewlog')}
                className="sort-button"
              >
                <Beaker size={16} />
                Brew Log {sortBy === 'brewlog' && (sortOrder === 'asc' ? '↑' : '↓')}
              </Button>
              <Button
                variant={sortBy === 'recipe' ? 'primary' : 'outline'}
                size="small"
                onClick={() => handleSortChange('recipe')}
                className="sort-button"
              >
                <FileText size={16} />
                Recipe {sortBy === 'recipe' && (sortOrder === 'asc' ? '↑' : '↓')}
              </Button>
            </div>
          </div>
        </div>

        {/* Individual Alerts Section */}
        <div className="alerts-section">
          {state.alerts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <Bell size={64} />
              </div>
              <h3>No Alerts Yet</h3>
              <p>Create your first alert to get reminders for your brewing process.</p>
              <Button
                variant="primary"
                size="large"
                onClick={() => navigate('/alerts/new')}
              >
                <Plus size={20} />
                Create Your First Alert
              </Button>
            </div>
          ) : (
            <div className="alerts-container">
              {sortBy === 'date' ? (
                // Simple list view for date sorting
                <div className="alerts-grid">
                  {processedAlerts.map((alert) => (
                    <div key={alert.id} className="alert-card">
                      <div className="alert-content">
                        <h3>{alert.name}</h3>
                        <p className="alert-description">{alert.description}</p>
                        <p className="alert-date">
                          {new Date(alert.date).toLocaleDateString()} at {new Date(alert.date).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="alert-actions">
                        <Button
                          variant="outline"
                          size="small"
                          onClick={() => navigate(`/alerts/${alert.id}/edit`)}
                        >
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : sortBy === 'brewlog' ? (
                // Grouped by BrewLog
                <div className="alerts-grouped">
                  {Object.entries(processedAlerts).map(([brewLogId, alerts]) => {
                    const brewLog = state.brewLogs.find(bl => bl.id === brewLogId);
                    const brewLogName = brewLog ? brewLog.name : 'No Brew Log';
                    
                    return (
                      <div key={brewLogId} className="alert-group">
                        <div className="group-header">
                          <h3 className="group-title">
                            <Beaker size={20} />
                            {brewLogName}
                          </h3>
                          {brewLog && (
                            <Button
                              variant="outline"
                              size="small"
                              onClick={() => navigate(`/brewlogs/${brewLogId}`)}
                            >
                              Go To Brew
                            </Button>
                          )}
                        </div>
                        <div className="alerts-grid">
                          {alerts.map((alert) => (
                            <div key={alert.id} className="alert-card">
                              <div className="alert-content">
                                <h4>{alert.name}</h4>
                                <p className="alert-description">{alert.description}</p>
                                <p className="alert-date">
                                  {new Date(alert.date).toLocaleDateString()} at {new Date(alert.date).toLocaleTimeString()}
                                </p>
                              </div>
                              <div className="alert-actions">
                                <Button
                                  variant="outline"
                                  size="small"
                                  onClick={() => navigate(`/alerts/${alert.id}/edit`)}
                                >
                                  Edit
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : sortBy === 'recipe' ? (
                // Grouped by Recipe
                <div className="alerts-grouped">
                  {Object.entries(processedAlerts).map(([recipeId, alerts]) => {
                    const recipe = state.recipes.find(r => r.id === recipeId);
                    const recipeName = recipe ? recipe.name : 'No Recipe';
                    
                    return (
                      <div key={recipeId} className="alert-group">
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
                        <div className="alerts-grid">
                          {alerts.map((alert) => (
                            <div key={alert.id} className="alert-card">
                              <div className="alert-content">
                                <h4>{alert.name}</h4>
                                <p className="alert-description">{alert.description}</p>
                                <p className="alert-date">
                                  {new Date(alert.date).toLocaleDateString()} at {new Date(alert.date).toLocaleTimeString()}
                                </p>
                              </div>
                              <div className="alert-actions">
                                <Button
                                  variant="outline"
                                  size="small"
                                  onClick={() => navigate(`/alerts/${alert.id}/edit`)}
                                >
                                  Edit
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}
              
              {searchTerm && processedAlerts.length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">
                    <Search size={64} />
                  </div>
                  <h3>No Results Found</h3>
                  <p>No alerts match your search criteria. Try adjusting your search terms.</p>
                </div>
              )}
            </div>
          )}
        </div>
    </div>
  );
}

export default AlertsList;

