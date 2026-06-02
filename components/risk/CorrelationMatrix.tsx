'use client';
import type { CorrelationMatrix as CorrelationMatrixType } from '@/lib/types/risk';

function cellColor(r: number): string {
  // -1 = red, 0 = neutral (zinc-800), +1 = green
  if (r > 0) {
    const g = Math.round(r * 211);
    const b = Math.round(r * 153);
    return `rgba(52, ${g}, ${b}, 0.5)`;
  } else {
    const intensity = Math.abs(r);
    const r2 = Math.round(intensity * 248);
    return `rgba(${r2}, 113, 113, 0.5)`;
  }
}

export function CorrelationMatrix({ data }: { data: CorrelationMatrixType }) {
  const { symbols, matrix } = data;
  if (!symbols.length) return null;

  return (
    <div className="overflow-x-auto">
      <table className="border-collapse text-xs">
        <thead>
          <tr>
            <th className="w-12 h-8" />
            {symbols.map((s) => (
              <th key={s} className="w-12 h-8 text-zinc-400 font-semibold text-center px-1">
                {s}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, i) => (
            <tr key={symbols[i]}>
              <td className="px-2 py-1 text-zinc-400 font-semibold text-right">{symbols[i]}</td>
              {row.map((r, j) => (
                <td
                  key={j}
                  className="w-12 h-10 text-center font-medium rounded"
                  style={{ background: cellColor(r), color: Math.abs(r) > 0.3 ? '#f4f4f5' : '#a1a1aa' }}
                >
                  {r.toFixed(2)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
