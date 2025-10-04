import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AlertsList from '../components/Alerts/AlertsList';
import AlertForm from '../components/Alerts/AlertForm';
import AlertGroupForm from '../components/Alerts/AlertGroupForm';

function Alerts() {
  return (
    <Routes>
      <Route index element={<AlertsList />} />
      <Route path="new" element={<AlertForm />} />
      <Route path="groups/new" element={<AlertGroupForm />} />
      <Route path=":id/edit" element={<AlertForm />} />
      <Route path="groups/:id/edit" element={<AlertGroupForm />} />
    </Routes>
  );
}

export default Alerts;

