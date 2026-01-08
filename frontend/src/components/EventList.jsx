import React, { useState } from 'react';
import { eventService } from '../services/authService';

function EventList({ events, onEventSelect, onDeleteRequest, onRefresh, onNotify }) {
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState({
        eventName: '',
        eventDate: '',
        organizerName: '',
        instituteName: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await eventService.createEvent(formData);
            onRefresh();
            onNotify?.('success', `Event "${formData.eventName}" created successfully`);
            setShowCreateForm(false);
            setFormData({
                eventName: '',
                eventDate: '',
                organizerName: '',
                instituteName: '',
            });
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create event');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (e, eventId) => {
        e.stopPropagation();
        onDeleteRequest(eventId);
    };

    return (
        <div className="event-section">
            <div className="section-header">
                <h2>My Events</h2>
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="btn btn-primary"
                >
                    {showCreateForm ? 'Cancel' : '+ Create Event'}
                </button>
            </div>

            {showCreateForm && (
                <div className="card">
                    <h3>Create New Event</h3>
                    {error && <div className="alert alert-error">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Event Name</label>
                                <input
                                    type="text"
                                    name="eventName"
                                    className="form-input"
                                    placeholder="Annual Tech Summit 2024"
                                    value={formData.eventName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Event Date</label>
                                <input
                                    type="date"
                                    name="eventDate"
                                    className="form-input"
                                    min={new Date().toISOString().split('T')[0]}
                                    value={formData.eventDate}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Organizer Name</label>
                                <input
                                    type="text"
                                    name="organizerName"
                                    className="form-input"
                                    placeholder="Dr. John Smith"
                                    value={formData.organizerName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Institute Name (Optional)</label>
                                <input
                                    type="text"
                                    name="instituteName"
                                    className="form-input"
                                    placeholder="ABC University"
                                    value={formData.instituteName}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Event'}
                        </button>
                    </form>
                </div>
            )}

            <div className="events-grid">
                {(!Array.isArray(events) || events.length === 0) ? (
                    <div className="card empty-state">
                        <p>No events yet. Create your first event to get started!</p>
                    </div>
                ) : (
                    Array.isArray(events) && events.map((event) => (
                        <div key={event.id} className="event-card">
                            <button
                                className="delete-event-btn"
                                onClick={(e) => handleDeleteClick(e, event.id)}
                                title="Delete Event"
                            >
                                &times;
                            </button>

                            <div className="event-card-header">
                                <div className="event-date-badge">
                                    <span className="event-date-day">
                                        {(event.eventDate || event.event_date) ? new Date(event.eventDate || event.event_date).getDate() : '--'}
                                    </span>
                                    <span className="event-date-month">
                                        {(event.eventDate || event.event_date) ? new Date(event.eventDate || event.event_date).toLocaleString('default', { month: 'short' }) : '---'}
                                    </span>
                                </div>
                                <div className="event-card-title-group">
                                    <h3>{event.eventName || event.event_name || 'Untitled Event'}</h3>
                                    <p className="event-institute-text">{event.instituteName || event.institute_name || 'General Event'}</p>
                                </div>
                            </div>

                            <div className="event-card-body">
                                <div className="event-info-item">
                                    <span className="info-icon">👤</span>
                                    <span className="event-organizer">{event.organizerName || event.organizer_name || 'Organizer'}</span>
                                </div>
                                <div className="event-info-item">
                                    <span className="info-icon">📅</span>
                                    <span className="event-full-date">
                                        {(event.eventDate || event.event_date) ? new Date(event.eventDate || event.event_date).toLocaleDateString() : 'No date'}
                                    </span>
                                </div>
                            </div>

                            <div className="card-footer">
                                <span className="manage-link" onClick={() => onEventSelect(event)}>Manage Event <span>→</span></span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default EventList;
