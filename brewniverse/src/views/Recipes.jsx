import React from 'react';
import { Routes, Route } from 'react-router-dom';
import RecipesList from '../components/Recipes/RecipesList';
import RecipeDetail from '../components/Recipes/RecipeDetail';
import RecipeForm from '../components/Recipes/RecipeForm';

function Recipes() {
    return (
        <Routes>
            <Route index element={<RecipesList />} />
            <Route path="new" element={<RecipeForm />} />
            <Route path=":id" element={<RecipeDetail />} />
            <Route path=":id/edit" element={<RecipeForm />} />
        </Routes>
    );
}

export default Recipes;