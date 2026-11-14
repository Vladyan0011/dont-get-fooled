import { useState } from 'react';
import type { ComponentType } from 'react';
import type { Mechanic, Question } from '../content';
import type { Exploration } from '../navigation';
import { Crowd, Framing, Quote, Words } from './feeling';
import { Average, Risk, Scary, Size } from './numbers';
import { Anchor, Combo, Reviews, Timer } from './action';
import type { MechanicProps } from './types';

const mechanics: Record<Mechanic, ComponentType<MechanicProps>> = {
  words: Words, framing: Framing, quote: Quote, crowd: Crowd,
  risk: Risk, scary: Scary, average: Average, size: Size,
  timer: Timer, anchor: Anchor, reviews: Reviews, combo: Combo,
};

type Props = {
  q: Question;
  exploration?: Exploration;
  onExplore?: (key: string, value: number) => void;
  /** Review mode: the user can still play, but nothing is saved. */
  readOnly?: boolean;
};

export function Visual({ q, exploration = {}, onExplore = () => {}, readOnly = false }: Props) {
  const [local, setLocal] = useState<Exploration>(exploration);
  const ex = readOnly ? local : exploration;
  const set = (key: string, value: number) => (readOnly ? setLocal((old) => ({ ...old, [key]: value })) : onExplore(key, value));
  const Mechanic = mechanics[q.mechanic];
  return (
    <div className="artifact">
      <div className="artifact-top">
        <span>THE EVIDENCE</span>
        <span className="fiction">Fictional example — created for this quiz</span>
      </div>
      <div className="artifact-headline">{q.artifact}</div>
      <p className="task"><b>Try it:</b> {q.task}</p>
      <Mechanic ex={ex} set={set} />
    </div>
  );
}
