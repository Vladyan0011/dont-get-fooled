import { useEffect, useState } from 'react';
import { levels, questions, stopChecklist } from './content';
import type { Question } from './content';
import { Visual } from './mechanics';
import { afterReview, endsLevel, gateOpen, isComplete } from './navigation';
import { makeAnswer, recommendations, scoreAnswers, scoreLevel, tier, trickReport } from './scoring';
import type { Answers } from './scoring';
import { freshState, loadState, saveState } from './storage';
import type { State } from './storage';

const letters = ['A', 'B', 'C', 'D'];
const pad = (n: number) => String(n).padStart(2, '0');
const TOTAL = questions.length;
const PER_LEVEL = TOTAL / levels.length;
const levelInfo = (level: number): { name: string; goal: string } => levels[Math.min(level, levels.length) - 1];

export function App() {
  const [loaded] = useState(loadState);
  const [s, setS] = useState<State>(loaded.state);
  const [problem, setProblem] = useState(loaded.problem);
  const [reviewIndex, setReviewIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!problem) saveState(s);
  }, [s, problem]);
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [s.screen, s.currentQuestionIndex, reviewIndex]);

  const update = (patch: Partial<State>) => setS((old) => ({ ...old, ...patch }));
  const q = questions[s.currentQuestionIndex];
  const answers = s.submittedAnswersByQuestionId;

  const restart = () => {
    setProblem(false);
    setReviewIndex(null);
    setS({ ...freshState(), screen: 'question' });
  };
  const advance = () => update({ screen: 'question', currentQuestionIndex: s.currentQuestionIndex + 1, draftAnswer: null });
  const next = () => {
    if (s.currentQuestionIndex === TOTAL - 1) {
      if (isComplete(answers)) update({ screen: 'results', completedAt: new Date().toISOString() });
      return;
    }
    if (endsLevel(s.currentQuestionIndex)) update({ screen: 'transition' });
    else advance();
  };
  const explore = (key: string, value: number) =>
    setS((old) => ({ ...old, exploration: { ...old.exploration, [q.id]: { ...old.exploration[q.id], [key]: value } } }));
  const submit = () => {
    if (s.draftAnswer === null || answers[q.id] || !gateOpen(q, s.exploration[q.id])) return;
    update({ screen: 'feedback', submittedAnswersByQuestionId: { ...answers, [q.id]: makeAnswer(q.id, s.draftAnswer) } });
  };
  const leaveReview = () => {
    setReviewIndex(null);
    update({ screen: afterReview(answers, q.id) });
  };

  if (problem) {
    return (
      <div className="shell">
        <main className="landing single">
          <div>
            <p className="eyebrow">A NOTE ABOUT YOUR PROGRESS</p>
            <h1>Let's start fresh.</h1>
            <p className="intro">The quiz has a new version. Your old progress cannot be used with the new questions.</p>
            <button className="primary" onClick={restart}>Start new quiz <span>↗</span></button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="shell">
      <header className="header">
        <button className="brand" onClick={() => s.screen === 'review' && leaveReview()} aria-label="Don't Get Fooled!">
          <span className="brand-icon">?</span>
          <span>DON'T GET<br />FOOLED<span className="orange">!</span></span>
        </button>
        <div className="header-right"><span>A FIELD GUIDE TO MANIPULATION</span><span className="edition">ISSUE 02 / 2026</span></div>
      </header>

      {s.screen === 'landing' && <Landing onStart={() => update({ screen: 'question' })} />}

      {(s.screen === 'question' || s.screen === 'feedback') && (
        <main className="game">
          <div className="progress-row">
            <span>LEVEL {pad(q.level)} <span className="progress-slash">/</span> {levels[q.level - 1].name}</span>
            <span>CHALLENGE {pad(s.currentQuestionIndex + 1)} <span className="progress-slash">/</span> {TOTAL}</span>
          </div>
          <div className="progress-track"><div style={{ width: `${((s.currentQuestionIndex + (s.screen === 'feedback' ? 1 : 0)) / TOTAL) * 100}%` }} /></div>
          <div className="game-heading">
            <div>
              <p className="eyebrow">CHALLENGE {pad(s.currentQuestionIndex + 1)} <span>✳</span> {levels[q.level - 1].goal.toUpperCase()}</p>
              <h1>{q.title}{!/[.!?]$/.test(q.title) && <span className="orange">.</span>}</h1>
            </div>
            <span className="heading-num">{pad(s.currentQuestionIndex + 1)}</span>
          </div>
          <div className="game-layout">
            <section><Visual key={q.id} q={q} exploration={s.exploration[q.id]} onExplore={explore} /></section>
            <section className="answer-section">
              <p className="eyebrow">YOUR TURN</p>
              <h2>{q.prompt}</h2>
              <Options q={q} draft={s.draftAnswer} answers={answers} locked={s.screen === 'feedback'} onPick={(i) => update({ draftAnswer: i })} />
              {s.screen === 'question' ? (
                <>
                  <button className="primary full" disabled={s.draftAnswer === null || !gateOpen(q, s.exploration[q.id])} onClick={submit}>Check answer <span>↗</span></button>
                  {!gateOpen(q, s.exploration[q.id]) && <p className="helper">{q.gate?.hint}</p>}
                </>
              ) : (
                <Feedback q={q} answers={answers} onNext={next} isLast={s.currentQuestionIndex === TOTAL - 1} />
              )}
              <Glossary />
            </section>
          </div>
          {s.currentQuestionIndex > 0 && (
            <button className="back-link" onClick={() => { setReviewIndex(s.currentQuestionIndex - 1); update({ screen: 'review' }); }}>← Review previous answers</button>
          )}
        </main>
      )}

      {s.screen === 'transition' && (
        <main className="interstitial">
          <p className="eyebrow">LEVEL {pad(q.level)} COMPLETE <span>✳</span></p>
          <div className="transition-icon">{scoreLevel(answers, q.level)}/{PER_LEVEL}</div>
          <h1>{levels[q.level - 1].name}<br /><em>done.</em></h1>
          <p>Next up: <b>{levelInfo(q.level + 1).name}</b>. {levelInfo(q.level + 1).goal}</p>
          <button className="primary" onClick={advance}>Continue to level {pad(q.level + 1)} <span>→</span></button>
        </main>
      )}

      {s.screen === 'results' && <Results answers={answers} onReview={() => { setReviewIndex(null); update({ screen: 'review' }); }} onRestart={restart} />}

      {s.screen === 'review' && (
        <main className="review">
          <button className="back-link" onClick={leaveReview}>← {isComplete(answers) ? 'Back to results' : 'Back to challenge'}</button>
          <p className="eyebrow">YOUR FIELD NOTES</p>
          <h1>Review your answers<span className="orange">.</span></h1>
          {reviewIndex !== null ? (
            <ReviewItem q={questions[reviewIndex]} answers={answers} onBack={() => setReviewIndex(null)} />
          ) : (
            <div className="review-list">
              {questions.filter((x) => answers[x.id]).map((x, i) => (
                <button key={x.id} onClick={() => setReviewIndex(questions.indexOf(x))}>
                  <span>{pad(i + 1)} / {x.title} <small>· {x.trick.name}</small></span>
                  <span>{answers[x.id].correct ? '✓ caught' : '↗ missed'} &nbsp; View</span>
                </button>
              ))}
            </div>
          )}
        </main>
      )}

      <footer><span>DON'T GET FOOLED! <b>✳</b></span><span>EVERY POST IS SELLING SOMETHING.</span><span>ALL EXAMPLES ARE FICTIONAL</span></footer>
    </div>
  );
}

function Landing({ onStart }: { onStart: () => void }) {
  return (
    <main className="landing">
      <div className="landing-copy">
        <p className="eyebrow"><span className="dot" /> A FIELD GUIDE TO MANIPULATION</p>
        <h1>Don't get<br /><em>fooled.</em></h1>
        <p className="landing-sub">Every post is selling something.</p>
        <p className="intro">An idea, a feeling, or an action. In 12 short challenges you will use real manipulation tricks yourself — and learn to see them in your own feed.</p>
        <button className="primary" onClick={onStart}>Start the quiz <span>↗</span></button>
        <div className="meta"><span><b>12</b> challenges</span><span><b>03</b> traps</span><span><b>7–10</b> minutes</span></div>
        <ol className="trap-list">
          {levels.map((l, i) => <li key={l.name}><b>{pad(i + 1)} {l.name}</b> — {l.goal}</li>)}
        </ol>
        <p className="landing-note">✳ All examples are fictional and created for this quiz. No sign-up, no tracking.</p>
      </div>
      <div className="landing-art" aria-hidden="true">
        <div className="art-paper">
          <div className="paper-top">THE DAILY FEED <span>✳</span></div>
          <div className="paper-line" />
          <div className="paper-title">WHAT DO<br /><i>they want</i><br />FROM YOU?</div>
          <div className="paper-grid">
            <div className="paper-bars"><i /><i /><i /><i /></div>
            <div><div className="scribble" /><div className="scribble short" /><div className="scribble" /></div>
          </div>
          <div className="paper-bottom">LOOK CLOSER <span>↗</span></div>
        </div>
        <div className="art-stamp">STOP<br />&amp; THINK <span>✳</span></div>
        <div className="art-caption">A FIELD GUIDE TO<br />THINKING TWICE ↗</div>
      </div>
    </main>
  );
}

function Options({ q, draft, answers, locked, onPick }: { q: Question; draft: number | null; answers: Answers; locked: boolean; onPick: (i: number) => void }) {
  return (
    <div role="radiogroup" aria-label="Answer choices" className="options">
      {q.options.map((option, i) => {
        const cls = ['option', draft === i && 'selected', locked && i === q.correct && 'correct', locked && answers[q.id]?.choice === i && i !== q.correct && 'wrong'].filter(Boolean).join(' ');
        return (
          <label key={option} className={cls}>
            <input type="radio" name={`answer-${q.id}`} checked={draft === i} onChange={() => onPick(i)} disabled={locked} />
            <span className="option-letter">{letters[i]}</span>
            <span>{option}</span>
            <span className="radio-mark">{locked && i === q.correct ? '✓' : ''}</span>
          </label>
        );
      })}
    </div>
  );
}

function TrickCard({ q }: { q: Question }) {
  return (
    <div className="trick-card">
      <span>TRICK CARD · {pad(questions.indexOf(q) + 1)}</span>
      <h4>{q.trick.name}</h4>
      <p><b>How it works:</b> {q.trick.how}</p>
      <p><b>What to do:</b> {q.trick.defend}</p>
    </div>
  );
}

function Feedback({ q, answers, onNext, isLast }: { q: Question; answers: Answers; onNext: () => void; isLast: boolean }) {
  const a = answers[q.id];
  return (
    <div className="feedback" role="status" aria-live="polite">
      <div className="feedback-label">{a.correct ? '✓ CORRECT — TRICK CAUGHT' : '↗ NOT QUITE — THIS TRICK WORKED'}</div>
      <h3>{a.correct ? 'Good eye.' : 'Here’s what happened.'}</h3>
      {!a.correct && <p className="answer-detail"><b>Correct answer:</b> {q.options[q.correct]}</p>}
      <p className="feedback-reason">{q.why[a.choice]}</p>
      <p>{q.feedback}</p>
      <TrickCard q={q} />
      <button className="primary full" onClick={onNext}>{isLast ? 'See your results' : 'Next challenge'} <span>→</span></button>
    </div>
  );
}

function Results({ answers, onReview, onRestart }: { answers: Answers; onReview: () => void; onRestart: () => void }) {
  const score = scoreAnswers(answers);
  const t = tier(score);
  const { caught } = trickReport(answers);
  const tips = recommendations(answers);
  return (
    <main className="results">
      <p className="eyebrow">THE FIELD GUIDE / COMPLETE ✳</p>
      <h1>Now you can<br /><em>see the tricks.</em></h1>
      <p className="results-intro">You answered {score} of {TOTAL} questions correctly. This quiz gives you practice and feedback; it is not a scientific test of your skills.</p>
      <div className="result-grid">
        <div className="score-card"><span>YOUR RESULT</span><div className="big-score">{score}<small>/ {TOTAL}</small></div><b>{t.name}</b><p>{t.note}</p></div>
        <div className="level-card"><span>YOUR JOURNEY</span>{levels.map((l, i) => <div key={l.name}><span><b>{pad(i + 1)}</b> {l.name}</span><strong>{scoreLevel(answers, i + 1)} / {PER_LEVEL}</strong></div>)}</div>
      </div>

      <section className="collection">
        <p className="eyebrow">YOUR TRICK COLLECTION</p>
        <h2>{caught.length} of {TOTAL} tricks caught</h2>
        <div className="collection-grid">
          {questions.map((q) => {
            const ok = caught.includes(q);
            return (
              <div key={q.id} className={ok ? 'caught' : 'missed'}>
                <span>{ok ? '✓ CAUGHT' : '↗ WATCH OUT'}</span>
                <b>{q.trick.name}</b>
                <p>{q.trick.how}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="recommendations">
        <div>
          <p className="eyebrow">YOUR PERSONAL TIPS</p>
          <h2>What to<br /><em>practise next.</em></h2>
          <p>{tips.length && trickReport(answers).missed.length ? 'Based on the tricks that worked on you.' : 'You caught every trick. Here is how to go further.'}</p>
        </div>
        <div className="tips">
          {tips.map((tip, i) => <div key={tip.title}><span>{pad(i + 1)}</span><p><b>{tip.title}.</b> {tip.text}</p></div>)}
        </div>
      </section>

      <div className="sift">
        <p className="eyebrow">WHEN A POST PUSHES YOU</p>
        <h2>Remember: STOP.</h2>
        <div>{stopChecklist.map((c) => <span key={c.letter}><b>{c.letter}</b><strong>{c.title}</strong><br />{c.text}</span>)}</div>
      </div>
      <div className="result-actions">
        <button className="primary" onClick={onReview}>Review answers <span>↗</span></button>
        <button className="secondary" onClick={onRestart}>Try again ↻</button>
      </div>
    </main>
  );
}

function ReviewItem({ q, answers, onBack }: { q: Question; answers: Answers; onBack: () => void }) {
  const a = answers[q.id];
  return (
    <>
      <button className="back-link" onClick={onBack}>← All answered questions</button>
      <h2>{q.title}</h2>
      <Visual key={q.id} q={q} readOnly />
      <p><b>Your answer:</b> {q.options[a.choice]} {a.correct ? '✓' : ''}</p>
      {!a.correct && <p><b>Correct answer:</b> {q.options[q.correct]}</p>}
      <div className="evidence-note"><p><b>About your choice:</b> {q.why[a.choice]}</p><p>{q.feedback}</p></div>
      <TrickCard q={q} />
    </>
  );
}

function Glossary() {
  const words: [string, string][] = [
    ['Manipulation', 'Trying to change what you think or do in a hidden or unfair way.'],
    ['Framing', 'Saying the same fact in a positive or negative way.'],
    ['Relative change', 'Change in percent: 1 → 2 is +100%.'],
    ['Absolute change', 'Change in real numbers: 1 → 2 is +1.'],
    ['Percentage point', 'The difference between two percentages: 20% → 25% is 5 points.'],
    ['Median', 'The middle value when you put numbers in order.'],
    ['Anchor', 'The first number you see, which changes how you judge the next one.'],
    ['Misinformation', 'False information shared by mistake.'],
    ['Disinformation', 'False information shared on purpose, to mislead.'],
  ];
  return (
    <details className="game-glossary">
      <summary>Helpful words</summary>
      <dl>{words.map(([w, d]) => <div key={w} className="gl-row"><dt>{w}</dt><dd>{d}</dd></div>)}</dl>
    </details>
  );
}
