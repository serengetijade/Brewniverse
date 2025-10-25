import React from 'react';
import { Routes, Route } from 'react-router-dom';
import BrewLogsList from '../components/BrewLogs/BrewLogsList';
import BrewLogDetail from '../components/BrewLogs/BrewLogDetail';
import BrewLogForm from '../components/BrewLogs/BrewLogForm';

function BrewLogs() {
    return (
        <Routes>
            <Route index element={<BrewLogsList />} />
            <Route path="new" element={<BrewLogForm />} />
            <Route path=":id" element={<BrewLogDetail />} />
            <Route path=":id/edit" element={<BrewLogForm />} />
        </Routes>
    );
}

export default BrewLogs;