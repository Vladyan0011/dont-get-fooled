import { useEffect, useState } from 'react';
import { comboMessage } from '../content';
import { visualData as d } from '../visualData';
import { BarChart, LineChart } from './charts';
import type { MechanicProps } from './types';

const rub = (v: number) => `${v.toLocaleString('en-US')} ₽`;

// ── Q09 Fake urgency ────────────────────────────────────────────
export function Timer({ ex, set }: MechanicProps) {
  const reloads = ex.reloads ?? 0;
  const [left, setLeft] = useState<number>(d.timerSeconds - 1);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const id = window.setInterval(() => setLeft((v) => Math.max(0, v - 1)), 1000);
    return () => window.clearInterval(id);
  }, []);
  const reload = () => {
    setLoading(true);
    window.setTimeout(() => {
      setLeft(d.timerSeconds - 1);
      setLoading(false);
      set('reloads', reloads + 1);
    }, 500);
  };
  const mm = String(Math.floor(left / 60)).padStart(2, '0');
  const ss = String(left % 60).padStart(2, '0');
  return (
    <>
      <div className={`shop ${loading ? 'loading' : ''}`}>
        <div className="shop-bar"><span>●●●</span><span className="shop-url">shop.example/headphones</span><button type="button" onClick={reload} aria-label="Reload the page">↻ Reload</button></div>
        <div className="shop-body">
          <div className="shop-img" aria-hidden="true"><svg viewBox="0 0 100 80"><path d="M20 50V40a30 30 0 0160 0v10" fill="none" stroke="#2c5a46" strokeWidth="7" /><rect x="10" y="45" width="18" height="28" rx="6" fill="#5f8f75" /><rect x="72" y="45" width="18" height="28" rx="6" fill="#5f8f75" /></svg></div>
          <div>
            <b>Wireless headphones X2</b>
            <p className="shop-price">2,990 ₽ <s>5,990 ₽</s></p>
            <p className="shop-alert">⏰ Offer ends in <strong aria-live="off">{mm}:{ss}</strong></p>
            <p className="shop-alert">🔥 Only <strong>2</strong> left in stock!</p>
            <p className="shop-small">👀 {d.peopleWatching[reloads % d.peopleWatching.length]} people are looking at this now</p>
            <span className="shop-buy">BUY NOW</span>
          </div>
        </div>
      </div>
      <p className="visual-note" aria-live="polite">{reloads === 0 ? 'Tip: press “Reload” in the browser bar above.' : `You reloaded ${reloads} time${reloads > 1 ? 's' : ''}. The timer started again from 10:00, and there are still “only 2 left”.`}</p>
    </>
  );
}

// ── Q10 Price anchor ────────────────────────────────────────────
export function Anchor({ ex, set }: MechanicProps) {
  const open = !!ex.history;
  return (
    <>
      <div className="price-tag">
        <span className="sale">−70%</span>
        <s>{rub(12990)}</s>
        <strong>{rub(3990)}</strong>
        <small>Wireless headphones X2 · “Black Friday price”</small>
      </div>
      <button type="button" className="text-button" onClick={() => set('history', open ? 0 : 1)}>
        <span>{open ? '−' : '＋'}</span> {open ? 'Hide price history' : 'Show the price history (12 weeks)'}
      </button>
      {open && (
        <>
          <div className="chart-heading">Price of the same headphones · last 12 weeks</div>
          <LineChart title="Price in rubles by week" values={d.headphonePrices} labels={d.headphonePrices.map((_, i) => `W${i + 1}`)} min={0} max={14000} labelPoints={[0, 9, 10, 11]} format={(v) => v.toLocaleString('en-US')} />
          <p className="visual-note">For 10 weeks the price was <b>3,990 ₽</b>. In week 11 it went up to <b>12,990 ₽</b>. In week 12 the “sale” brought it back to <b>3,990 ₽</b>.</p>
        </>
      )}
    </>
  );
}

// ── Q11 Fake crowd ──────────────────────────────────────────────
const sampleReviews = [
  { day: 21, stars: 5, text: 'Best pillow ever!!! Recommend!!!' },
  { day: 21, stars: 5, text: 'Best pillow!!! Super recommend!!!' },
  { day: 22, stars: 5, text: 'Very good pillow. Best ever!!!' },
  { day: 9, stars: 3, text: 'OK, but it got flat after two weeks. Not worth the price.' },
];

export function Reviews({ ex, set }: MechanicProps) {
  const sorted = !!ex.sorted;
  const total = d.reviewsPerDay.reduce((s, v) => s + v, 0);
  return (
    <>
      <div className="rating">
        <strong>4.9</strong>
        <div><span className="stars" aria-hidden="true">★★★★★</span><span>{total.toLocaleString('en-US')} reviews</span></div>
        <em>“Everyone loves it!”</em>
      </div>
      <button type="button" className="text-button" onClick={() => set('sorted', sorted ? 0 : 1)}>
        <span>{sorted ? '−' : '⇅'}</span> {sorted ? 'Hide the dates' : 'Sort reviews by date'}
      </button>
      {sorted && (
        <>
          <div className="chart-heading">New reviews per day · last 30 days</div>
          <BarChart title="Reviews per day" values={d.reviewsPerDay} labels={d.reviewsPerDay.map((_, i) => String(i + 1))} max={1000} labelEvery={5} highlight={(v) => v > 100} />
          <div className="review-cards">
            {sampleReviews.map((r, i) => (
              <div key={i}><span>Day {r.day} · {'★'.repeat(r.stars)}{'☆'.repeat(5 - r.stars)}</span><p>{r.text}</p></div>
            ))}
          </div>
        </>
      )}
    </>
  );
}

// ── Q12 The combo ───────────────────────────────────────────────
export function Combo({ ex, set }: MechanicProps) {
  const total = comboMessage.filter((p) => p.trick).length;
  const found = ex.found ?? 0;
  const toggle = (i: number) => {
    const key = `part${i}`;
    if (ex[key]) return;
    set(key, 1);
    set('found', found + 1);
  };
  return (
    <>
      <div className="chat">
        <span className="chat-forwarded">↪ Forwarded many times</span>
        <p>
          {comboMessage.map((p, i) => p.trick ? (
            <button key={i} type="button" className={ex[`part${i}`] ? 'mark found' : 'mark'} onClick={() => toggle(i)} aria-pressed={!!ex[`part${i}`]}>
              {p.text}
              {ex[`part${i}`] ? <span className="mark-label">{p.trick}</span> : null}
            </button>
          ) : <span key={i}>{p.text}</span>)}
        </p>
        <span className="chat-time">Aunt Olga · 21:47</span>
      </div>
      <p className="visual-note" aria-live="polite">Tricks found: <b>{found} of {total}</b>{found === total ? ' — you found them all!' : ''}</p>
    </>
  );
}
