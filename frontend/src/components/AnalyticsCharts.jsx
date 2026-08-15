import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import './AnalyticsCharts.css';

function AnalyticsCharts({ stats, events }) {
    // Merge actual data into the full year template to ensure all months visible
    const barData = Array.isArray(stats?.monthlyData) ? stats.monthlyData : [
        { name: 'Jan', events: 0, certs: 0 },
        { name: 'Feb', events: 0, certs: 0 },
        { name: 'Mar', events: 0, certs: 0 },
        { name: 'Apr', events: 0, certs: 0 },
        { name: 'May', events: 0, certs: 0 },
        { name: 'Jun', events: 0, certs: 0 },
        { name: 'Jul', events: 0, certs: 0 },
        { name: 'Aug', events: 0, certs: 0 },
        { name: 'Sep', events: 0, certs: 0 },
        { name: 'Oct', events: 0, certs: 0 },
        { name: 'Nov', events: 0, certs: 0 },
        { name: 'Dec', events: 0, certs: 0 }
    ];

    return (
        <div style={{ flex: 1, width: '100%', minHeight: '320px', marginTop: '16px' }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        interval={0}
                        tick={{ fontSize: 12 }}
                    />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend />
                    <Bar dataKey="events" fill="#1c1d1f" radius={[12, 12, 12, 12]} name="Events Uploaded" barSize={20} />
                    <Bar dataKey="certs" fill="#22c55e" radius={[12, 12, 12, 12]} name="Certificates Sent" barSize={20} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

export default AnalyticsCharts;
