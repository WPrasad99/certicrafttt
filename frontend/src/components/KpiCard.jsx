import React from 'react';
import './DashboardNew.css';
import { MoreVertical } from 'lucide-react';

function KpiCard({ title, value, unit, dots = 5, totalDots = 8, variant = 'light', icon }) {
    // variant can be 'light', 'neon', 'dark'
    
    return (
        <div className={`um-kpi-card ${variant}`} style={{ padding: '24px', borderRadius: '32px', display: 'flex', flexDirection: 'column', minHeight: '240px' }}>
            
            {/* Top Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                        width: '40px', height: '40px', 
                        background: variant === 'dark' ? 'rgba(255,255,255,0.1)' : 'white', 
                        borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: variant === 'dark' ? 'white' : '#1c1d1f'
                    }}>
                        {icon}
                    </div>
                    <span style={{ fontSize: '16px', fontWeight: 500, color: variant === 'dark' ? 'white' : '#1c1d1f' }}>
                        {title}
                    </span>
                </div>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: variant === 'dark' ? 'white' : '#1c1d1f' }}>
                    <MoreVertical size={20} />
                </button>
            </div>

            {/* Middle Row (Value + Badge) */}
            <div style={{ display: 'flex', alignItems: 'flex-end', marginTop: '24px', gap: '12px' }}>
                <div style={{ fontSize: '64px', fontWeight: 400, letterSpacing: '-2px', color: variant === 'dark' ? 'white' : '#1c1d1f', lineHeight: 0.9 }}>
                    {value}
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingBottom: '6px' }}>
                    {unit && (
                        <div style={{ 
                            background: variant === 'neon' ? 'white' : (variant === 'dark' ? 'rgba(255,255,255,0.2)' : '#eaffe5'), 
                            color: variant === 'dark' ? 'white' : '#1c1d1f',
                            padding: '4px 10px', borderRadius: '99px', fontSize: '13px', fontWeight: 600,
                            display: 'flex', alignItems: 'center', gap: '6px'
                        }}>
                            {unit}
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: `1.5px solid ${variant === 'dark' ? 'white' : '#1c1d1f'}` }}></div>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Row (Pills) */}
            <div style={{ display: 'flex', gap: '6px', marginTop: 'auto', paddingTop: '32px' }}>
                {[...Array(totalDots)].map((_, i) => (
                    <div 
                        key={i} 
                        style={{ 
                            flex: 1,
                            height: '48px', 
                            borderRadius: '24px', 
                            background: i < dots ? (variant === 'dark' ? '#fff' : '#1c1d1f') : 'transparent',
                            border: i >= dots ? (variant === 'dark' ? '1px dashed rgba(255,255,255,0.3)' : '1px dashed rgba(0,0,0,0.15)') : 'none',
                        }}
                    ></div>
                ))}
            </div>

        </div>
    );
}

export default KpiCard;
