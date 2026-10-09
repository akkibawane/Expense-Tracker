import React, { useState } from 'react';
import { formatCurrency } from '../../utils/formatters';
import { CurrencyCode } from '../../types';
import { CATEGORY_COLORS } from '../../utils/constants';

interface CategoryData {
  category: string;
  amount: number;
}

interface Props {
  data: CategoryData[];
  currency: CurrencyCode;
}

export const CategoryPieChart: React.FC<Props> = ({ data, currency }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const total = data.reduce((sum, item) => sum + item.amount, 0);

  if (total === 0 || !data.length) {
    return (
      <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        No expense data recorded
      </div>
    );
  }

  // Calculate angles for donut chart
  let cumulativeAngle = 0;
  const slices = data.map((item, index) => {
    const angle = (item.amount / total) * 360;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angle;
    cumulativeAngle += angle;
    const color = CATEGORY_COLORS[item.category] || '#64748b';
    return { ...item, startAngle, endAngle, color, index, pct: Math.round((item.amount / total) * 100) };
  });

  const size = 180;
  const radius = 75;
  const innerRadius = 50;
  const center = size / 2;

  // Polar to Cartesian
  const polarToCartesian = (centerX: number, centerY: number, r: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + r * Math.cos(angleInRadians),
      y: centerY + r * Math.sin(angleInRadians),
    };
  };

  const createArc = (startAngle: number, endAngle: number, rOut: number, rIn: number) => {
    const adjustedEnd = endAngle - startAngle >= 359.99 ? startAngle + 359.99 : endAngle;
    const startOuter = polarToCartesian(center, center, rOut, adjustedEnd);
    const endOuter = polarToCartesian(center, center, rOut, startAngle);
    const startInner = polarToCartesian(center, center, rIn, startAngle);
    const endInner = polarToCartesian(center, center, rIn, adjustedEnd);
    const largeArcFlag = adjustedEnd - startAngle <= 180 ? '0' : '1';

    return [
      'M', startOuter.x, startOuter.y,
      'A', rOut, rOut, 0, largeArcFlag, 0, endOuter.x, endOuter.y,
      'L', startInner.x, startInner.y,
      'A', rIn, rIn, 0, largeArcFlag, 1, endInner.x, endInner.y,
      'Z',
    ].join(' ');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {slices.map((slice) => {
            const isHovered = hoveredIdx === slice.index;
            const rOut = isHovered ? radius + 5 : radius;
            const path = createArc(slice.startAngle, slice.endAngle, rOut, innerRadius);

            return (
              <path
                key={slice.category}
                d={path}
                fill={slice.color}
                opacity={hoveredIdx === null || isHovered ? 1 : 0.6}
                stroke="var(--bg-card)"
                strokeWidth="2"
                style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={() => setHoveredIdx(slice.index)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            );
          })}
        </svg>

        {/* Center label */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
            {hoveredIdx !== null ? slices[hoveredIdx].category : 'Total'}
          </div>
          <div style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-main)' }}>
            {hoveredIdx !== null
              ? formatCurrency(slices[hoveredIdx].amount, currency)
              : formatCurrency(total, currency)}
          </div>
        </div>
      </div>

      {/* Legend list */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '8px 12px',
          width: '100%',
          marginTop: '16px',
        }}
      >
        {slices.map((s) => (
          <div
            key={s.category}
            onMouseEnter={() => setHoveredIdx(s.index)}
            onMouseLeave={() => setHoveredIdx(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '4px 8px',
              borderRadius: '6px',
              background: hoveredIdx === s.index ? 'var(--bg-hover)' : 'transparent',
              cursor: 'pointer',
              fontSize: '0.78rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color }} />
              <span style={{ color: 'var(--text-muted)' }}>{s.category}</span>
            </div>
            <strong style={{ color: 'var(--text-main)', fontVariantNumeric: 'tabular-nums' }}>
              {s.pct}%
            </strong>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryPieChart;
