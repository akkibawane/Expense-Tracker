import React, { useState } from 'react';
import { formatCurrency } from '../../utils/formatters';
import { CurrencyCode } from '../../types';

interface MonthData {
  month: string;
  income: number;
  expense: number;
}

interface Props {
  data: MonthData[];
  currency: CurrencyCode;
}

export const IncomeExpenseChart: React.FC<Props> = ({ data, currency }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        No transaction history available
      </div>
    );
  }

  const maxVal = Math.max(...data.map((d) => Math.max(d.income, d.expense)), 1000);
  const chartHeight = 180;
  const barWidth = 14;
  const groupSpacing = 60;
  const chartWidth = Math.max(300, data.length * groupSpacing + 40);

  return (
    <div style={{ width: '100%', overflowX: 'auto', position: 'relative' }}>
      <div style={{ display: 'flex', gap: '16px', marginBottom: '14px', fontSize: '0.8rem', justifyContent: 'flex-end' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#10b981' }} />
          <span style={{ color: 'var(--text-muted)' }}>Income</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#f43f5e' }} />
          <span style={{ color: 'var(--text-muted)' }}>Expense</span>
        </div>
      </div>

      <svg width="100%" height={chartHeight + 40} viewBox={`0 0 ${chartWidth} ${chartHeight + 40}`} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="incomeBarGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="expenseBarGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#e11d48" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
          const y = chartHeight - pct * chartHeight + 10;
          return (
            <g key={idx}>
              <line x1="20" y1={y} x2={chartWidth - 20} y2={y} stroke="var(--border-subtle)" strokeDasharray="3 3" />
            </g>
          );
        })}

        {/* Bars */}
        {data.map((item, idx) => {
          const groupX = 35 + idx * groupSpacing;
          const incomeHeight = (item.income / maxVal) * chartHeight;
          const expenseHeight = (item.expense / maxVal) * chartHeight;

          const incomeY = chartHeight - incomeHeight + 10;
          const expenseY = chartHeight - expenseHeight + 10;
          const isHovered = hoveredIndex === idx;

          return (
            <g
              key={item.month}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Income bar */}
              <rect
                x={groupX}
                y={incomeY}
                width={barWidth}
                height={incomeHeight}
                rx="4"
                fill="url(#incomeBarGrad)"
                opacity={isHovered ? 1 : 0.88}
                style={{ transition: 'all 0.2s' }}
              />
              {/* Expense bar */}
              <rect
                x={groupX + barWidth + 4}
                y={expenseY}
                width={barWidth}
                height={expenseHeight}
                rx="4"
                fill="url(#expenseBarGrad)"
                opacity={isHovered ? 1 : 0.88}
                style={{ transition: 'all 0.2s' }}
              />

              {/* Month label */}
              <text
                x={groupX + barWidth}
                y={chartHeight + 28}
                fill="var(--text-muted)"
                fontSize="11"
                fontWeight="600"
                textAnchor="middle"
              >
                {item.month}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Floating tooltip */}
      {hoveredIndex !== null && data[hoveredIndex] && (
        <div
          style={{
            position: 'absolute',
            top: '0',
            left: `${Math.min(70, Math.max(10, (hoveredIndex / data.length) * 100))}%`,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-card)',
            padding: '8px 12px',
            borderRadius: '8px',
            boxShadow: 'var(--shadow-md)',
            fontSize: '0.78rem',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        >
          <div style={{ fontWeight: '700', marginBottom: '4px', color: 'var(--text-main)' }}>
            {data[hoveredIndex].month}
          </div>
          <div style={{ color: '#10b981', display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
            <span>Income:</span>
            <strong>{formatCurrency(data[hoveredIndex].income, currency)}</strong>
          </div>
          <div style={{ color: '#f43f5e', display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
            <span>Expense:</span>
            <strong>{formatCurrency(data[hoveredIndex].expense, currency)}</strong>
          </div>
          <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '4px', paddingTop: '4px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
            <span>Net:</span>
            <strong style={{ color: data[hoveredIndex].income >= data[hoveredIndex].expense ? '#10b981' : '#f43f5e' }}>
              {formatCurrency(data[hoveredIndex].income - data[hoveredIndex].expense, currency)}
            </strong>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncomeExpenseChart;
