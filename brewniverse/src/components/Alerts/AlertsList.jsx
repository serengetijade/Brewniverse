import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Bell, Search } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import Button from '../UI/Button';
import ListHeader from '../Layout/ListHeader';
import SearchSortControls from '../UI/SearchSortControls';
import AlertCard from './AlertCard';
import AlertGroup from './AlertGroup';
import "../../Styles/Shared/list.css";
import "../../Styles/Shared/search.css";

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
            (alert.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (alert.description || '').toLowerCase().includes(searchTerm.toLowerCase())
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

    return (
        <div className="brewlogs-list">
            <ListHeader
                h1="Alerts & Reminders"
                description="Manage your brewing alerts and reminders - never miss a step!"
                buttonText="New Alert"
                url="/alerts/new"
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
                searchPlaceholder="Search alerts by name or description..."
            />

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
                ) 
                : (
                    <div className="items-container">
                        {sortBy === 'date' ? (
                            // Simple list view for date sorting
                            <div className="items-grid">
                                {processedAlerts.map((alert) => (
                                    <AlertCard
                                        key={alert.id}
                                        alert={alert}
                                        editUrl={`/alerts/${alert.id}/edit`}
                                    />
                                ))}
                            </div>
                        ) 
                        : sortBy === 'brewlog' ? (
                            // Grouped by BrewLog
                            <div className="items-grouped">
                                {Object.entries(processedAlerts).map(([brewLogId, alerts]) => {
                                    const brewLog = state.brewLogs.find(bl => bl.id === brewLogId);
                                    const brewLogName = brewLog ? brewLog.name : 'No Brew Log';

                                    return (
                                        <AlertGroup
                                            key={brewLogId}
                                            groupKey={brewLogId}
                                            alerts={alerts}
                                            groupType="brewlog"
                                            groupName={brewLogName}
                                            navigateUrl={brewLog ? `/brewlogs/${brewLogId}` : null}
                                            editUrlTemplate="/alerts/:id/edit"
                                        />
                                    );
                                })}
                            </div>
                        ) 
                        : sortBy === 'recipe' ? (
                            // Grouped by Recipe
                            <div className="items-grouped">
                                {Object.entries(processedAlerts).map(([recipeId, alerts]) => {
                                    const recipe = state.recipes.find(r => r.id === recipeId);
                                    const recipeName = recipe ? recipe.name : 'No Recipe';

                                    return (
                                        <AlertGroup
                                            key={recipeId}
                                            groupKey={recipeId}
                                            alerts={alerts}
                                            groupType="recipe"
                                            groupName={recipeName}
                                            navigateUrl={recipe ? `/recipes/${recipeId}` : null}
                                            editUrlTemplate="/alerts/:id/edit"
                                        />
                                    );
                                })}
                            </div>
                        ) 
                        : null}

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

