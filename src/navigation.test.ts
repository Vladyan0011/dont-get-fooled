import { test } from 'node:test';
import assert from 'node:assert/strict';
import { afterReview, endsLevel, isComplete } from './navigation.ts';
import { makeAnswer } from './scoring.ts';
import { questions } from './content.ts';

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

test('no question requires an interaction before answering', () => {
  assert.ok(questions.every((x) => !('gate' in x)));
});
