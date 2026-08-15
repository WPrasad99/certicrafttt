import React from 'react';

export default function StatusBadge({ status }) {
  const s = (status || 'draft').toLowerCase();
  return (
    <span className={`db-badge ${s}`}>
      <span className="db-badge-dot" />
      {s.charAt(0).toUpperCase() + s.slice(1)}
    </span>
  );
}
