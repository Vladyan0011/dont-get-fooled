// Quiz content. Edit text here; the UI reads everything from this file.
// Every example is fictional. `correct` is the zero-based index of the right option.

export type Mechanic =
  | 'words' | 'framing' | 'quote' | 'crowd'
  | 'risk' | 'scary' | 'average' | 'size'
  | 'timer' | 'anchor' | 'reviews' | 'combo';

export type Trick = {
  name: string;
  /** One sentence: how the trick works. */
  how: string;
  /** One sentence: what to do when you meet it. */
  defend: string;
};

export type Question = {
  id: string;
  level: 1 | 2 | 3;
  title: string;
  /** The post, ad or headline the user looks at. */
  artifact: string;
  /** What the user should try before answering. */
  task: string;
  prompt: string;
  options: [string, string, string, string];
  correct: number;
  /** Why each option is right or wrong, in the same order as `options`. */
  why: [string, string, string, string];
  feedback: string;
  trick: Trick;
  mechanic: Mechanic;
  /** Answering is locked until exploration[key] >= min. */
  gate?: { key: string; min: number; hint: string };
};

export const levels = [
  { name: 'The Feeling Trap', goal: 'Words and pictures that push your emotions.' },
  { name: 'The Number Trap', goal: 'True numbers, shown in a way that misleads.' },
  { name: 'The Action Trap', goal: 'Pressure that makes you buy, click or share — fast.' },
] as const;

export const questions: Question[] = [
  // ───────────── Level 1 — The Feeling Trap ─────────────
  {
    id: 'Q01', level: 1, mechanic: 'words',
    title: 'Same news, louder words',
    artifact: 'City news: bus tickets will cost more from March.',
    task: 'Be the editor. Change the words and watch the emotion meter.',
    prompt: 'You made the headline more emotional. What changed in the facts?',
    options: [
      'The price rise became bigger than it was before.',
      'Nothing. Only the words changed; the rise is still 5%.',
      'The headline became more accurate and more complete.',
      'The city gave the newspaper new information about prices.',
    ],
    correct: 1,
    why: [
      'The ticket still goes from 40 to 42 rubles. Only the feeling got bigger.',
      'Yes. The fact box never changed. Words like “skyrocket” add feeling, not information.',
      'Louder words make a headline less accurate, not more.',
      'No new facts were added. “SHOCKING” and “again” are opinions, not data.',
    ],
    feedback: 'Editors choose words. “Go up”, “jump” and “skyrocket” can describe the same 5% rise. Strong words make you angry or afraid before you start thinking.',
    trick: {
      name: 'Loaded words',
      how: 'Emotional words make a small fact feel like a big event.',
      defend: 'Say the headline again in calm words. Is it still big news?',
    },
    gate: { key: 'changes', min: 2, hint: 'Change at least two things in the headline first.' },
  },
  {
    id: 'Q02', level: 1, mechanic: 'framing',
    title: '95% or 5%?',
    artifact: 'Two yogurts on a shop shelf. Same size, same price.',
    task: 'Look at the labels. You can turn the packs around.',
    prompt: 'Which yogurt has less fat?',
    options: [
      'Yogurt A, because it is 95% fat-free.',
      'Yogurt B, because it is honest about the fat.',
      'They have the same amount of fat.',
      'We cannot compare two different labels.',
    ],
    correct: 2,
    why: [
      '“95% fat-free” sounds healthier, but it means 5% fat — the same as B.',
      'B is not lower in fat. Both have 5 g of fat in 100 g.',
      'Yes. 95% fat-free = 5% fat. The numbers are equal; only the frame is different.',
      'We can compare them: both labels describe 5% fat.',
    ],
    feedback: 'Positive words (“free”, “save”, “survive”) feel better than negative words (“contains”, “lose”, “die”), even when the numbers are the same. This is called framing.',
    trick: {
      name: 'Framing',
      how: 'The same number feels different when it is said in a positive or negative way.',
      defend: 'Flip the frame: say the number the other way and check if your feeling changes.',
    },
  },
  {
    id: 'Q03', level: 1, mechanic: 'quote',
    title: 'The missing words',
    artifact: 'Headline: Mayor Reed: “The new bridge is a disaster.”',
    task: 'Move the sliders to see more or fewer of the mayor’s words.',
    prompt: 'Every word in the headline is real. Is the headline fair?',
    options: [
      'Yes, because she really said every one of these words.',
      'No, the quote is completely fake.',
      'Yes, because headlines must be short.',
      'No: real words, but the cut changes the meaning.',
    ],
    correct: 3,
    why: [
      'She said the words, but as part of a sentence that means the opposite.',
      'The words are real. The problem is what was cut out.',
      'Short is fine. Changing the meaning is not.',
      'Yes. Without “Some people say” and “That is not true”, the quote says the opposite.',
    ],
    feedback: 'A cropped quote uses real words to tell a false story. The full sentence says the bridge is safe but late.',
    trick: {
      name: 'Cropped quote',
      how: 'Real words are cut out of a longer sentence, so the meaning changes.',
      defend: 'Find the full quote or the video before you trust a short one.',
    },
    gate: { key: 'full', min: 1, hint: 'Show the full quote first.' },
  },
  {
    id: 'Q04', level: 1, mechanic: 'crowd',
    title: 'How big is the crowd?',
    artifact: 'Post: “The square was FULL today! Everyone came to support us!”',
    task: 'Move the camera slider to zoom out.',
    prompt: 'What does the first photo really show?',
    options: [
      'A close-up can make a small group look like a crowd.',
      'The square was full of people who came to support them.',
      'The photo is fake: it was made by AI to trick people.',
      'Nobody came to the event at all.',
    ],
    correct: 0,
    why: [
      'Yes. The close-up shows only the busy part. The wide photo shows an almost empty square.',
      'The wide photo shows most of the square was empty.',
      'The photo is real. Only the frame was chosen carefully.',
      'Some people did come — about a hundred. That is a real group, just not a full square.',
    ],
    feedback: 'A camera shows only what is inside the frame. A close-up can make 100 people look like thousands, and a wide early-morning photo can make a big event look empty.',
    trick: {
      name: 'Camera angle',
      how: 'The photographer chooses what stays inside the frame and what stays outside.',
      defend: 'Ask what is outside the frame. Look for a wide photo or a real count.',
    },
    gate: { key: 'wide', min: 1, hint: 'Zoom all the way out first.' },
  },

  // ───────────── Level 2 — The Number Trap ─────────────
  {
    id: 'Q05', level: 2, mechanic: 'risk',
    title: 'Risk doubled!',
    artifact: 'Post: “Using your phone in bed DOUBLES the risk of a rare eye problem!”',
    task: 'Switch between the two views of the same study.',
    prompt: 'What is the most honest way to describe the result?',
    options: [
      'The risk went from 1 in 1,000 people to 2 in 1,000.',
      'Half of all people who use a phone in bed will get it.',
      'Using a phone in bed is completely safe.',
      '“Doubled” is false, so the study is fake.',
    ],
    correct: 0,
    why: [
      'Yes. This shows the real size: one extra case for every 1,000 people.',
      'No. 2 in 1,000 is 0.2%, not 50%.',
      'A small risk is still a risk. Small does not mean zero.',
      '“Doubled” is true: 1 to 2 is +100%. It is just not the whole story.',
    ],
    feedback: '1 → 2 is a real +100%. But it is only +0.1 percentage points: one more person in 1,000. Relative numbers (“doubled”) sound scary; absolute numbers (“1 → 2 in 1,000”) show the real size.',
    trick: {
      name: 'Relative risk',
      how: '“Doubled” or “+100%” hides that the starting number was tiny.',
      defend: 'Ask: how many people out of 100 or 1,000? Get the real numbers.',
    },
  },
  {
    id: 'Q06', level: 2, mechanic: 'scary',
    title: 'Make it scary',
    artifact: 'Bike thefts per month in Greenfield. Your job: make readers afraid.',
    task: 'Use the three controls. Try to reach the top of the drama meter.',
    prompt: 'You made the chart look scary. What did you change?',
    options: [
      'The number of bike thefts in some of the months.',
      'Only how it is shown: the scale, period and units.',
      'You added fake months to make the line go up.',
      'Nothing; the chart looked scary from the very start.',
    ],
    correct: 1,
    why: [
      'The numbers never changed. Look at the data table: it is the same.',
      'Yes. A zoomed axis, a short period and a percentage made “about the same” look like a surge.',
      'All twelve months are real data from the table. You only chose which to show.',
      'With the full year and a zero axis, the line is almost flat.',
    ],
    feedback: 'You never changed a single number. Over the year, thefts went from 52 to 53. Over one month, from 48 to 53 (+10%). A zoomed axis is sometimes useful, but together with a short period it can create a scary story.',
    trick: {
      name: 'Chart tricks',
      how: 'A zoomed axis, a hand-picked period or a percentage can make a small change look huge.',
      defend: 'Read the axis numbers and ask: why does the chart start here, and at this date?',
    },
    gate: { key: 'changes', min: 2, hint: 'Use at least two controls first.' },
  },
  {
    id: 'Q07', level: 2, mechanic: 'average',
    title: 'The average trick',
    artifact: 'Headline: “People in this café earn over $100,000 a month on average!”',
    task: 'Let the billionaire walk into the café.',
    prompt: 'Which sentence describes a typical person in the café?',
    options: [
      'A typical person in the café earns about $104,500 a month.',
      'Everyone in the café got richer when the billionaire came in.',
      'The average was calculated wrongly.',
      'Most earn about $5,000; one rich person pulls the average up.',
    ],
    correct: 3,
    why: [
      'Nine of ten people earn between $4,500 and $5,500. Nobody “typical” earns $104,500.',
      'Nobody’s salary changed. One new person came in.',
      'The calculation is correct. The average is just the wrong tool here.',
      'Yes. The median (the middle value) stays at $5,000. It describes typical people much better.',
    ],
    feedback: 'An average (mean) is easy to pull up or down with one extreme value. The median — the middle value — shows what a typical person has.',
    trick: {
      name: 'Misleading average',
      how: 'One extreme value can move the average far away from what is typical.',
      defend: 'Ask for the median or the typical value, not only the average.',
    },
    gate: { key: 'billionaire', min: 1, hint: 'Let the billionaire in first.' },
  },
  {
    id: 'Q08', level: 2, mechanic: 'size',
    title: 'Twice as big?',
    artifact: 'Poster: “We DOUBLED the money for schools!”',
    task: 'Switch between the poster picture and an honest picture.',
    prompt: 'The budget went from 1 to 2 million. Why does the poster look like a much bigger rise?',
    options: [
      'The budget really grew four times, and the poster shows it.',
      'Pictures can never show numbers.',
      'One icon is 2× wider and 2× taller, so it looks 4× bigger.',
      'The poster shows the wrong year.',
    ],
    correct: 2,
    why: [
      'It grew from 1 to 2 million: two times, not four.',
      'Pictures can show numbers honestly — if only one side grows.',
      'Yes. 2 × wider and 2 × taller = 4 × more area. Our eyes compare area.',
      'The years are fine. The problem is the size of the picture.',
    ],
    feedback: 'When a picture grows in both directions, its area grows much faster than the number. Honest charts change only one side, like the length of a bar.',
    trick: {
      name: 'Size trick',
      how: 'An icon grows in width and height, so a 2× change looks like 4×.',
      defend: 'Ignore the picture size. Read the numbers and compare them yourself.',
    },
  },

  // ───────────── Level 3 — The Action Trap ─────────────
  {
    id: 'Q09', level: 3, mechanic: 'timer',
    title: 'Hurry! Only 2 left',
    artifact: 'An online shop page for wireless headphones.',
    task: 'Watch the timer. Then try reloading the page.',
    prompt: 'What is the shop trying to do?',
    options: [
      'Help you save as much money as possible on headphones.',
      'Make you buy fast, before you compare prices or think.',
      'Show the real number of headphones in stock.',
      'Nothing; online timers are always real.',
    ],
    correct: 1,
    why: [
      'If the deal were real, the timer would not restart.',
      'Yes. The timer restarts and “only 2 left” never changes. The pressure is fake.',
      '“Only 2 left” stayed the same after every reload.',
      'This timer restarted every time. Some timers are real, but you should check.',
    ],
    feedback: 'Timers and “only 2 left” create urgency and scarcity. When we feel time pressure, we think less and compare less.',
    trick: {
      name: 'Fake urgency',
      how: 'A timer or “only 2 left” makes you hurry, so you stop comparing.',
      defend: 'Close the page for ten minutes. A real deal will still be there.',
    },
    gate: { key: 'reloads', min: 1, hint: 'Reload the page at least once first.' },
  },
  {
    id: 'Q10', level: 3, mechanic: 'anchor',
    title: 'Was 12,990, now 3,990!',
    artifact: 'Price tag: “Was 12,990 ₽ — now 3,990 ₽. You save 70%!”',
    task: 'You can open the price history before you decide.',
    prompt: 'Is this a good deal?',
    options: [
      'Yes, you save 9,000 rubles compared with the old price.',
      'Yes, because −70% is a very big discount.',
      'No, the headphones are probably fake.',
      'No: the “old price” lasted one week; 3,990 ₽ is normal.',
    ],
    correct: 3,
    why: [
      'You save nothing: it cost 3,990 ₽ for ten weeks before the “sale”.',
      'The discount is from a price that existed for only one week.',
      'Nothing shows the product is fake. The problem is the price story.',
      'Yes. The high “old price” is an anchor that makes the normal price look cheap.',
    ],
    feedback: 'The first number you see becomes an anchor. A high “old price” makes any lower price feel like a win, even if it is the normal price.',
    trick: {
      name: 'Price anchor',
      how: 'A high first number makes the next number feel small and cheap.',
      defend: 'Check the price history or other shops, not the crossed-out price.',
    },
  },
  {
    id: 'Q11', level: 3, mechanic: 'reviews',
    title: '4.9 stars from 1,980 reviews',
    artifact: 'SmartSleep pillow ★★★★★ 4.9 — “Everyone loves it!”',
    task: 'You can sort the reviews by date.',
    prompt: 'What is the best conclusion?',
    options: [
      '1,850 reviews in two days, all alike: the rating may be fake.',
      'Almost 2,000 people can’t be wrong, so it is safe to buy it.',
      'All online reviews are fake.',
      'The pillow must be dangerous.',
    ],
    correct: 0,
    why: [
      'Yes. 1,850 reviews in two days, all very short and similar, is a warning sign.',
      'Big numbers create social proof. But many reviews may come from the same source.',
      'Many reviews are real. Look for patterns, not for a reason to distrust everything.',
      'Fake reviews tell us about the marketing, not about danger.',
    ],
    feedback: 'We follow the crowd: “so many people like it” feels like proof. Bought or fake reviews often come in a short burst and sound the same.',
    trick: {
      name: 'Fake crowd',
      how: 'Big numbers of likes, reviews or signatures make you think “everyone agrees”.',
      defend: 'Look at the dates and the text of reviews. Read the low ratings too.',
    },
  },
  {
    id: 'Q12', level: 3, mechanic: 'combo',
    title: 'The family chat',
    artifact: 'A message forwarded many times in your family chat.',
    task: 'Tap the parts that try to push you. Find at least three tricks.',
    prompt: 'What is the best first step?',
    options: [
      'Share it with everyone in the chat. Better safe than sorry.',
      'Buy the filter today, just in case the water is dangerous.',
      'Pause: it sells a filter. Check reliable sources first.',
      'Reply that everyone who believes this message is stupid.',
    ],
    correct: 2,
    why: [
      'Sharing in panic is exactly what the message wants.',
      'The message is an advertisement. Fear is used to sell the filter.',
      'Yes. Stop, see who benefits, then check the city water service and independent news.',
      'Insults make people defend the message. Calm questions work better.',
    ],
    feedback: 'Manipulative messages often mix many tricks: fear, a secret, a personal story, a made-up number, “us vs them”, urgency and a call to buy or share. The more tricks, the more reason to pause.',
    trick: {
      name: 'The combo',
      how: 'Fear, secrets, urgency and “us vs them” work together to make you act fast.',
      defend: 'Ask: what does this message want me to do, and who benefits?',
    },
    gate: { key: 'found', min: 3, hint: 'Find at least three tricks in the message first.' },
  },
];

/** Q12: parts of the chat message. Parts with `trick` can be tapped. */
export const comboMessage: { text: string; trick?: string }[] = [
  { text: '⚠️ URGENT!!!', trick: 'Fear and urgency' },
  { text: ' ' },
  { text: 'Doctors are HIDING this from you!', trick: 'A “secret” — fake authority' },
  { text: ' ' },
  { text: 'My neighbour’s son got sick after drinking tap water.', trick: 'One personal story, not evidence' },
  { text: ' ' },
  { text: '9 out of 10 people don’t know the truth.', trick: 'A number with no source' },
  { text: ' ' },
  { text: 'Real parents protect their kids — only fools trust the city.', trick: 'Us vs them' },
  { text: ' ' },
  { text: 'Buy CleanDrop filters TODAY, −50%!', trick: 'It sells something' },
  { text: ' ' },
  { text: 'Share before they DELETE this!', trick: 'Pressure to share' },
];

export const stopChecklist = [
  { letter: 'S', title: 'Spot the feeling', text: 'What does this post want me to feel?' },
  { letter: 'T', title: 'Think: who benefits?', text: 'What does it want me to buy, believe or share?' },
  { letter: 'O', title: 'Open the full picture', text: 'What numbers, words or context are missing?' },
  { letter: 'P', title: 'Pause before you act', text: 'Wait, check another source, then decide.' },
] as const;

export function validateContent() {
  const ids = new Set<string>();
  for (const q of questions) {
    if (ids.has(q.id)) throw new Error(`Duplicate id ${q.id}`);
    ids.add(q.id);
    if (q.options.length !== 4 || new Set(q.options).size !== 4) throw new Error(`${q.id}: need four unique options`);
    if (q.why.length !== 4) throw new Error(`${q.id}: need four explanations`);
    if (!Number.isInteger(q.correct) || q.correct < 0 || q.correct > 3) throw new Error(`${q.id}: bad correct index`);
    if (!q.feedback || !q.trick.name || !q.trick.defend) throw new Error(`${q.id}: missing feedback`);
  }
  for (const level of [1, 2, 3]) {
    if (questions.filter((q) => q.level === level).length !== 4) throw new Error(`Level ${level} needs four questions`);
  }
}
