import React from 'react';
import StatusBadge from './StatusBadge';
import { SkeletonTableRow } from './SkeletonCard';

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return dateStr; }
}

function deriveStatus(event) {
  if (event.status) return event.status;
  if (!event.eventDate) return 'Draft';
  const d = new Date(event.eventDate);
  const now = new Date();
  if (d < now) return 'Completed';
  const diff = (d - now) / (1000 * 60 * 60 * 24);
  if (diff <= 7) return 'Active';
  return 'Draft';
}

export default function EventsTable({ events = [], loading, onEventSelect, onCreateEvent }) {
  return (
    <div className="db-card">
      <div className="db-card__header">
        <div>
          <div className="db-card__title">My Events</div>
          <div className="db-card__subtitle">{events.length} event{events.length !== 1 ? 's' : ''} total</div>
        </div>
        <button className="db-btn primary" onClick={onCreateEvent} aria-label="Create new event">
          <PlusIcon /> New Event
        </button>
      </div>

      {loading ? (
        <table className="db-table">
          <thead>
            <tr>
              <th>Event Name</th><th>Date</th><th>Status</th>
              <th>Participants</th><th>Certificates</th>
            </tr>
          </thead>
          <tbody>
            <SkeletonTableRow /><SkeletonTableRow /><SkeletonTableRow />
          </tbody>
        </table>
      ) : events.length === 0 ? (
        <div className="db-empty">
          <div className="db-empty__icon"><CalendarIcon /></div>
          <div className="db-empty__title">No events yet</div>
          <div className="db-empty__desc">Create your first event to start generating and sending certificates.</div>
          <button className="db-btn primary" style={{ marginTop: 8 }} onClick={onCreateEvent}>
            <PlusIcon /> Create Event
          </button>
        </div>
      ) : (
        <table className="db-table">
          <thead>
            <tr>
              <th>Event Name</th>
              <th>Date</th>
              <th>Status</th>
              <th>Participants</th>
              <th>Certificates</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => {
              const total = event.participantCount ?? event.totalParticipants ?? 0;
              const sent  = event.certificatesSent ?? event.totalCertificates ?? 0;
              const pct   = total > 0 ? Math.round((sent / total) * 100) : 0;
              const status = deriveStatus(event);
              return (
                <tr
                  key={event.id}
                  onClick={() => onEventSelect(event)}
                  title={`Open ${event.eventName}`}
                >
                  <td className="event-name">{event.eventName || 'Untitled Event'}</td>
                  <td>{formatDate(event.eventDate)}</td>
                  <td><StatusBadge status={status} /></td>
                  <td>{total > 0 ? total.toLocaleString() : '—'}</td>
                  <td>
                    <div className="db-progress-wrap">
                      <div className="db-progress-bar">
                        <div className="db-progress-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="db-progress-label">{sent}/{total}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
