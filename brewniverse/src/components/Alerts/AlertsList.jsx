import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Bell, Users } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import Button from '../UI/Button';
import ListHeader from '../Layout/ListHeader'
import "../../Styles/BrewLogsList.css"
//import "../../Styles/Shared/list.css"

function AlertsList() {
  const navigate = useNavigate();
  const { state } = useApp();

  const alerts = state.alerts.sort((a, b) => new Date(a.date) - new Date(b.date));
  const alertGroups = state.alertGroups;

  return (
    <div className="brewlogs-list">
        <ListHeader
            h1="Alerts & Reminders"
            description="Manage your brewing alerts and reminders - never miss a step!"
            buttonText="New Alert"
            url="/alerts/new"
        >
        </ListHeader>          

      <div className="alerts-sections">
        {/* Alert Groups Section */}
        {alertGroups.length > 0 && (
          <div className="alerts-section">
            <h2>Alert Groups</h2>
            <div className="alert-groups-grid">
              {alertGroups.map((group) => (
                <div key={group.id} className="alert-group-card">
                  <div className="group-content">
                    <h3>{group.name}</h3>
                    <p>{group.alerts?.length || 0} alerts in this group</p>
                  </div>
                  <div className="group-actions">
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => navigate(`/alerts/groups/${group.id}/edit`)}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Individual Alerts Section */}
        <div className="alerts-section">
          <h2>Individual Alerts</h2>
          {alerts.length === 0 ? (
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
            <div className="alerts-grid">
              {alerts.map((alert) => (
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
          )}
        </div>
      </div>
    </div>
  );
}

export default AlertsList;

