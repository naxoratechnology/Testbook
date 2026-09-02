import { Test, TestSeries } from '../types';

const makeTests = (prefix: string, count: number, questions = 100, duration = 60): Test[] =>
Array.from({ length: count }).map((_, i) => {
  const n = i + 1;
  const completed = n <= 2;
  return {
    id: `${prefix}-${String(n).padStart(2, '0')}`,
    title: `Mock Test ${String(n).padStart(2, '0')}`,
    questions,
    duration,
    marks: questions * 2,
    status: completed ? 'completed' : 'not-started',
    score: completed ? n === 1 ? 156 : 142 : undefined,
    kind: 'full'
  };
});

export const testSeriesList: TestSeries[] = [
{
  id: 'ssc-cgl-mock',
  title: 'SSC CGL Mock Test Series',
  description:
  'Full-length mocks built on the latest SSC CGL Tier 1 pattern, with detailed solutions and section-wise analysis after every attempt.',
  exam: 'SSC',
  type: 'paid',
  price: 499,
  tests: makeTests('ssc-cgl-mock', 20),
  totalQuestions: 2000,
  languages: 'Hindi + English',
  difficulty: 'Moderate',
  status: 'published',
  created: '10 Jun 2026',
  kind: 'full'
},
{
  id: 'banking-prelims',
  title: 'Banking Prelims Test Series',
  description:
  'Speed-focused prelims mocks for IBPS PO, Clerk and SBI with sectional timing and adaptive difficulty.',
  exam: 'Banking',
  type: 'paid',
  price: 399,
  tests: makeTests('banking-prelims', 15, 100, 60),
  totalQuestions: 1500,
  languages: 'Hindi + English',
  difficulty: 'Moderate',
  status: 'published',
  created: '22 Jun 2026',
  kind: 'full'
},
{
  id: 'quant-sectional',
  title: 'Quantitative Aptitude Sectional Tests',
  description: 'Topic-wise sectional drills to fix weak areas in arithmetic, algebra and data interpretation.',
  exam: 'All Exams',
  type: 'free',
  tests: makeTests('quant-sectional', 12, 25, 20),
  totalQuestions: 300,
  languages: 'English',
  difficulty: 'Easy',
  status: 'published',
  created: '01 Jul 2026',
  kind: 'sectional'
},
{
  id: 'daily-ca-series',
  title: 'Daily Current Affairs Tests',
  description: 'A new 10-question current affairs test every single day, with explanations from the daily capsule.',
  exam: 'All Exams',
  type: 'free',
  tests: makeTests('daily-ca-series', 30, 10, 10),
  totalQuestions: 300,
  languages: 'Hindi + English',
  difficulty: 'Easy',
  status: 'published',
  created: '01 Aug 2026',
  kind: 'current-affairs'
},
{
  id: 'pyq-series',
  title: 'SSC Previous Year Papers Series',
  description: 'Attempt real SSC papers from 2019–2025 in a live exam environment with original marking schemes.',
  exam: 'SSC',
  type: 'paid',
  price: 299,
  tests: makeTests('pyq-series', 18),
  totalQuestions: 1800,
  languages: 'Hindi + English',
  difficulty: 'Hard',
  status: 'published',
  created: '15 May 2026',
  kind: 'previous-year'
}];


export const getSeries = (id: string) => testSeriesList.find((s) => s.id === id);

export function findTest(testId: string) {
  for (const series of testSeriesList) {
    const test = series.tests.find((t) => t.id === testId);
    if (test) return { series, test };
  }
  return null;
}

export const recentResults = [
{ id: 'r1', test: 'SSC CGL Mock Test 02', score: '142 / 200', accuracy: '81%', date: '27 Aug 2026' },
{ id: 'r2', test: 'Daily Current Affairs — 26 Aug', score: '8 / 10', accuracy: '80%', date: '26 Aug 2026' },
{ id: 'r3', test: 'SSC CGL Mock Test 01', score: '156 / 200', accuracy: '86%', date: '24 Aug 2026' }];