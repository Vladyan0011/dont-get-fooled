import { test } from 'node:test';
import assert from 'node:assert/strict';
import { questions, validateContent, comboMessage } from './content.ts';
import { makeAnswer, recommendations, scoreAnswers, scoreLevel, tier } from './scoring.ts';
import { visualData as d, average, median, percentChange } from './visualData.ts';

const all = (pick: (q: (typeof questions)[number]) => number) =>
  Object.fromEntries(questions.map((q) => [q.id, makeAnswer(q.id, pick(q))]));

test('content: twelve ordered questions, four per level, valid answers', () => {
  assert.doesNotThrow(validateContent);
  assert.deepEqual(questions.map((q) => q.id), Array.from({ length: 12 }, (_, i) => `Q${String(i + 1).padStart(2, '0')}`));
  assert.deepEqual([1, 2, 3].map((l) => questions.filter((q) => q.level === l).length), [4, 4, 4]);
});

test('correct answers are spread evenly over A–D', () => {
  assert.deepEqual([0, 1, 2, 3].map((i) => questions.filter((q) => q.correct === i).length), [3, 3, 3, 3]);
});

test('the correct answer is not always the longest option', () => {
  const longest = questions.filter((q) => {
    const lens = q.options.map((o) => o.length);
    return lens.indexOf(Math.max(...lens)) === q.correct;
  });
  assert.ok(longest.length <= 6, `correct = longest in ${longest.length} questions`);
});

test('scoring: all correct = 12, level totals 4/4/4, all wrong = 0', () => {
  const right = all((q) => q.correct);
  assert.equal(scoreAnswers(right), 12);
  assert.deepEqual([1, 2, 3].map((l) => scoreLevel(right, l)), [4, 4, 4]);
  assert.equal(scoreAnswers(all((q) => (q.correct + 1) % 4)), 0);
});

test('stored "correct" flag cannot add points', () => {
  const a = makeAnswer('Q01', 0);
  assert.equal(a.correct, false);
  assert.equal(scoreAnswers({ Q01: { ...a, correct: true } }), 0);
  assert.throws(() => makeAnswer('Q01', 4));
  assert.throws(() => makeAnswer('Q99', 0));
});

test('tiers', () => {
  assert.equal(tier(4).name, 'Just Scrolling');
  assert.equal(tier(5).name, 'Sharp Eye');
  assert.equal(tier(9).name, 'Manipulation Spotter');
});

test('recommendations come from missed tricks, one per level first', () => {
  const answers = all((q) => (['Q02', 'Q03', 'Q06', 'Q12'].includes(q.id) ? (q.correct + 1) % 4 : q.correct));
  assert.deepEqual(recommendations(answers).map((r) => r.title), ['Framing', 'Chart tricks', 'The combo']);
  const perfect = recommendations(all((q) => q.correct));
  assert.equal(perfect.length, 3);
  assert.ok(!perfect.some((r) => questions.some((q) => q.trick.name === r.title)));
});

test('numbers in the examples match the explanations', () => {
  assert.equal(Math.round(percentChange(d.busTicket.before, d.busTicket.after)), 5);
  // Q03: the default crop is exactly the headline words
  assert.equal(d.mayorQuote.slice(d.mayorCrop.start, d.mayorCrop.end + 1).join(' '), 'the new bridge is a disaster.');
  // Q05: +100% relative, +0.1 percentage points absolute
  assert.equal(percentChange(d.eyeRisk.withoutPhone, d.eyeRisk.withPhone), 100);
  assert.equal(((d.eyeRisk.withPhone - d.eyeRisk.withoutPhone) / d.eyeRisk.groupSize) * 100, 0.1);
  // Q06: year 52 → 53, last month 48 → 53 (+10%), zoomed axis 45–54 holds every value
  assert.deepEqual([d.bikeThefts[0], d.bikeThefts[10], d.bikeThefts[11]], [52, 48, 53]);
  assert.equal(Math.round(percentChange(48, 53)), 10);
  assert.ok(Math.min(...d.bikeThefts) >= 45 && Math.max(...d.bikeThefts) <= 54);
  // Q07: mean jumps to $104,500, median stays $5,000
  assert.equal(average(d.cafeSalaries), 5000);
  assert.equal(average([...d.cafeSalaries, d.billionaireSalary]), 104500);
  assert.equal(median([...d.cafeSalaries, d.billionaireSalary]), 5000);
  // Q08: 2× budget, but 2 × 2 = 4× icon area
  assert.equal(d.schoolBudget.after / d.schoolBudget.before, 2);
  // Q10: the "old price" existed for one week only
  assert.equal(d.headphonePrices.filter((p) => p === 12990).length, 1);
  assert.equal(d.headphonePrices.filter((p) => p === 3990).length, 11);
  // Q11: 1,980 reviews, 1,850 of them in two days
  assert.equal(d.reviewsPerDay.reduce((s, v) => s + v, 0), 1980);
  assert.equal(d.reviewsPerDay.filter((v) => v > 100).reduce((s, v) => s + v, 0), 1850);
  // Q12: the message has seven tricks to find, gate asks for three
  assert.equal(comboMessage.filter((p) => p.trick).length, 7);
});
