import React, { useState } from 'react';
import { formatCurrency } from '../../utils/formatters';
import { CurrencyCode } from '../../types';

interface DayTrend {
  day: string;
  amount: number;
}

interface Props {
  data: DayTrend[];
  currency: CurrencyCode;
}

export const WeeklyTrendChart: React.FC<Props> = ({ data, currency }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        No weekly activity logged
      </div>
    );
  }

  const maxVal = Math.max(...data.map((d) => d.amount), 500);
  const width = 360;
  const height = 160;
  const paddingX = 30;
  const paddingY = 20;

  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1)) * (width - paddingX * 2);
    const y = height - paddingY - (d.amount / maxVal) * (height - paddingY * 2);
    return { x, y, ...d, index: i };
  });

  // Build SVG path
  const linePath = points.reduce((acc, curr, i) => {
    if (i === 0) return `M ${curr.x} ${curr.y}`;
    const prev = points[i - 1];
    const cp1x = prev.x + (curr.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (curr.x - prev.x) / 2;
    const cp2y = curr.y;
    return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
  }, '');

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      <svg width="100%" height={height + 30} viewBox={`0 0 ${width} ${height + 30}`} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal gridlines */}
        {[0, 0.5, 1].map((pct, idx) => {
          const y = height - paddingY - pct * (height - paddingY * 2);
          return (
            <line
              key={idx}
              x1={paddingX}
              y1={y}
              x2={width - paddingX}
              y2={y}
              stroke="var(--border-subtle)"
              strokeDasharray="3 3"
            />
          );
        })}

        {/* Gradient fill area */}
        <path d={areaPath} fill="url(#trendGradient)" />

        {/* Trend line */}
        <path d={linePath} fill="none" stroke="#f43f5e" strokeWidth="3" strokeLinecap="round" />

        {/* Data points */}
        {points.map((pt) => {
          const isHovered = hoveredIdx === pt.index;
          return (
            <g
              key={pt.day}
              onMouseEnter={() => setHoveredIdx(pt.index)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{ cursor: 'pointer' }}
            >
              <circle
                cx={pt.x}
                cy={pt.y}
                r={isHovered ? 6 : 4}
                fill="#f43f5e"
                stroke="var(--bg-card)"
                strokeWidth="2"
              />
              <text
                x={pt.x}
                y={height + 14}
                fill="var(--text-muted)"
                fontSize="11"
                fontWeight="600"
                textAnchor="middle"
              >
                {pt.day}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Floating tooltip */}
      {hoveredIdx !== null && (
        <div
          style={{
            position: 'absolute',
            top: '0px',
            left: `${Math.min(80, Math.max(10, (points[hoveredIdx].x / width) * 100))}%`,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-card)',
            padding: '6px 10px',
            borderRadius: '6px',
            fontSize: '0.78rem',
            boxShadow: 'var(--shadow-md)',
            pointerEvents: 'none',
          }}
        >
          <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{points[hoveredIdx].day}</div>
          <strong style={{ color: '#f43f5e' }}>{formatCurrency(points[hoveredIdx].amount, currency)}</strong>
        </div>
      )}
    </div>
  );
};

export default WeeklyTrendChart;
