import { Beaker, FileText } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../UI/Button';
import AlertCard from './AlertCard';

function AlertGroup({ groupKey, alerts, groupType, groupName, navigateUrl, editUrlTemplate }) {
    const navigate = useNavigate();

    const getGroupIcon = () => {
        switch (groupType) {
            case 'brewlog':
                return <Beaker size={20} />;
            case 'recipe':
                return <FileText size={20} />;
            default:
                return null;
        }
    };

    const getButtonText = () => {
        switch (groupType) {
            case 'brewlog':
                return 'Go To Brew';
            case 'recipe':
                return 'Go To Recipe';
            default:
                return 'View';
        }
    };

    return (
        <div className="item-group">
            <div className="group-header">
                <h3 className="group-title">
                    {getGroupIcon()}
                    {groupName}
                </h3>
                {navigateUrl && (
                    <Button
                        variant="outline"
                        size="small"
                        onClick={() => navigate(navigateUrl)}
                    >
                        {getButtonText()}
                    </Button>
                )}
            </div>
            <div className="items-grid">
                {alerts.map((alert) => (
                    <AlertCard
                        key={alert.id}
                        alert={alert}
                        editUrl={editUrlTemplate.replace(':id', alert.id)}
                    />
                ))}
            </div>
        </div>
    );
}

export default AlertGroup;