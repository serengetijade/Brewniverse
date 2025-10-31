import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import '../../Styles/JournalEntryForm.css';
import BrewTypes from '../../constants/BrewTypes';
import { Validation } from '../../constants/ValidationConstants';
import { getCurrentAbv, getGravityActivities } from '../../utils/GravityCalculations'
import { ActionTypes, generateId, useApp } from '../../contexts/AppContext';
import JournalEntry from '../../models/JournalEntry';
import FormFooter from '../Layout/FormFooter';
import FormHeader from '../Layout/FormHeader';
import Rating from '../UI/Rating';

function JournalEntryForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { state, dispatch } = useApp();
    const [searchParams] = useSearchParams();
    const isEditing = Boolean(id);

    const [formState, setFormState] = useState(() => {
        const brewLogId = searchParams.get('brewLogId') || '';
        const type = searchParams.get('type');
        const name = searchParams.get('name');
        const abv = searchParams.get('abv');

        const initialData = { id: generateId() || id, brewLogId };
        if (type) initialData.type = type;
        if (name) initialData.name = name;
        if (abv) initialData.abv = parseFloat(abv);
        initialData.brand = "Brewniverse";

        return new JournalEntry(initialData);
    });

    useEffect(() => {
        if (isEditing) {
            const entry = state.journalEntries.find(e => e.id === id);
            if (entry) {
                setFormState(JournalEntry.fromJSON(entry));
            }
        } else {
            const brewLogId = searchParams.get('brewLogId');
            const type = searchParams.get('type');
            const name = searchParams.get('name');
            const abv = searchParams.get('abv');

            if (brewLogId || type || name || abv) {
                const updates = { brewLogId };
                if (type) updates.type = type;
                if (name) updates.name = name;
                if (abv) updates.abv = parseFloat(abv);

                setFormState(prev => new JournalEntry({ ...prev.toJSON(), ...updates }));
            }
        }
    }, [id, isEditing, state.journalEntries, searchParams]);

    const handleSubmit = (e) => {
        if (e) e.preventDefault();

        const entryData = formState.toJSON();

        if (isEditing) {
            dispatch({
                type: ActionTypes.updateJournalEntry,
                payload: { ...entryData, id }
            });
        } else {
            dispatch({
                type: ActionTypes.addJournalEntry,
                payload: entryData
            });
        }

        navigate('/journal');
    };

    const updateFormData = (updates) => {
        const updatedData = JournalEntry.fromJSON({ ...formState.toJSON(), ...updates });
        setFormState(updatedData);

        if (isEditing) {
            dispatch({
                type: ActionTypes.updateJournalEntry,
                payload: { ...updatedData.toJSON(), id }
            });
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "brewLogId" && value != '') {
            const selectedText = e.target.options[e.target.selectedIndex].text;
            const selectedBrewLog = state.brewLogs.find(x => x.id === value);
            const currentAbv = getCurrentAbv(getGravityActivities(selectedBrewLog.activity));
            updateFormData({
                [name]: value,
                abv: currentAbv,
                brand: "Brewniverse",
                name: selectedText,
                type: selectedBrewLog.type
            });
        }
        else {
            updateFormData({
                [name]: value
            });
        }
    };

    const handleRatingChange = (newRating) => {
        updateFormData({ rating: newRating });
    };

    const onDelete = (e) => {
        e.preventDefault();

        if (!window.confirm('Are you sure you want to delete this journal entry?')) return;

        dispatch({ type: ActionTypes.deleteJournalEntry, payload: id });
        navigate('/journal');
    };

    return (
        <div className="main-content-container form-container form-with-footer">
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
                            value={formState.date}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="brewLogId" className="form-label">
                            Related Brew Log
                        </label>
                        <select
                            id="brewLogId"
                            name="brewLogId"
                            className="form-input"
                            value={formState.brewLogId}
                            onChange={handleChange}
                        >
                            <option value="">No brew log</option>
                            {state.brewLogs.map(brewLog => (
                                <option key={brewLog.id} value={brewLog.id}>
                                    {brewLog.name} ({brewLog.type})
                                </option>
                            ))}
                        </select>
                    </div>

                    {formState.brewLogId == '' &&
                        <div>
                            <div className="form-group">
                                <label htmlFor="name" className="form-label">
                                    Name *
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    className="form-input"
                                    value={formState.name}
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
                                        value={formState.brand}
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
                                        value={formState.style}
                                        onChange={handleChange}
                                        maxLength={Validation.InputMaxLength}
                                        placeholder="e.g., IPA, Pinot Noir, etc."
                                    />
                                </div>
                            </div>

                            <div className="form-row col-2">
                                <div className="form-group">
                                    <label htmlFor="type" className="form-label">
                                        Type *
                                    </label>
                                    <select
                                        id="type"
                                        name="type"
                                        className="form-input"
                                        value={formState.type}
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
                                        value={formState.abv}
                                        onChange={handleChange}
                                        step="0.1"
                                        min="0"
                                        max="100"
                                        placeholder="Alcohol by volume"
                                    />
                                </div>
                            </div>
                        </div>
                    }

                    <div className="form-group">
                        <label htmlFor="venue" className="form-label">
                            Venue
                        </label>
                        <input
                            type="text"
                            id="venue"
                            name="venue"
                            className="form-input"
                            value={formState.venue}
                            onChange={handleChange}
                            maxLength={Validation.InputMaxLength}
                            placeholder="Where did you try it?"
                        />
                    </div>

                    {/* Rating */}
                    <Rating
                        value={formState.rating}
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
                            value={formState.notes}
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
                cancelIcon={<X size={18} />}
                onCancel={() => navigate('/journal')}
                showCancel={!isEditing}
                onDelete={onDelete}
                onSubmit={handleSubmit}
                showDelete={isEditing}
            />
        </div>
    );
}

export default JournalEntryForm;

