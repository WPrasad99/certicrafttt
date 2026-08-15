import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { SkeletonChart } from './SkeletonCard';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function buildFullYear(monthlyData) {
  const base = MONTHS.map((name) => ({ name, events: 0, certs: 0 }));
  if (!Array.isArray(monthlyData)) return base;
  monthlyData.forEach((d) => {
    const idx = base.findIndex((b) => b.name === d.name);
    if (idx !== -1) { base[idx].events = d.events || 0; base[idx].certs = d.certs || 0; }
  });
  return base;
}

const RANGES = [
  { label: '7d',  months: 1 },
  { label: '30d', months: 1 },
  { label: '90d', months: 3 },
  { label: '1y',  months: 12 },
];

export default function ActivityChart({ stats, loading }) {
  const [range, setRange] = useState('90d');

  const data = useMemo(() => {
    const full = buildFullYear(stats?.monthlyData);
    const r = RANGES.find((r) => r.label === range) || RANGES[2];
    return r.months === 12 ? full : full.slice(Math.max(0, full.length - r.months));
  }, [stats, range]);

  if (loading) return <SkeletonChart />;

  return (
    <div className="db-card">
      <div className="db-card__header">
        <div>
          <div className="db-card__title">Monthly Activity</div>
          <div className="db-card__subtitle">Certificates sent &amp; events uploaded</div>
        </div>
        <div className="db-chart-controls">
          {RANGES.map((r) => (
            <button
              key={r.label}
              className={`db-time-btn${range === r.label ? ' active' : ''}`}
              onClick={() => setRange(r.label)}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
      <div className="db-chart-body">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              interval={0}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 10, border: 'none',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                fontSize: 12
              }}
              cursor={{ fill: '#f8fafc' }}
            />
            <Legend
              wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
              iconType="circle"
              iconSize={8}
            />
            <Bar dataKey="events" fill="#818cf8" radius={[5,5,0,0]} name="Events Uploaded"  barSize={20} />
            <Bar dataKey="certs"  fill="#4f46e5" radius={[5,5,0,0]} name="Certificates Sent" barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
