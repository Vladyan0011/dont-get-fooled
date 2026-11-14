import { test } from 'node:test';
import assert from 'node:assert/strict';
import { afterReview, endsLevel, gateOpen, isComplete } from './navigation.ts';
import { makeAnswer } from './scoring.ts';
import { questions } from './content.ts';

const q = (id: string) => questions.find((x) => x.id === id)!;

test('review returns to the current question until all answers are submitted', () => {
  const answers = { Q01: makeAnswer('Q01', questions[0].correct) };
  assert.equal(isComplete(answers), false);
  assert.equal(afterReview(answers, 'Q02'), 'question');
  assert.equal(afterReview(answers, 'Q01'), 'feedback');
  const complete = Object.fromEntries(questions.map((x) => [x.id, makeAnswer(x.id, x.correct)]));
  assert.equal(isComplete(complete), true);
  assert.equal(afterReview(complete, 'Q12'), 'results');
});

test('level screens come after Q04 and Q08 only', () => {
  assert.deepEqual(questions.map((_, i) => i).filter(endsLevel), [3, 7]);
});

test('gated questions unlock only after the interaction', () => {
  assert.equal(gateOpen(q('Q02')), true);
  assert.equal(gateOpen(q('Q01'), { changes: 1 }), false);
  assert.equal(gateOpen(q('Q01'), { changes: 2 }), true);
  assert.equal(gateOpen(q('Q12'), { found: 2 }), false);
  assert.equal(gateOpen(q('Q12'), { found: 3 }), true);
  assert.equal(gateOpen(q('Q04')), false);
  assert.equal(gateOpen(q('Q04'), { wide: 1 }), true);
});
