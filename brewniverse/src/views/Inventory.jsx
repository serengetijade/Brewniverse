import React from 'react';
import '../Styles/Shared/list.css';
import InventoryList from '../components/Inventory/InventoryList';

function InventoryView() {
    return (
        <div className="main-content-container settings">
            <div className="main-content-section">
                <div className="settings-header">
                    <h1>Inventory</h1>
                    <p>Track quantities across all brew logs.</p>
                </div>
                <div className="inventory-sections">
                    <InventoryList showHeader={true} />
                </div>
            </div>
        </div>
    );
}

export default InventoryView;
