import { Course } from '../types';

const quantSection = (id: string) => ({
  id: `${id}-s1`,
  title: 'Section 01 — Quantitative Aptitude',
  lessons: [
  { id: `${id}-l1`, title: 'Percentage Basics', kind: 'video' as const, duration: '18:24', completed: true },
  { id: `${id}-l2`, title: 'Profit & Loss', kind: 'video' as const, duration: '24:10', completed: true },
  { id: `${id}-l3`, title: 'Time & Work', kind: 'video' as const, duration: '21:47' },
  { id: `${id}-l4`, title: 'Quantitative Formula Sheet', kind: 'pdf' as const }]

});

const reasoningSection = (id: string) => ({
  id: `${id}-s2`,
  title: 'Section 02 — Reasoning',
  lessons: [
  { id: `${id}-l5`, title: 'Series & Analogy', kind: 'video' as const, duration: '19:02', completed: true },
  { id: `${id}-l6`, title: 'Coding–Decoding', kind: 'video' as const, duration: '16:38' },
  { id: `${id}-l7`, title: 'Reasoning Practice Notes', kind: 'pdf' as const }]

});

const englishSection = (id: string) => ({
  id: `${id}-s3`,
  title: 'Section 03 — English Language',
  lessons: [
  { id: `${id}-l8`, title: 'Tenses Made Simple', kind: 'video' as const, duration: '22:15' },
  { id: `${id}-l9`, title: 'Vocabulary Builder', kind: 'video' as const, duration: '14:52' },
  { id: `${id}-l10`, title: 'Grammar Rules PDF', kind: 'pdf' as const }]

});

const gkSection = (id: string) => ({
  id: `${id}-s4`,
  title: 'Section 04 — General Awareness',
  lessons: [
  { id: `${id}-l11`, title: 'Indian Polity Overview', kind: 'video' as const, duration: '26:40' },
  { id: `${id}-l12`, title: 'Static GK Capsule', kind: 'pdf' as const }]

});

export const courses: Course[] = [
{
  id: 'ssc-cgl-complete',
  title: 'SSC CGL Complete Preparation',
  description:
  'A full-length, exam-ready program covering Quant, Reasoning, English and General Awareness with video classes, notes and practice tests.',
  exam: 'SSC',
  category: 'SSC CGL',
  instructor: 'Ankit Verma',
  thumbnail: "/4d323328-eefd-4d88-b6e0-3c69229d0613.jpg",
  type: 'paid',
  price: 1499,
  videos: 96,
  notes: 24,
  duration: '68 hours',
  lessons: 120,
  status: 'published',
  created: '12 Jun 2026',
  enrolled: true,
  progress: 64,
  completedLessons: 12,
  sections: [
  quantSection('ssc'),
  reasoningSection('ssc'),
  englishSection('ssc'),
  gkSection('ssc')]

},
{
  id: 'current-affairs-foundation',
  title: 'Current Affairs Foundation',
  description:
  'Build a strong current affairs base with daily capsules, monthly revision classes and MCQ practice for every major exam.',
  exam: 'All Exams',
  category: 'Current Affairs',
  instructor: 'Priya Nair',
  thumbnail: "/75fc3ed3-1fad-485c-be62-3afa61964e85.jpg",
  type: 'free',
  videos: 32,
  notes: 12,
  duration: '21 hours',
  lessons: 44,
  status: 'published',
  created: '02 Jul 2026',
  enrolled: true,
  progress: 28,
  completedLessons: 12,
  sections: [gkSection('ca'), reasoningSection('ca')]
},
{
  id: 'banking-po-2026',
  title: 'Banking PO & Clerk 2026',
  description:
  'Targeted preparation for IBPS and SBI exams with speed maths, data interpretation and banking awareness modules.',
  exam: 'Banking',
  category: 'IBPS PO',
  instructor: 'Rahul Mehta',
  thumbnail: "/da0d1ec9-2c01-493d-bd2d-065c02b51c05.jpg",
  type: 'paid',
  price: 1299,
  videos: 78,
  notes: 20,
  duration: '54 hours',
  lessons: 98,
  status: 'published',
  created: '28 May 2026',
  sections: [quantSection('bank'), reasoningSection('bank'), englishSection('bank')]
},
{
  id: 'reasoning-mastery',
  title: 'Reasoning & English Mastery',
  description:
  'Sharpen the two highest-scoring sections with concept classes, shortcut sheets and sectional tests.',
  exam: 'All Exams',
  category: 'Sectional',
  instructor: 'Sneha Kulkarni',
  thumbnail: "/2c9696c2-0423-4324-b722-a7dc22905f44.jpg",
  type: 'paid',
  price: 899,
  videos: 54,
  notes: 16,
  duration: '38 hours',
  lessons: 72,
  status: 'draft',
  created: '18 Aug 2026',
  sections: [reasoningSection('rm'), englishSection('rm')]
}];


export const categories = [
{ name: 'SSC', resources: 148, icon: 'FileText' },
{ name: 'Banking', resources: 122, icon: 'Landmark' },
{ name: 'Railway', resources: 96, icon: 'TrainFront' },
{ name: 'UPSC', resources: 84, icon: 'Scale' },
{ name: 'Defence', resources: 61, icon: 'Shield' },
{ name: 'Teaching', resources: 57, icon: 'GraduationCap' },
{ name: 'State Exams', resources: 73, icon: 'MapPin' }];


export const getCourse = (id: string) => courses.find((c) => c.id === id);