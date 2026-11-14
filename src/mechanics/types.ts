import type { Exploration } from '../navigation';

export type MechanicProps = {
  ex: Exploration;
  set: (key: string, value: number) => void;
};
