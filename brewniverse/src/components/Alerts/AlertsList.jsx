import { AlertCircle, Bell, BookOpen, Calendar, FileText, Plus, Search } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../../Styles/AlertsList.css";
import { useApp } from '../../contexts/AppContext';
import ListHeader from '../Layout/ListHeader';
import Button from '../UI/Button';
import SearchSortControls from '../UI/SearchSortControls';
import AlertCard from './AlertCard';
import AlertGroup from './AlertGroup';

function AlertsList() {
    const navigate = useNavigate();
    const { state } = useApp();
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('date');
    const [sortOrder, setSortOrder] = useState('asc');
    const [displayMode, setDisplayMode] = useState(() => {
        return localStorage.getItem('alerts-display-mode') || 'grid';
    });

    const handleDisplayChange = (mode) => {
        setDisplayMode(mode);
        localStorage.setItem('alerts-display-mode', mode);
    };

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
        } else if (sortBy === 'priority') {
            // Priority order: urgent > high > medium > low
            const priorityOrder = { urgent: 1, high: 2, medium: 3, low: 4 };
            filteredAlerts.sort((a, b) => {
                const priorityA = priorityOrder[a.priority] || 0;
                const priorityB = priorityOrder[b.priority] || 0;
                if (priorityA === priorityB) {
                    // ThenBy date
                    const dateA = new Date(a.date);
                    const dateB = new Date(b.date);
                    return dateA - dateB;
                }
                return sortOrder === 'asc' ? priorityA - priorityB : priorityB - priorityA;
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
        <div className="main-content-container">
            <div className="main-content-section brewlogs-list">
                <ListHeader
                    h1="Alerts & Reminders"
                    description="Manage your brewing alerts and reminders - never miss a step!"
                    buttonText="New Alert"
                    url="/alerts/new"
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
                    searchPlaceholder="Search alerts by name or description..."
                    sortOptions={[
                        { key: 'date', label: 'Date', icon: Calendar },
                        { key: 'priority', label: 'Priority', icon: AlertCircle },
                        { key: 'brewlog', label: 'Brew Log', icon: BookOpen },
                        { key: 'recipe', label: 'Recipe', icon: FileText }
                    ]}
                />
            </div>

            {/* Individual Alerts Section */}
            <div className="main-content-section alerts-section">
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
                            {sortBy === 'date' || sortBy === 'priority' ? (
                                // Simple list view for date sorting
                                <div className="items-grid">
                                    {processedAlerts.map((alert) => (
                                        <AlertCard
                                            key={alert.id}
                                            alert={alert}
                                            editUrl={`/alerts/${alert.id}/edit`}
                                            displayOption={displayMode}
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
                                                    displayOption={displayMode}
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
                                                        displayOption={displayMode}
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

