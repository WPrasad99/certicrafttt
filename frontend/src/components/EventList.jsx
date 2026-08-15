import React, { useState } from 'react';
import { eventService } from '../services/authService';

function EventList({ events, onEventSelect, onDeleteRequest, onRefresh, onNotify }) {
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState({ eventName: '', eventDate: '', organizerName: '', instituteName: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await eventService.createEvent(formData);
            onRefresh();
            onNotify?.('success', `Event "${formData.eventName}" created successfully`);
            setShowCreateForm(false);
            setFormData({ eventName: '', eventDate: '', organizerName: '', instituteName: '' });
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create event');
        } finally {
            setLoading(false);
        }
    };

    const getEventStatus = (event) => {
        const rawDate = event.eventDate || event.event_date;
        if (!rawDate) return { label: 'Draft', color: '#f59e0b', bg: '#fef3c7' };
        const eventDate = new Date(rawDate);
        const today = new Date();
        eventDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        if (eventDate.getTime() === today.getTime()) return { label: 'Today', color: '#10b981', bg: '#d1fae5' };
        if (eventDate.getTime() > today.getTime()) return { label: 'Upcoming', color: '#3b82f6', bg: '#dbeafe' };
        return { label: 'Completed', color: '#6b7280', bg: '#f3f4f6' };
    };

    return (
        <div>
            <div className="um-content-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 className="um-content-title">Your Events</h2>
                <button className="um-btn-pill-dark" onClick={() => setShowCreateForm(!showCreateForm)}>
                    {showCreateForm ? 'Cancel' : '+ Add Event'}
                </button>
            </div>

            {showCreateForm && (
                <div style={{ background: '#f4f6f5', padding: '24px', borderRadius: '16px', marginBottom: '32px' }}>
                    <h3 style={{ marginTop: 0, fontSize: '16px', fontWeight: 500 }}>Create New Event</h3>
                    {error && <div style={{ color: '#ef4444', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>Event Name</label>
                            <input type="text" name="eventName" value={formData.eventName} onChange={handleChange} required
                                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: 'none', background: 'white', boxSizing: 'border-box' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>Event Date</label>
                            <input type="date" name="eventDate" value={formData.eventDate} onChange={handleChange} required min={new Date().toISOString().split('T')[0]}
                                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: 'none', background: 'white', boxSizing: 'border-box' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>Organizer Name</label>
                            <input type="text" name="organizerName" value={formData.organizerName} onChange={handleChange} required
                                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: 'none', background: 'white', boxSizing: 'border-box' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>Institute Name</label>
                            <input type="text" name="instituteName" value={formData.instituteName} onChange={handleChange}
                                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: 'none', background: 'white', boxSizing: 'border-box' }} />
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                            <button type="submit" className="um-btn-pill-dark" disabled={loading} style={{ background: '#1c1d1f' }}>
                                {loading ? 'Creating...' : 'Create Event'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div style={{ overflowX: 'auto' }}>
                <table className="um-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Event Name</th>
                            <th>Organizer</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(!Array.isArray(events) || events.length === 0) ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>No events found.</td>
                            </tr>
                        ) : (
                            events.map(event => {
                                const status = getEventStatus(event);
                                const dateStr = (event.eventDate || event.event_date) ? new Date(event.eventDate || event.event_date).toLocaleDateString() : '---';
                                return (
                                    <tr key={event.id} onClick={() => onEventSelect(event)}>
                                        <td style={{ fontWeight: 500 }}>{dateStr}</td>
                                        <td style={{ fontWeight: 600 }}>{event.eventName || event.event_name}</td>
                                        <td>{event.organizerName || event.organizer_name}</td>
                                        <td>
                                            <span style={{ 
                                                display: 'inline-block', padding: '6px 12px', borderRadius: '99px', 
                                                fontSize: '12px', fontWeight: 600, 
                                                backgroundColor: status.bg, color: status.color 
                                            }}>
                                                {status.label}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); onDeleteRequest(event.id); }}
                                                style={{ background: '#1c1d1f', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', color: 'white', fontSize: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                                            >
                                                ×
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default EventList;
