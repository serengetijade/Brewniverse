import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AlertsList from '../components/Alerts/AlertsList';
import AlertForm from '../components/Alerts/AlertForm';

function Alerts() {
  return (
    <Routes>
      <Route index element={<AlertsList />} />
      <Route path="new" element={<AlertForm />} />
      <Route path=":id/edit" element={<AlertForm />} />
    </Routes>
  );
}

export default Alerts;

