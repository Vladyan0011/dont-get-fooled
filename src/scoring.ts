import { questions } from './content.ts';

export type Answer = { choice: number; correct: boolean };
export type Answers = Record<string, Answer>;

const isRight = (answers: Answers, id: string) => {
  const q = questions.find((item) => item.id === id);
  return !!q && answers[id]?.choice === q.correct;
};

/** Score is always derived from stored choices, never from a counter. */
export function scoreAnswers(answers: Answers) {
  return questions.filter((q) => isRight(answers, q.id)).length;
}

export function scoreLevel(answers: Answers, level: number) {
  return questions.filter((q) => q.level === level && isRight(answers, q.id)).length;
}

export function makeAnswer(questionId: string, choice: number): Answer {
  const q = questions.find((item) => item.id === questionId);
  if (!q || !Number.isInteger(choice) || choice < 0 || choice >= q.options.length) throw new Error('Invalid answer');
  return { choice, correct: choice === q.correct };
}

export function tier(score: number) {
  if (score <= 4) return { name: 'Just Scrolling', note: 'Many tricks still work on you — now you know their names.' };
  if (score <= 8) return { name: 'Sharp Eye', note: 'You catch many tricks. A few still slip through.' };
  return { name: 'Manipulation Spotter', note: 'You see what posts want from you. Keep it up.' };
}

/** Tricks the user missed, in quiz order, and tricks they caught. */
export function trickReport(answers: Answers) {
  const missed = questions.filter((q) => answers[q.id] && !isRight(answers, q.id));
  const caught = questions.filter((q) => isRight(answers, q.id));
  return { missed, caught };
}

/** Up to three personal tips: from missed tricks first, general advice if nothing was missed. */
export function recommendations(answers: Answers): { title: string; text: string }[] {
  const { missed } = trickReport(answers);
  if (missed.length === 0) {
    return [
      { title: 'Teach someone', text: 'Show one trick from this quiz to a friend or family member. Explaining it makes you notice it faster.' },
      { title: 'Watch your own feed', text: 'This week, find one real post that uses a trick from this quiz. Name the trick.' },
      { title: 'Check your own posts', text: 'Before you share, ask: am I passing on a feeling or a fact?' },
    ];
  }
  // Prefer one tip per level so advice covers different traps, then fill up in quiz order.
  const picked: typeof missed = [];
  for (const level of [1, 2, 3]) {
    const first = missed.find((q) => q.level === level);
    if (first) picked.push(first);
  }
  for (const q of missed) if (picked.length < 3 && !picked.includes(q)) picked.push(q);
  return picked.slice(0, 3).map((q) => ({ title: q.trick.name, text: q.trick.defend }));
}
