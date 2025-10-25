import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../../Styles/JournalEntryForm.css';
import BrewTypes from '../../constants/BrewTypes';
import { Validation } from '../../constants/ValidationConstants';
import { ActionTypes, generateId, getDate, useApp } from '../../contexts/AppContext';
import JournalEntry from '../../models/JournalEntry';
import FormFooter from '../Layout/FormFooter';
import FormHeader from '../Layout/FormHeader';
import Rating from '../UI/Rating';

function JournalEntryForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { state, dispatch } = useApp();
    const isEditing = Boolean(id);

    const [formData, setFormData] = useState(() => new JournalEntry({ id: generateId() || id }));

    useEffect(() => {
        if (isEditing) {
            const entry = state.journalEntries.find(e => e.id === id);
            if (entry) {
                setFormData(JournalEntry.fromJSON(entry));
            }
        }
    }, [id, isEditing, state.journalEntries]);

    const handleSubmit = (e) => {
        if (e) e.preventDefault();

        const entryData = formData.toJSON();

        if (isEditing) {
            dispatch({
                type: ActionTypes.UPDATE_JOURNAL_ENTRY,
                payload: { ...entryData, id }
            });
        } else {
            dispatch({
                type: ActionTypes.ADD_JOURNAL_ENTRY,
                payload: entryData
            });
        }

        navigate('/journal');
    };

    const updateFormData = (updates) => {
        const updatedData = JournalEntry.fromJSON({ ...formData.toJSON(), ...updates });
        setFormData(updatedData);

        if (isEditing) {
            dispatch({
                type: ActionTypes.UPDATE_JOURNAL_ENTRY,
                payload: { ...updatedData.toJSON(), id }
            });
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        updateFormData({ [name]: value });
    };

    const handleRatingChange = (newRating) => {
        updateFormData({ rating: newRating });
    };

    const onDelete = (e) => {
        e.preventDefault();

        if (!window.confirm('Are you sure you want to delete this journal entry?')) return;

        dispatch({ type: ActionTypes.DELETE_JOURNAL_ENTRY, payload: id });
        navigate('/journal');
    };

    return (
        <div className="form-container form-with-footer">
            <FormHeader
                isEditing={isEditing}
                entityName="Journal Entry"
            />

            <form onSubmit={handleSubmit} className="card">
                {/* Basic Information */}
                <div className="form-section">
                    <h3>Basic Information</h3>

                    <div className="form-group">
                        <label htmlFor="date" className="form-label">
                            Date *
                        </label>
                        <input
                            type="datetime-local"
                            id="date"
                            name="date"
                            className="form-input"
                            value={formData.date}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="name" className="form-label">
                            Name *
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            className="form-input"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            maxLength={Validation.InputMaxLength}
                            placeholder="Enter brew name"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="brand" className="form-label">
                                Brand
                            </label>
                            <input
                                type="text"
                                id="brand"
                                name="brand"
                                className="form-input"
                                value={formData.brand}
                                onChange={handleChange}
                                maxLength={Validation.InputMaxLength}
                                placeholder="Enter brand name"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="style" className="form-label">
                                Style
                            </label>
                            <input
                                type="text"
                                id="style"
                                name="style"
                                className="form-input"
                                value={formData.style}
                                onChange={handleChange}
                                maxLength={Validation.InputMaxLength}
                                placeholder="e.g., IPA, Pinot Noir, etc."
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="brewType" className="form-label">
                                Type *
                            </label>
                            <select
                                id="brewType"
                                name="brewType"
                                className="form-input"
                                value={formData.brewType}
                                onChange={handleChange}
                                required
                            >
                                {BrewTypes.map((brewType) => (
                                    <option key={brewType.key} value={brewType.key}>
                                        {brewType.icon} {brewType.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="abv" className="form-label">
                                ABV (%)
                            </label>
                            <input
                                type="number"
                                id="abv"
                                name="abv"
                                className="form-input"
                                value={formData.abv}
                                onChange={handleChange}
                                step="0.1"
                                min="0"
                                max="100"
                                placeholder="Alcohol by volume"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="venue" className="form-label">
                            Venue
                        </label>
                        <input
                            type="text"
                            id="venue"
                            name="venue"
                            className="form-input"
                            value={formData.venue}
                            onChange={handleChange}
                            maxLength={Validation.InputMaxLength}
                            placeholder="Where did you try it?"
                        />
                    </div>
                </div>

                {/* Rating */}
                <div className="form-section">
                    <h3>Rating</h3>
                    <Rating
                        value={formData.rating}
                        onChange={handleRatingChange}
                        isEditing={true}
                        label="Your Rating"
                    />
                </div>

                {/* Notes */}
                <div className="form-section">
                    <h3>Notes</h3>
                    <div className="form-group">
                        <label htmlFor="notes" className="form-label">
                            Tasting Notes
                        </label>
                        <textarea
                            id="notes"
                            name="notes"
                            className="form-textarea"
                            value={formData.notes}
                            onChange={handleChange}
                            maxLength={Validation.TextAreaMaxLength}
                            rows="6"
                            placeholder="Describe the flavors, aromas, appearance, and overall experience..."
                        />
                    </div>
                </div>
            </form>

            <FormFooter
                isEditing={isEditing}
                entityName="Journal Entry"
                onCancel={() => navigate('/journal')}
                onDelete={onDelete}
                onSubmit={handleSubmit}
                showCancel={!isEditing}
                showDelete={isEditing}
            />
        </div>
    );
}

export default JournalEntryForm;

