import React from 'react';
import { Routes, Route } from 'react-router-dom';
import InstructionsList from '../components/Instructions/InstructionsList';
import InstructionDetail from '../components/Instructions/InstructionDetail';
import InstructionForm from '../components/Instructions/InstructionForm';

function Instructions() {
  return (
    <Routes>
      <Route index element={<InstructionsList />} />
      <Route path="new" element={<InstructionForm />} />
      <Route path=":id" element={<InstructionDetail />} />
      <Route path=":id/edit" element={<InstructionForm />} />
    </Routes>
  );
}

export default Instructions;

