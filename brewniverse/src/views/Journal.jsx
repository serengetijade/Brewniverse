import React from 'react';
import { Routes, Route } from 'react-router-dom';
import JournalList from './JournalList';
import JournalEntryForm from '../components/Journal/JournalEntryForm';

function Journal() {
    return (
        <Routes>
            <Route index element={<JournalList />} />
            <Route path="new" element={<JournalEntryForm />} />
            <Route path=":id" element={<JournalEntryForm />} />
            <Route path=":id/edit" element={<JournalEntryForm />} />
        </Routes>
    );
}

export default Journal;

