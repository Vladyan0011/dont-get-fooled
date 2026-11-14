import { questions } from './content.ts';
import type { Question } from './content.ts';
import type { Answers } from './scoring.ts';

export type Exploration = Record<string, number>;

export function isComplete(answers: Answers): boolean {
  return questions.every((q) => answers[q.id] !== undefined);
}

export function afterReview(answers: Answers, questionId: string): 'results' | 'feedback' | 'question' {
  if (isComplete(answers)) return 'results';
  return answers[questionId] ? 'feedback' : 'question';
}

/** Some questions ask the user to try the interaction before answering. */
export function gateOpen(q: Question, exploration?: Exploration): boolean {
  if (!q.gate) return true;
  return (exploration?.[q.gate.key] ?? 0) >= q.gate.min;
}

/** A level-complete screen follows the last question of levels 1 and 2. */
export function endsLevel(index: number): boolean {
  const q = questions[index];
  const next = questions[index + 1];
  return !!next && next.level !== q.level;
}
