// All figures are fictional and were created for this quiz.
// Charts and tests read these arrays, so the picture and the explanation always use the same numbers.

export const visualData = {
  // Q01 — loaded words
  busTicket: { before: 40, after: 42 },

  // Q02 — framing
  yogurtFatGramsPer100g: 5,

  // Q03 — cropped quote
  mayorQuote: ['Some', 'people', 'say', 'the', 'new', 'bridge', 'is', 'a', 'disaster.', 'That', 'is', 'not', 'true:', 'it', 'is', 'safe,', 'but', 'it', 'is', 'two', 'months', 'late.'],
  mayorCrop: { start: 3, end: 8 },

  // Q05 — relative risk, cases per 1,000 people
  eyeRisk: { withoutPhone: 1, withPhone: 2, groupSize: 1000 },

  // Q06 — make it scary
  bikeThefts: [52, 49, 51, 47, 50, 48, 50, 49, 47, 46, 48, 53],
  months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],

  // Q07 — misleading average, monthly salaries in dollars
  cafeSalaries: [4500, 4700, 4800, 5000, 5000, 5000, 5200, 5300, 5500],
  billionaireSalary: 1_000_000,

  // Q08 — size trick, school budget in millions
  schoolBudget: { before: 1, after: 2 },

  // Q09 — fake urgency
  timerSeconds: 600,
  peopleWatching: [17, 23, 19, 31, 26],

  // Q10 — price anchor, price in rubles for 12 weeks
  headphonePrices: [3990, 3990, 3990, 3990, 3990, 3990, 3990, 3990, 3990, 3990, 12990, 3990],

  // Q11 — fake crowd, reviews per day for 30 days
  reviewsPerDay: [4, 6, 5, 3, 7, 5, 4, 6, 5, 4, 3, 6, 5, 7, 4, 5, 6, 3, 5, 4, 910, 940, 5, 4, 6, 3, 5, 4, 3, 3],
} as const;

export const percentChange = (from: number, to: number) => ((to - from) / from) * 100;

export const average = (values: readonly number[]) => values.reduce((sum, v) => sum + v, 0) / values.length;

export function median(values: readonly number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/** Q06: which months are visible for each period choice. */
export const periodStart = { year: 0, six: 6, two: 10 } as const;
export type Period = keyof typeof periodStart;
