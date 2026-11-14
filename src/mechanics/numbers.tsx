import { visualData as d, average, median, percentChange, periodStart } from '../visualData';
import type { Period } from '../visualData';
import { DataTable, LineChart, Meter, Segmented } from './charts';
import type { MechanicProps } from './types';

const money = (v: number) => `$${Math.round(v).toLocaleString('en-US')}`;
const pct = (v: number) => `${v > 0 ? '+' : ''}${v.toFixed(1)}%`;

// ── Q05 Relative risk ───────────────────────────────────────────
function DotGrid({ cases, label }: { cases: number; label: string }) {
  const cols = 40, rows = d.eyeRisk.groupSize / cols;
  return (
    <figure className="dot-grid">
      <svg viewBox={`0 0 ${cols * 6} ${rows * 6}`} role="img" aria-label={`${label}: ${cases} out of ${d.eyeRisk.groupSize} people have the eye problem.`}>
        {Array.from({ length: d.eyeRisk.groupSize }, (_, i) => (
          <circle key={i} cx={(i % cols) * 6 + 3} cy={Math.floor(i / cols) * 6 + 3} r={i < cases ? 2.8 : 1.7} fill={i < cases ? '#d9541e' : '#a9bcae'} />
        ))}
      </svg>
      <figcaption><b>{label}</b><br />{cases} in {d.eyeRisk.groupSize.toLocaleString('en-US')}</figcaption>
    </figure>
  );
}

export function Risk({ ex, set }: MechanicProps) {
  const view = ex.view ?? 0;
  const { withoutPhone: a, withPhone: b, groupSize } = d.eyeRisk;
  return (
    <>
      <Segmented label="View" value={view} onChange={(v) => set('view', v)} options={[{ value: 0, text: 'The post’s chart' }, { value: 1, text: 'Every 1,000 people' }]} />
      {view === 0 ? (
        <div className="risk-bars" role="img" aria-label={`Bar chart from the post: risk without phone ${a}, with phone ${b}. The second bar is twice as tall.`}>
          <div><i style={{ height: '50%' }} /><span>No phone in bed</span></div>
          <div><i className="hot" style={{ height: '100%' }} /><span>Phone in bed</span></div>
          <strong className="stamp">RISK ×2!</strong>
        </div>
      ) : (
        <>
          <div className="dot-grids">
            <DotGrid cases={a} label="No phone in bed" />
            <DotGrid cases={b} label="Phone in bed" />
          </div>
          <p className="visual-note">Relative change: <b>{pct(percentChange(a, b))}</b> · Absolute change: <b>+{b - a} person in {groupSize.toLocaleString('en-US')}</b> (+{(((b - a) / groupSize) * 100).toFixed(1)} percentage points)</p>
        </>
      )}
    </>
  );
}

// ── Q06 Make it scary ───────────────────────────────────────────
const periods: { value: Period; text: string }[] = [
  { value: 'year', text: 'Full year' },
  { value: 'six', text: '6 months' },
  { value: 'two', text: 'Last 2 months' },
];

export function Scary({ ex, set }: MechanicProps) {
  const axis = ex.axis ?? 0; // 0 = starts at zero, 1 = zoomed
  const periodIndex = ex.period ?? 0;
  const units = ex.units ?? 0; // 0 = thefts, 1 = % change
  const period = periods[periodIndex].value;
  const from = periodStart[period];
  const values = d.bikeThefts.slice(from);
  const labels = d.months.slice(from);
  const change = percentChange(values[0], values[values.length - 1]);
  const drama = axis + periodIndex + units;
  const headlines = [
    'Bike thefts stay about the same this year',
    'Bike thefts go up a little',
    'Bike thefts are rising',
    'Bike thefts JUMP in December!',
    `BIKE THEFTS SURGE ${Math.round(change)}% IN ONE MONTH!`,
  ];
  const headline = units && drama < 4 ? `${headlines[drama]} (${pct(change)})` : headlines[drama];
  const choose = (key: string, value: number) => {
    set(key, value);
    set('changes', (ex.changes ?? 0) + 1);
  };
  return (
    <>
      <div className={`newspaper level-${drama}`} aria-live="polite">
        <span className="newspaper-top">GREENFIELD NEWS</span>
        <p className="newspaper-headline">{headline}</p>
      </div>
      <Meter label="Drama meter" value={drama} max={4} />
      <div className="chart-heading">Bike thefts per month · {labels[0]}–{labels[labels.length - 1]}</div>
      <div className="chart-wrap">
        <LineChart title="Bike thefts per month" values={values} labels={labels} min={axis ? 44 : 0} max={axis ? 54 : 60} color={drama >= 3 ? '#c4552f' : '#26705d'} />
        {units === 1 && <strong className="stamp big">{pct(change)}</strong>}
      </div>
      <div className="controls">
        <Segmented label="Vertical axis" value={axis} onChange={(v) => choose('axis', v)} options={[{ value: 0, text: 'Starts at 0' }, { value: 1, text: 'Zoom in (44–54)' }]} />
        <Segmented label="Period" value={periodIndex} onChange={(v) => choose('period', v)} options={periods.map((p, i) => ({ value: i, text: p.text }))} />
        <Segmented label="Show as" value={units} onChange={(v) => choose('units', v)} options={[{ value: 0, text: 'Number of thefts' }, { value: 1, text: '% change' }]} />
      </div>
      <p className="visual-note">Full year: {d.bikeThefts[0]} → {d.bikeThefts[11]} ({pct(percentChange(d.bikeThefts[0], d.bikeThefts[11]))}). The data never changes — only the way you show it.</p>
    </>
  );
}

// ── Q07 Misleading average ──────────────────────────────────────
export function Average({ ex, set }: MechanicProps) {
  const inside = !!ex.billionaire;
  const salaries = inside ? [...d.cafeSalaries, d.billionaireSalary] : [...d.cafeSalaries];
  return (
    <>
      <div className="cafe" aria-label={`Monthly salaries of people in the café: ${salaries.map(money).join(', ')}`}>
        {d.cafeSalaries.map((s, i) => (
          <div key={i} className="person"><span className="person-icon" aria-hidden="true" /><b>{money(s)}</b></div>
        ))}
        {inside && <div className="person rich"><span className="person-icon" aria-hidden="true" /><b>{money(d.billionaireSalary)}</b></div>}
      </div>
      <div className="stats" aria-live="polite">
        <div><span>AVERAGE (MEAN)</span><strong className={inside ? 'hot' : ''}>{money(average(salaries))}</strong><small>Add all, divide by {salaries.length}</small></div>
        <div><span>MEDIAN</span><strong>{money(median(salaries))}</strong><small>The middle value</small></div>
      </div>
      <button type="button" className="text-button" onClick={() => set('billionaire', inside ? 0 : 1)}>
        <span>{inside ? '←' : '→'}</span> {inside ? 'Ask the billionaire to leave' : 'Let the billionaire walk in'}
      </button>
    </>
  );
}

// ── Q08 Size trick ──────────────────────────────────────────────
function Bag({ x, y, size, label }: { x: number; y: number; size: number; label: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${size / 100})`}>
      <path d="M38 8h24l-6 16c26 8 40 34 40 54 0 14-10 22-46 22S4 92 4 78c0-20 14-46 40-54z" fill="#5f8f75" stroke="#2c5a46" strokeWidth="3" />
      <text x="50" y="74" textAnchor="middle" fontSize="34" fontWeight="bold" fill="#f6f4ed">$</text>
      <text x="50" y="128" textAnchor="middle" fill="#40594a" style={{ font: `${1500 / size}px Arial, sans-serif` }}>{label}</text>
    </g>
  );
}

export function Size({ ex, set }: MechanicProps) {
  const honest = !!ex.honest;
  const { before, after } = d.schoolBudget;
  return (
    <>
      <Segmented label="Picture" value={honest ? 1 : 0} onChange={(v) => set('honest', v)} options={[{ value: 0, text: 'Poster picture' }, { value: 1, text: 'Honest picture' }]} />
      {honest ? (
        <svg className="chart" viewBox="0 0 520 220" role="img" aria-label={`Honest bars: last year ${before} million, this year ${after} million. The second bar is two times longer.`}>
          {[{ y: 50, v: before, l: 'Last year' }, { y: 130, v: after, l: 'This year' }].map((b) => (
            <g key={b.l}>
              <text x="0" y={b.y + 26} className="axis-label">{b.l}</text>
              <rect x="90" y={b.y} width={b.v * 190} height="40" fill="#5f8f75" />
              <text x={100 + b.v * 190} y={b.y + 26} className="chart-value">{b.v} million</text>
            </g>
          ))}
        </svg>
      ) : (
        <svg className="chart" viewBox="0 0 520 260" role="img" aria-label="Poster: a small money bag for last year and a bag two times wider and two times taller for this year. The big bag looks about four times bigger.">
          <Bag x={60} y={120} size={90} label={`Last year: ${before} million`} />
          <Bag x={240} y={10} size={180} label={`This year: ${after} million`} />
        </svg>
      )}
      <p className="visual-note">{honest ? 'Only the length changes: 2 × longer = 2 × more money.' : <>Width × 2 and height × 2 → the area is <b>4 ×</b> bigger. The money is only <b>2 ×</b> more.</>}</p>
      <DataTable title="School budget" rows={[['Last year', `${before} million`], ['This year', `${after} million`]]} />
    </>
  );
}
