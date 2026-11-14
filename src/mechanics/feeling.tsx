import { visualData as d } from '../visualData';
import { Meter, Segmented } from './charts';
import type { MechanicProps } from './types';

// ── Q01 Loaded words ────────────────────────────────────────────
const verbs = ['will cost 5% more', 'JUMP by 5%', 'SKYROCKET'];

export function Words({ ex, set }: MechanicProps) {
  const verb = ex.verb ?? 0;
  const toggles = [
    { key: 'shock', text: 'SHOCKING:' },
    { key: 'again', text: '…AGAIN' },
    { key: 'blame', text: '— and they don’t care about you' },
  ];
  const change = (key: string, value: number) => {
    set(key, value);
    set('changes', (ex.changes ?? 0) + 1);
  };
  const emotion = verb + toggles.filter((t) => ex[t.key]).length;
  const headline = `${ex.shock ? 'SHOCKING: ' : ''}Bus tickets ${verbs[verb]}${ex.again ? ' AGAIN' : ''}${ex.blame ? ' — and they don’t care about you' : ''}${emotion >= 3 ? '!!!' : emotion > 0 ? '!' : ''}`;
  return (
    <>
      <div className={`newspaper level-${Math.min(emotion, 4)}`} aria-live="polite">
        <span className="newspaper-top">THE CITY DAILY</span>
        <p className="newspaper-headline">{headline}</p>
      </div>
      <Meter label="Emotion meter" value={emotion} max={5} />
      <Segmented label="Verb" value={verb} onChange={(v) => change('verb', v)} options={verbs.map((v, i) => ({ value: i, text: v }))} />
      <div className="chips" aria-label="Extra words">
        {toggles.map((t) => (
          <button key={t.key} type="button" aria-pressed={!!ex[t.key]} className={ex[t.key] ? 'chip on' : 'chip'} onClick={() => change(t.key, ex[t.key] ? 0 : 1)}>
            {ex[t.key] ? '✓ ' : '+ '}{t.text}
          </button>
        ))}
      </div>
      <div className="fact-box">
        <span>THE FACT · NEVER CHANGES</span>
        <p>A ticket costs <b>{d.busTicket.before} rubles</b> now and <b>{d.busTicket.after} rubles</b> from March (+5%).</p>
      </div>
    </>
  );
}

// ── Q02 Framing ─────────────────────────────────────────────────
export function Framing({ ex, set }: MechanicProps) {
  const flipped = !!ex.flipped;
  const packs = [
    { name: 'Yogurt A', front: '95% FAT-FREE!', tone: 'happy' },
    { name: 'Yogurt B', front: 'Contains 5% fat', tone: 'plain' },
  ];
  return (
    <>
      <div className="packs">
        {packs.map((p) => (
          <div key={p.name} className={`pack ${p.tone} ${flipped ? 'flipped' : ''}`}>
            <span className="pack-name">{p.name}</span>
            {flipped ? (
              <table className="nutrition">
                <caption>Nutrition per 100 g</caption>
                <tbody>
                  <tr><th scope="row">Fat</th><td>{d.yogurtFatGramsPer100g} g</td></tr>
                  <tr><th scope="row">Sugar</th><td>4 g</td></tr>
                  <tr><th scope="row">Protein</th><td>3 g</td></tr>
                </tbody>
              </table>
            ) : (
              <strong className="pack-front">{p.front}</strong>
            )}
            <span className="pack-size">500 g · 89 ₽</span>
          </div>
        ))}
      </div>
      <button type="button" className="text-button" onClick={() => set('flipped', flipped ? 0 : 1)}>
        <span>↻</span> {flipped ? 'Turn to the front' : 'Turn the packs around'}
      </button>
    </>
  );
}

// ── Q03 Cropped quote ───────────────────────────────────────────
export function Quote({ ex, set }: MechanicProps) {
  const words = d.mayorQuote;
  const last = words.length - 1;
  const start = ex.start ?? d.mayorCrop.start;
  const end = ex.end ?? d.mayorCrop.end;
  const update = (s: number, e: number) => {
    set('start', s);
    set('end', e);
    if (s === 0 && e === last) set('full', 1);
  };
  const selected = words.slice(start, end + 1).join(' ');
  const endsSentence = /[.:!?]$/.test(words[end]);
  const shown = `${start > 0 ? '…' : ''}${selected}${end < last && !endsSentence ? '…' : ''}`;
  return (
    <>
      <div className="newspaper" aria-live="polite">
        <span className="newspaper-top">HEADLINE</span>
        <p className="newspaper-headline">Mayor Reed: “{shown}”</p>
      </div>
      <p className="quote-full" aria-label={`Full quote: ${words.join(' ')}`}>
        {words.map((w, i) => (
          <span key={i} className={i >= start && i <= end ? 'kept' : 'cut'}>{w} </span>
        ))}
      </p>
      <label className="range-label" htmlFor="q-start">Quote starts at word {start + 1}: <b>“{words[start]}”</b></label>
      <input id="q-start" type="range" min={0} max={end} value={start} onChange={(e) => update(Number(e.target.value), end)} />
      <label className="range-label" htmlFor="q-end">Quote ends at word {end + 1}: <b>“{words[end]}”</b></label>
      <input id="q-end" type="range" min={start} max={last} value={end} onChange={(e) => update(start, Number(e.target.value))} />
      <button type="button" className="text-button" onClick={() => update(0, last)}><span>↔</span> Show the full quote</button>
    </>
  );
}

// ── Q04 Camera angle ────────────────────────────────────────────
const tight = [205, 165, 150, 85];
const wide = [0, 0, 600, 340];

function seeded(seed: number) {
  let s = seed;
  return () => (s = (s * 9301 + 49297) % 233280) / 233280;
}

const people = (() => {
  const rand = seeded(11);
  const list: { x: number; y: number; c: string }[] = [];
  const colors = ['#315d4b', '#d9754e', '#4b6f8a', '#8a6a4b', '#5c7d52'];
  while (list.length < 120) {
    const a = rand() * Math.PI * 2, r = Math.sqrt(rand());
    list.push({ x: 280 + Math.cos(a) * r * 82, y: 210 + Math.sin(a) * r * 46, c: colors[Math.floor(rand() * colors.length)] });
  }
  list.push({ x: 90, y: 300, c: '#4b6f8a' }, { x: 470, y: 270, c: '#315d4b' }, { x: 530, y: 315, c: '#8a6a4b' });
  return list.sort((a, b) => a.y - b.y);
})();

export function Crowd({ ex, set }: MechanicProps) {
  const zoom = ex.zoom ?? 0;
  const t = zoom / 100;
  const box = tight.map((v, i) => v + (wide[i] - v) * t).join(' ');
  return (
    <>
      <svg className="crowd-photo" viewBox={box} role="img" aria-label={zoom < 100 ? 'Close-up photo: people standing close together fill the whole picture.' : 'Wide photo: about one hundred people stand near a small stage. Most of the big square is empty.'}>
        <rect width="600" height="340" fill="#e6e1d3" />
        <path d="M0 0h600v120H0z" fill="#c9d6cc" />
        {[30, 130, 230, 330, 430, 530].map((x, i) => <rect key={x} x={x} y={i % 2 ? 30 : 50} width="70" height={i % 2 ? 90 : 70} fill="#a9bfb0" />)}
        {Array.from({ length: 12 }, (_, i) => <line key={i} x1={i * 55} y1="120" x2={i * 55 - 60} y2="340" stroke="#d6d0bf" />)}
        {[150, 190, 240, 300].map((y) => <line key={y} x1="0" x2="600" y1={y} y2={y} stroke="#d6d0bf" />)}
        <rect x="250" y="160" width="60" height="12" fill="#7d5f45" />
        <rect x="258" y="140" width="44" height="20" fill="#f4ecd8" stroke="#7d5f45" />
        <text x="280" y="154" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#b25a3c">YES!</text>
        {people.map((p, i) => (
          <g key={i}>
            <path d={`M${p.x - 4.5} ${p.y + 9}q4.5-11 9 0z`} fill={p.c} />
            <circle cx={p.x} cy={p.y} r="3.3" fill={p.c} />
          </g>
        ))}
      </svg>
      <label className="range-label" htmlFor="zoom">Camera: <b>{zoom === 0 ? 'close-up (the photo in the post)' : zoom === 100 ? 'wide — the whole square' : 'zooming out…'}</b></label>
      <input id="zoom" type="range" min={0} max={100} step={5} value={zoom} onChange={(e) => { const v = Number(e.target.value); set('zoom', v); if (v === 100) set('wide', 1); }} />
      <div className="range-ends"><span>Close-up</span><span>Wide</span></div>
    </>
  );
}
