import React from 'react';

export function SkeletonKpiCard() {
  return (
    <div className="db-skel-card">
      <div className="db-kpi-card__top">
        <div className="db-skeleton" style={{ height: 12, width: 80, borderRadius: 4 }} />
        <div className="db-skeleton" style={{ height: 36, width: 36, borderRadius: 8 }} />
      </div>
      <div className="db-skeleton" style={{ height: 32, width: 70, borderRadius: 6, marginTop: 10 }} />
      <div className="db-skeleton" style={{ height: 12, width: 100, borderRadius: 4, marginTop: 10 }} />
    </div>
  );
}

export function SkeletonTableRow() {
  return (
    <tr>
      {[200, 100, 80, 100, 130].map((w, i) => (
        <td key={i}>
          <div className="db-skeleton" style={{ height: 12, width: w, borderRadius: 4 }} />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonChart() {
  return (
    <div className="db-card">
      <div className="db-card__header">
        <div className="db-skeleton" style={{ height: 14, width: 120, borderRadius: 4 }} />
        <div className="db-skeleton" style={{ height: 28, width: 200, borderRadius: 6 }} />
      </div>
      <div className="db-chart-body">
        <div className="db-skeleton" style={{ height: 260, borderRadius: 8 }} />
      </div>
    </div>
  );
}
