import { TestQuestion } from '../types';

export const SECTIONS = ['Quantitative', 'Reasoning', 'English', 'GK'] as const;

const bank: Record<string, {text: string;options: string[];correct: number;explanation: string;}[]> = {
  Quantitative: [
  {
    text: 'What is 25% of 240?',
    options: ['40', '50', '60', '70'],
    correct: 2,
    explanation: '25% means one fourth. 240 ÷ 4 = 60. So 25% of 240 is 60.'
  },
  {
    text: 'A shopkeeper buys an article for ₹800 and sells it for ₹920. Find the profit percentage.',
    options: ['12%', '15%', '18%', '20%'],
    correct: 1,
    explanation: 'Profit = 920 − 800 = ₹120. Profit % = (120 / 800) × 100 = 15%.'
  },
  {
    text: 'If A can do a work in 12 days and B in 24 days, in how many days will both finish it together?',
    options: ['6 days', '8 days', '9 days', '10 days'],
    correct: 1,
    explanation: '1/12 + 1/24 = 3/24 = 1/8. Together they take 8 days.'
  },
  {
    text: 'The average of 5 consecutive even numbers is 26. What is the largest number?',
    options: ['28', '30', '32', '34'],
    correct: 1,
    explanation: 'The middle number is 26, so the numbers are 22, 24, 26, 28, 30. Largest = 30.'
  },
  {
    text: 'Simple interest on ₹5,000 at 8% per annum for 3 years is:',
    options: ['₹1,000', '₹1,200', '₹1,400', '₹1,600'],
    correct: 1,
    explanation: 'SI = P × R × T / 100 = 5000 × 8 × 3 / 100 = ₹1,200.'
  }],

  Reasoning: [
  {
    text: 'Find the next term in the series: 2, 6, 12, 20, 30, ?',
    options: ['38', '40', '42', '44'],
    correct: 2,
    explanation: 'Differences are 4, 6, 8, 10, so the next difference is 12. 30 + 12 = 42.'
  },
  {
    text: 'If FRIEND is coded as HTKGPF, how is CANDLE coded?',
    options: ['EDPFNG', 'ECPFNG', 'ECPFYG', 'EDPFYG'],
    correct: 1,
    explanation: 'Each letter moves two steps forward: C→E, A→C, N→P, D→F, L→N, E→G.'
  },
  {
    text: 'Pointing to a photo, Ravi said, "She is the daughter of my grandfather\'s only son." Who is she?',
    options: ['His sister', 'His cousin', 'His aunt', 'His niece'],
    correct: 0,
    explanation: "Grandfather's only son is Ravi's father, so his daughter is Ravi's sister."
  },
  {
    text: 'Choose the odd one out: Square, Rectangle, Triangle, Cube',
    options: ['Square', 'Rectangle', 'Triangle', 'Cube'],
    correct: 3,
    explanation: 'A cube is a three-dimensional solid; the rest are two-dimensional figures.'
  }],

  English: [
  {
    text: 'Choose the correct synonym of "ABUNDANT".',
    options: ['Scarce', 'Plentiful', 'Costly', 'Hidden'],
    correct: 1,
    explanation: 'Abundant means existing in large quantities, i.e. plentiful.'
  },
  {
    text: 'Fill in the blank: She has been working here ____ 2019.',
    options: ['for', 'from', 'since', 'during'],
    correct: 2,
    explanation: 'With a point of time in the present perfect continuous, "since" is used.'
  },
  {
    text: 'Identify the correctly spelt word.',
    options: ['Occurence', 'Occurrence', 'Ocurrence', 'Occurrance'],
    correct: 1,
    explanation: '"Occurrence" has double c, double r and ends with -ence.'
  },
  {
    text: 'Choose the one-word substitute: "A person who loves books".',
    options: ['Bibliophile', 'Bibliography', 'Philanthropist', 'Curator'],
    correct: 0,
    explanation: 'A bibliophile is a person who loves or collects books.'
  }],

  GK: [
  {
    text: 'Which article of the Indian Constitution deals with the Right to Equality?',
    options: ['Article 12', 'Article 14', 'Article 19', 'Article 21'],
    correct: 1,
    explanation: 'Article 14 guarantees equality before the law and equal protection of laws.'
  },
  {
    text: 'The Reserve Bank of India was established in which year?',
    options: ['1930', '1935', '1947', '1949'],
    correct: 1,
    explanation: 'The RBI was established on 1 April 1935 under the RBI Act, 1934.'
  },
  {
    text: 'Which is the longest river entirely within India?',
    options: ['Ganga', 'Godavari', 'Narmada', 'Krishna'],
    correct: 1,
    explanation: 'The Godavari is the longest river that flows entirely within Indian territory.'
  },
  {
    text: 'Who is known as the "Father of the Indian Space Programme"?',
    options: ['A.P.J. Abdul Kalam', 'Vikram Sarabhai', 'Homi Bhabha', 'Satish Dhawan'],
    correct: 1,
    explanation: 'Dr. Vikram Sarabhai is regarded as the father of the Indian space programme.'
  }]

};

export function buildQuestions(count: number, marks = 2, negative = 0.5): TestQuestion[] {
  const questions: TestQuestion[] = [];
  const per = Math.ceil(count / SECTIONS.length);
  SECTIONS.forEach((section) => {
    const pool = bank[section];
    for (let i = 0; i < per && questions.length < count; i++) {
      const src = pool[i % pool.length];
      questions.push({
        id: `q-${questions.length + 1}`,
        section,
        text: src.text,
        options: src.options,
        correct: src.correct,
        explanation: src.explanation,
        marks,
        negative
      });
    }
  });
  // Ensure the canonical demo question sits at position 12
  if (questions.length >= 12) {
    const idx = questions.findIndex((q) => q.text.startsWith('What is 25%'));
    if (idx > -1 && idx !== 11) {
      const tmp = questions[11];
      questions[11] = { ...questions[idx], id: tmp.id, section: tmp.section };
      questions[idx] = { ...tmp, id: questions[idx].id, section: questions[idx].section };
    }
  }
  return questions;
}

export const currentAffairsQuestions = buildQuestions(10, 1, 0);