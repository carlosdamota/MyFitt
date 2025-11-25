import React from 'react';

const SimpleChart = ({ points, height = 100, width = 300, color = "#38bdf8", showDots = true }) => {
  if (!points || points.length < 2) return <div className="flex items-center justify-center h-full text-slate-500 text-xs italic">Registra al menos 2 días</div>;
  const vals = points.map(p => p.val);
  const maxVal = Math.max(...vals);
  const minVal = Math.min(...vals);
  const padding = 10;
  const normalizeY = (val) => height - padding - ((val - minVal) / (maxVal - minVal || 1)) * (height - 2 * padding);
  const normalizeX = (index) => padding + (index / (points.length - 1)) * (width - 2 * padding);
  const pathD = points.reduce((acc, p, i) => i === 0 ? `M ${normalizeX(i)} ${normalizeY(p.val)}` : `${acc} L ${normalizeX(i)} ${normalizeY(p.val)}`, "");
  const areaD = `${pathD} L ${normalizeX(points.length-1)} ${height} L ${normalizeX(0)} ${height} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
       <defs><linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.2" /><stop offset="100%" stopColor={color} stopOpacity="0" /></linearGradient></defs>
      <path d={areaD} fill={`url(#grad-${color})`} stroke="none" />
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" />
      {showDots && points.map((p, i) => <circle key={i} cx={normalizeX(i)} cy={normalizeY(p.val)} r="3" fill="#fff" stroke={color} strokeWidth="1" />)}
    </svg>
  );
};

export default SimpleChart;
