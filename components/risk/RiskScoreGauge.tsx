'use client';

interface RiskScoreGaugeProps {
  score: number; // 0-100
}

function getColor(score: number): string {
  if (score <= 33) return '#34d399'; // emerald
  if (score <= 66) return '#f59e0b'; // amber
  return '#f87171'; // red
}

function getLabel(score: number): string {
  if (score <= 25) return 'Low';
  if (score <= 50) return 'Medium-Low';
  if (score <= 66) return 'Medium';
  if (score <= 80) return 'High';
  return 'Very High';
}

export function RiskScoreGauge({ score }: RiskScoreGaugeProps) {
  const clamped = Math.max(0, Math.min(100, score));
  const color = getColor(clamped);
  const label = getLabel(clamped);

  // SVG arc: semi-circle gauge
  // Total arc = 180deg (π radians), from 180deg to 0deg (left to right)
  const radius = 54;
  const cx = 70;
  const cy = 70;
  const circumference = Math.PI * radius; // half-circle
  const filled = (clamped / 100) * circumference;
  const gap = circumference - filled;

  // Start at left (180deg), sweep clockwise
  const startX = cx - radius;
  const startY = cy;
  const endX = cx + radius;
  const endY = cy;

  const trackPath = `M ${startX} ${startY} A ${radius} ${radius} 0 0 1 ${endX} ${endY}`;

  return (
    <div className="flex flex-col items-center">
      <svg width={140} height={80} viewBox="0 0 140 80">
        {/* Track */}
        <path
          d={trackPath}
          fill="none"
          stroke="#27272a"
          strokeWidth={10}
          strokeLinecap="round"
        />
        {/* Filled arc */}
        <path
          d={trackPath}
          fill="none"
          stroke={color}
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={`${filled} ${gap}`}
          strokeDashoffset={0}
          style={{ transition: 'stroke-dasharray 1s ease-out, stroke 0.5s' }}
        />
        {/* Score text */}
        <text x={cx} y={cy - 4} textAnchor="middle" fill="#f4f4f5" fontSize={20} fontWeight="bold">
          {clamped}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill={color} fontSize={10} fontWeight="600">
          {label}
        </text>
      </svg>
      <p className="text-xs text-zinc-500 mt-1">Risk Score (0–100)</p>
    </div>
  );
}
