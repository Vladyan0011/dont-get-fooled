import type { ReactNode } from 'react';

type LineChartProps = {
  title: string;
  values: readonly number[];
  labels: readonly string[];
  min: number;
  max: number;
  /** Indexes of points that get a value label. Default: all. */
  labelPoints?: number[];
  format?: (v: number) => string;
  color?: string;
};

/** Accessible SVG line chart. Always shows axis numbers, so a zoomed scale is visible. */
export function LineChart({ title, values, labels, min, max, labelPoints, format = String, color = '#26705d' }: LineChartProps) {
  const left = 52, right = 490, top = 22, bottom = 170;
  const x = (i: number) => left + 18 + (right - left - 30) * (values.length === 1 ? 0.5 : i / (values.length - 1));
  const y = (v: number) => bottom - ((v - min) / (max - min)) * (bottom - top);
  const ticks = [min, (min + max) / 2, max];
  const show = labelPoints ?? values.map((_, i) => i);
  const description = `${title}. ${labels.map((l, i) => `${l}: ${format(values[i])}`).join(', ')}. Vertical axis from ${format(min)} to ${format(max)}.`;
  return (
    <>
      <svg className="chart" viewBox="0 0 520 210" role="img" aria-label={description}>
        {ticks.map((v) => (
          <g key={v}>
            <line x1={left} x2={right} y1={y(v)} y2={y(v)} stroke="#d8dcd2" />
            <text x={left - 8} y={y(v) + 4} textAnchor="end" className="axis-label">{format(v)}</text>
          </g>
        ))}
        <polyline points={values.map((v, i) => `${x(i)},${y(v)}`).join(' ')} fill="none" stroke={color} strokeWidth="3" strokeLinejoin="round" />
        {values.map((v, i) => (
          <g key={i}>
            <circle cx={x(i)} cy={y(v)} r="4.5" fill={color} />
            {show.includes(i) && <text x={x(i)} y={y(v) - 10} textAnchor="middle" className="chart-value">{format(v)}</text>}
            <text x={x(i)} y="196" textAnchor="middle" className="axis-label">{labels[i]}</text>
          </g>
        ))}
      </svg>
      <DataTable title={title} rows={labels.map((l, i) => [l, format(values[i])])} />
    </>
  );
}

type BarChartProps = {
  title: string;
  values: readonly number[];
  labels: readonly string[];
  max: number;
  highlight?: (v: number, i: number) => boolean;
  labelEvery?: number;
};

/** Vertical bar chart with a zero baseline. */
export function BarChart({ title, values, labels, max, highlight = () => false, labelEvery = 1 }: BarChartProps) {
  const left = 46, right = 500, top = 16, bottom = 170;
  const w = (right - left) / values.length;
  const h = (v: number) => (v / max) * (bottom - top);
  return (
    <>
      <svg className="chart" viewBox="0 0 520 200" role="img" aria-label={`${title}. ${labels.map((l, i) => `${l}: ${values[i]}`).join(', ')}.`}>
        {[0, max / 2, max].map((v) => (
          <g key={v}>
            <line x1={left} x2={right} y1={bottom - h(v)} y2={bottom - h(v)} stroke="#d8dcd2" />
            <text x={left - 8} y={bottom - h(v) + 4} textAnchor="end" className="axis-label">{v}</text>
          </g>
        ))}
        {values.map((v, i) => (
          <g key={i}>
            <rect x={left + i * w + w * 0.15} y={bottom - h(v)} width={w * 0.7} height={Math.max(h(v), 0.5)} fill={highlight(v, i) ? '#d9754e' : '#568875'} />
            {i % labelEvery === 0 && <text x={left + i * w + w / 2} y="188" textAnchor="middle" className="axis-label">{labels[i]}</text>}
          </g>
        ))}
      </svg>
      <DataTable title={title} rows={labels.map((l, i) => [l, String(values[i])])} />
    </>
  );
}

export function DataTable({ title, rows }: { title: string; rows: string[][] }) {
  return (
    <details className="data-table">
      <summary>View data table</summary>
      <table>
        <caption>{title}</caption>
        <tbody>
          {rows.map(([k, v]) => (
            <tr key={k}><th scope="row">{k}</th><td>{v}</td></tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}

/** A 0–5 meter that shows how emotional or dramatic something feels. */
export function Meter({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div className="meter" role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value}>
      <span>{label}</span>
      <div className="meter-track">
        {Array.from({ length: max }, (_, i) => <i key={i} className={i < value ? 'on' : ''} />)}
      </div>
      <b>{value} / {max}</b>
    </div>
  );
}

export function Segmented<T extends string | number>({ label, value, options, onChange, disabled }: { label: string; value: T; options: { value: T; text: ReactNode }[]; onChange: (v: T) => void; disabled?: boolean }) {
  return (
    <div className="segmented" role="radiogroup" aria-label={label}>
      <span className="segmented-label">{label}</span>
      <div>
        {options.map((o) => (
          <button key={String(o.value)} type="button" role="radio" aria-checked={o.value === value} className={o.value === value ? 'on' : ''} onClick={() => onChange(o.value)} disabled={disabled}>
            {o.text}
          </button>
        ))}
      </div>
    </div>
  );
}
