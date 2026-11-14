import { questions } from './content.ts';
import { isComplete } from './navigation.ts';
import type { Exploration } from './navigation.ts';
import type { Answers } from './scoring.ts';

export type Screen = 'landing' | 'question' | 'feedback' | 'transition' | 'results' | 'review';

export type State = {
  schemaVersion: 3;
  runId: string;
  currentQuestionIndex: number;
  screen: Screen;
  draftAnswer: number | null;
  submittedAnswersByQuestionId: Answers;
  /** UI settings per question (slider positions, revealed cards). Never affects scoring. */
  exploration: Record<string, Exploration>;
  completedAt?: string;
};

const KEY = 'dont-get-fooled-v3';
const SCREENS: Screen[] = ['landing', 'question', 'feedback', 'transition', 'results', 'review'];

export const freshState = (): State => ({
  schemaVersion: 3,
  runId: globalThis.crypto?.randomUUID?.() ?? String(Date.now()),
  currentQuestionIndex: 0,
  screen: 'landing',
  draftAnswer: null,
  submittedAnswersByQuestionId: {},
  exploration: {},
});

function isValid(s: State): boolean {
  if (s.schemaVersion !== 3 || !SCREENS.includes(s.screen)) return false;
  if (!Number.isInteger(s.currentQuestionIndex) || s.currentQuestionIndex < 0 || s.currentQuestionIndex >= questions.length) return false;
  if (!(s.draftAnswer === null || (Number.isInteger(s.draftAnswer) && s.draftAnswer >= 0 && s.draftAnswer < 4))) return false;
  if (typeof s.submittedAnswersByQuestionId !== 'object' || s.submittedAnswersByQuestionId === null) return false;
  if (typeof s.exploration !== 'object' || s.exploration === null) return false;
  const answersOk = Object.entries(s.submittedAnswersByQuestionId).every(([id, a]) => {
    const q = questions.find((x) => x.id === id);
    return q && Number.isInteger(a.choice) && a.choice >= 0 && a.choice < 4 && a.correct === (a.choice === q.correct);
  });
  if (!answersOk) return false;
  if ((s.screen === 'results' || s.completedAt) && !isComplete(s.submittedAnswersByQuestionId)) return false;
  return true;
}

/** `problem` is true when old or broken data was found; the app then offers a fresh start. */
export function loadState(): { state: State; problem: boolean } {
  let raw: string | null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    return { state: freshState(), problem: false };
  }
  if (!raw) return { state: freshState(), problem: hasOldVersion() };
  try {
    const parsed = JSON.parse(raw) as State;
    return isValid(parsed) ? { state: parsed, problem: false } : { state: freshState(), problem: true };
  } catch {
    return { state: freshState(), problem: true };
  }
}

function hasOldVersion(): boolean {
  try {
    return localStorage.getItem('dont-get-fooled-v1') !== null;
  } catch {
    return false;
  }
}

export function saveState(state: State) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    localStorage.removeItem('dont-get-fooled-v1');
  } catch {
    /* Storage is optional: the quiz still works, it just cannot resume. */
  }
}
