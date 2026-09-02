import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckIcon, ImageIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { PageShell, Panel } from '../../components/ui/PageShell';
import { Badge, Button, Field, Input, Select, Textarea } from '../../components/ui/Primitives';
import { exams } from '../../data/content';
import { testSeriesList } from '../../data/testSeries';

interface Draft {
  id: string;
  text: string;
  options: string[];
  correct: number;
  explanation: string;
  marks: string;
  negative: string;
}

let seq = 1;
const blank = (): Draft => ({
  id: `d${seq++}`,
  text: '',
  options: ['', '', '', ''],
  correct: 0,
  explanation: '',
  marks: '2',
  negative: '0.5'
});

const steps = ['Test information', 'Questions', 'Publish'];

export function AdminTestBuilder() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [questions, setQuestions] = useState<Draft[]>([
  {
    id: 'd0',
    text: 'What is 25% of 240?',
    options: ['40', '50', '60', '70'],
    correct: 2,
    explanation: '25% means one fourth. 240 ÷ 4 = 60.',
    marks: '2',
    negative: '0.5'
  }]
  );

  const update = (id: string, patch: Partial<Draft>) =>
  setQuestions((qs) => qs.map((q) => q.id === id ? { ...q, ...patch } : q));

  return (
    <PageShell title="Test Builder" subtitle="Three steps: details, questions, publish." width="max-w-5xl">
      <ol className="mb-6 flex flex-wrap gap-2">
        {steps.map((label, i) =>
        <li key={label}>
            <button
            type="button"
            onClick={() => setStep(i)}
            className={`flex items-center gap-2.5 rounded-xl border px-4 py-2.5 text-[13px] font-medium transition-colors duration-150 ease-smooth ${
            step === i ? 'border-brand-600 bg-brand-50 text-brand-800' : 'border-line bg-white text-ink-soft'}`
            }>
            
              <span
              className={`flex h-6 w-6 items-center justify-center rounded-lg text-[11px] font-bold ${
              step > i ? 'bg-emerald-500 text-white' : step === i ? 'bg-brand-600 text-white' : 'bg-canvas text-ink-muted'}`
              }>
              
                {step > i ? <CheckIcon className="h-3.5 w-3.5" /> : i + 1}
              </span>
              {label}
            </button>
          </li>
        )}
      </ol>

      {step === 0 &&
      <Panel>
          <h2 className="text-base font-semibold text-ink">Test information</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Test name" className="sm:col-span-2">
              <Input placeholder="SSC CGL Mock Test 06" />
            </Field>
            <Field label="Exam">
              <Select>
                {exams.map((e) =>
              <option key={e}>{e}</option>
              )}
              </Select>
            </Field>
            <Field label="Test series">
              <Select>
                {testSeriesList.map((s) =>
              <option key={s.id}>{s.title}</option>
              )}
              </Select>
            </Field>
            <Field label="Duration (minutes)">
              <Input type="number" defaultValue={60} />
            </Field>
            <Field label="Total marks">
              <Input type="number" defaultValue={200} />
            </Field>
            <Field label="Negative marking" hint="Marks deducted per wrong answer">
              <Select defaultValue="0.5">
                <option value="0">No negative marking</option>
                <option value="0.25">0.25</option>
                <option value="0.5">0.5</option>
                <option value="1">1</option>
              </Select>
            </Field>
          </div>
          <div className="mt-5 flex justify-end">
            <Button onClick={() => setStep(1)}>Continue to questions</Button>
          </div>
        </Panel>
      }

      {step === 1 &&
      <div className="space-y-4">
          {questions.map((q, index) =>
        <Panel key={q.id}>
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-ink">Question {index + 1}</h2>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" type="button">
                    <ImageIcon className="h-4 w-4" /> Add image
                  </Button>
                  <button
                type="button"
                onClick={() => setQuestions((qs) => qs.filter((item) => item.id !== q.id))}
                aria-label="Delete question"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted transition-colors duration-150 ease-smooth hover:bg-red-50 hover:text-red-600">
                
                    <Trash2Icon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4 grid gap-4">
                <Field label="Question">
                  <Textarea
                rows={2}
                value={q.text}
                onChange={(e) => update(q.id, { text: e.target.value })}
                placeholder="Type the question..." />
              
                </Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  {q.options.map((option, i) =>
              <Field key={i} label={`Option ${String.fromCharCode(65 + i)}`}>
                      <div className="flex items-center gap-2">
                        <Input
                    value={option}
                    onChange={(e) =>
                    update(q.id, {
                      options: q.options.map((o, oi) => oi === i ? e.target.value : o)
                    })
                    } />
                  
                        <button
                    type="button"
                    onClick={() => update(q.id, { correct: i })}
                    aria-label={`Mark option ${String.fromCharCode(65 + i)} correct`}
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors duration-150 ease-smooth ${
                    q.correct === i ?
                    'border-emerald-500 bg-emerald-500 text-white' :
                    'border-line text-ink-muted hover:bg-canvas'}`
                    }>
                    
                          <CheckIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </Field>
              )}
                </div>
                <p className="text-[13px] text-ink-soft">
                  Correct answer: <Badge tone="green">{String.fromCharCode(65 + q.correct)}</Badge>
                </p>
                <Field label="Explanation" hint="Shown to students after submission">
                  <Textarea
                rows={2}
                value={q.explanation}
                onChange={(e) => update(q.id, { explanation: e.target.value })}
                placeholder="Explain the method step by step..." />
              
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Marks">
                    <Input value={q.marks} onChange={(e) => update(q.id, { marks: e.target.value })} />
                  </Field>
                  <Field label="Negative marks">
                    <Input value={q.negative} onChange={(e) => update(q.id, { negative: e.target.value })} />
                  </Field>
                </div>
              </div>
            </Panel>
        )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button variant="secondary" onClick={() => setQuestions((qs) => [...qs, blank()])}>
              <PlusIcon className="h-4 w-4" /> Add question
            </Button>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setStep(0)}>
                Back
              </Button>
              <Button onClick={() => setStep(2)}>Continue to publish</Button>
            </div>
          </div>
        </div>
      }

      {step === 2 &&
      <Panel>
          <h2 className="text-base font-semibold text-ink">Publish</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-3">
            {[
          ['Questions', String(questions.length)],
          ['Total marks', String(questions.length * 2)],
          ['Duration', '60 minutes']].
          map(([label, value]) =>
          <div key={label} className="rounded-xl border border-line px-4 py-3.5">
                <dt className="text-[11px] font-medium uppercase tracking-wider text-ink-muted">{label}</dt>
                <dd className="mt-1 text-lg font-bold text-ink">{value}</dd>
              </div>
          )}
          </dl>
          <p className="mt-5 rounded-xl bg-canvas px-4 py-3.5 text-[13px] text-ink-soft">
            Publishing makes this test visible to students inside its series and sends a notification if enabled.
          </p>
          <div className="mt-5 flex flex-wrap justify-end gap-2">
            <Button variant="secondary" onClick={() => navigate('/admin/test-series')}>
              Save Draft
            </Button>
            <Button variant="secondary" onClick={() => navigate('/test/ssc-cgl-mock-03')}>
              Preview
            </Button>
            <Button onClick={() => navigate('/admin/test-series')}>Publish</Button>
          </div>
        </Panel>
      }
    </PageShell>);

}