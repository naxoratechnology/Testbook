import { AppNotification, CurrentAffairsDay, NoteDoc, PreviousPaper, Student, Syllabus } from '../types';

export const notes: NoteDoc[] = [
{
  id: 'quant-notes',
  title: 'Quantitative Aptitude Notes',
  exam: 'SSC CGL',
  subject: 'Quantitative Aptitude',
  topic: 'Arithmetic & Algebra',
  description: 'Formula sheets, solved examples and shortcut techniques for every arithmetic chapter.',
  pages: 86,
  status: 'published',
  created: '14 Jul 2026'
},
{
  id: 'reasoning-notes',
  title: 'Reasoning Notes',
  exam: 'Banking',
  subject: 'Reasoning',
  topic: 'Puzzles & Seating',
  description: 'Approach maps for puzzles, syllogism and coding–decoding with practice sets.',
  pages: 64,
  status: 'published',
  created: '19 Jul 2026'
},
{
  id: 'english-notes',
  title: 'English Grammar Notes',
  exam: 'SSC CGL',
  subject: 'English',
  topic: 'Grammar Rules',
  description: 'All 60 high-frequency grammar rules with error-spotting examples.',
  pages: 52,
  status: 'published',
  created: '02 Aug 2026'
},
{
  id: 'polity-notes',
  title: 'Indian Polity Notes',
  exam: 'UPSC',
  subject: 'General Studies',
  topic: 'Constitution',
  description: 'Constitutional framework, articles and amendments in a revision-friendly format.',
  pages: 118,
  status: 'draft',
  created: '21 Aug 2026'
}];


export const currentAffairs: CurrentAffairsDay[] = [
{
  id: 'ca-2026-08-29',
  date: '29 August 2026',
  isoDate: '2026-08-29',
  title: 'Daily Current Affairs — 29 August 2026',
  highlights: [
  'RBI keeps the repo rate unchanged at its August monetary policy review.',
  'India signs a renewable energy cooperation agreement with Japan.',
  'ISRO completes the second test flight of its reusable launch vehicle.',
  'National Sports Awards 2026 announced; 12 athletes honoured.',
  'Union Cabinet approves the new National Skilling Mission outlay.'],

  questions: 10,
  minutes: 10,
  status: 'published'
},
{
  id: 'ca-2026-08-28',
  date: '28 August 2026',
  isoDate: '2026-08-28',
  title: 'Daily Current Affairs — 28 August 2026',
  highlights: [
  'Parliament passes the Digital Competition Bill.',
  'India tops the Asian Para Athletics medal tally.',
  'New Ramsar site added in Tamil Nadu.'],

  questions: 10,
  minutes: 10,
  status: 'published',
  attempted: true,
  score: 8
},
{
  id: 'ca-2026-08-27',
  date: '27 August 2026',
  isoDate: '2026-08-27',
  title: 'Daily Current Affairs — 27 August 2026',
  highlights: [
  'GST collections cross a record monthly high.',
  'WHO releases its global immunisation report.',
  'India–EU trade talks enter the final round.'],

  questions: 10,
  minutes: 10,
  status: 'published',
  attempted: true,
  score: 7
},
{
  id: 'ca-2026-08-26',
  date: '26 August 2026',
  isoDate: '2026-08-26',
  title: 'Daily Current Affairs — 26 August 2026',
  highlights: [
  'Cabinet clears the semiconductor fab expansion.',
  'New chairperson appointed to the Finance Commission.',
  'Chandrayaan follow-up mission timeline announced.'],

  questions: 10,
  minutes: 10,
  status: 'published',
  attempted: true,
  score: 9
}];


export const syllabusList: Syllabus[] = [
{
  id: 'ssc-cgl-syllabus',
  exam: 'SSC CGL',
  title: 'SSC CGL Syllabus',
  description: 'Tier 1 and Tier 2 syllabus with the latest marking scheme and exam pattern.',
  updated: 'August 2026',
  status: 'published'
},
{
  id: 'ibps-po-syllabus',
  exam: 'IBPS PO',
  title: 'IBPS PO Syllabus',
  description: 'Prelims, mains and interview stage syllabus with sectional timings.',
  updated: 'July 2026',
  status: 'published'
},
{
  id: 'rrb-ntpc-syllabus',
  exam: 'RRB NTPC',
  title: 'RRB NTPC Syllabus',
  description: 'CBT 1 and CBT 2 topic list with negative marking rules.',
  updated: 'June 2026',
  status: 'published'
},
{
  id: 'upsc-syllabus',
  exam: 'UPSC CSE',
  title: 'UPSC CSE Syllabus',
  description: 'Prelims GS and CSAT plus mains optional subject syllabus.',
  updated: 'May 2026',
  status: 'draft'
}];


export const previousPapers: PreviousPaper[] = [
{
  id: 'ssc-cgl-2025-t1-s1',
  exam: 'SSC CGL',
  year: 2025,
  stage: 'Tier 1',
  shift: 'Shift 1',
  subject: 'All Subjects',
  title: 'SSC CGL 2025 — Tier 1',
  status: 'published',
  onlineTest: { id: 'pyq-ssc-2025-s1', questions: 100, duration: 60 }
},
{
  id: 'ssc-cgl-2025-t1-s2',
  exam: 'SSC CGL',
  year: 2025,
  stage: 'Tier 1',
  shift: 'Shift 2',
  subject: 'All Subjects',
  title: 'SSC CGL 2025 — Tier 1',
  status: 'published'
},
{
  id: 'ibps-po-2025-pre',
  exam: 'IBPS PO',
  year: 2025,
  stage: 'Prelims',
  shift: 'Shift 1',
  subject: 'All Subjects',
  title: 'IBPS PO 2025 — Prelims',
  status: 'published',
  onlineTest: { id: 'pyq-ibps-2025-s1', questions: 100, duration: 60 }
},
{
  id: 'rrb-ntpc-2024-cbt1',
  exam: 'RRB NTPC',
  year: 2024,
  stage: 'CBT 1',
  shift: 'Shift 3',
  subject: 'All Subjects',
  title: 'RRB NTPC 2024 — CBT 1',
  status: 'published'
},
{
  id: 'ssc-cgl-2024-t2',
  exam: 'SSC CGL',
  year: 2024,
  stage: 'Tier 2',
  shift: 'Shift 1',
  subject: 'Quantitative',
  title: 'SSC CGL 2024 — Tier 2',
  status: 'published'
}];


export const notifications: AppNotification[] = [
{
  id: 'n1',
  title: 'New Course Added',
  message: 'SSC CGL Complete Course is now available.',
  type: 'course',
  time: '25 minutes ago',
  read: false,
  href: '/courses/ssc-cgl-complete'
},
{
  id: 'n2',
  title: 'Daily Current Affairs',
  message: "Today's current affairs test is ready.",
  type: 'current-affairs',
  time: '2 hours ago',
  read: false,
  href: '/current-affairs'
},
{
  id: 'n3',
  title: 'New Test Series',
  message: 'New Banking Mock Test Series added.',
  type: 'test-series',
  time: 'Yesterday',
  read: false,
  href: '/test-series/banking-prelims'
},
{
  id: 'n4',
  title: 'New Notes',
  message: 'New Quantitative Aptitude notes are available.',
  type: 'notes',
  time: '2 days ago',
  read: true,
  href: '/notes'
},
{
  id: 'n5',
  title: 'Exam Announcement',
  message: 'SSC CGL 2026 Tier 1 admit cards will be released next week.',
  type: 'announcement',
  time: '4 days ago',
  read: true,
  href: '/notifications'
}];


export const students: Student[] = [
{ id: 's1', name: 'Aarav Sharma', email: 'aarav@example.com', targetExam: 'SSC CGL', courses: 3, attempts: 42, registered: '12 Mar 2026', active: true },
{ id: 's2', name: 'Ishita Rao', email: 'ishita@example.com', targetExam: 'IBPS PO', courses: 2, attempts: 28, registered: '04 Apr 2026', active: true },
{ id: 's3', name: 'Rohan Gupta', email: 'rohan@example.com', targetExam: 'RRB NTPC', courses: 1, attempts: 9, registered: '19 May 2026', active: false },
{ id: 's4', name: 'Meera Iyer', email: 'meera@example.com', targetExam: 'UPSC CSE', courses: 4, attempts: 65, registered: '02 Jun 2026', active: true },
{ id: 's5', name: 'Kabir Singh', email: 'kabir@example.com', targetExam: 'SSC CHSL', courses: 2, attempts: 15, registered: '23 Jul 2026', active: true },
{ id: 's6', name: 'Ananya Das', email: 'ananya@example.com', targetExam: 'CTET', courses: 1, attempts: 4, registered: '11 Aug 2026', active: true }];


export const adminActivity = [
{ id: 'a1', text: 'New student registered — Ananya Das', time: '8 min ago', type: 'student' as const },
{ id: 'a2', text: 'New course published — Banking PO & Clerk 2026', time: '1 hour ago', type: 'course' as const },
{ id: 'a3', text: 'Test completed — SSC CGL Mock Test 05 (312 attempts)', time: '3 hours ago', type: 'test' as const },
{ id: 'a4', text: 'New test series added — Daily Current Affairs Tests', time: 'Yesterday', type: 'series' as const },
{ id: 'a5', text: 'Syllabus updated — SSC CGL Syllabus (August 2026)', time: '2 days ago', type: 'syllabus' as const }];


export const exams = ['SSC', 'Banking', 'Railway', 'UPSC', 'Defence', 'Teaching', 'State Exams'];