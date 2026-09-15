import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { ClockIcon, FileTextIcon, ListChecksIcon } from 'lucide-react';
import { PageShell } from '../components/ui/PageShell';
import { Badge, EmptyState, Select, btn } from '../components/ui/Primitives';
import { useViewer } from '../contexts/ViewerContext';
import { fetchPublicPreviousPapers } from '../services/previous-papers/previousPapers.slice';
import type { AppDispatch, RootState } from '../store';

export function PreviousPapers() {
  const dispatch = useDispatch<AppDispatch>(); const { openPdf } = useViewer(); const { publicItems, loading, error } = useSelector((state: RootState) => state.previousPapers);
  const [exam, setExam] = useState('All exams'); const [year, setYear] = useState('All years'); const [subject, setSubject] = useState('All subjects'); const [shift, setShift] = useState('All shifts');
  useEffect(() => { dispatch(fetchPublicPreviousPapers()); }, [dispatch]);
  const choices = { exams: ['All exams', ...new Set(publicItems.map((p) => p.exam))], years: ['All years', ...new Set(publicItems.map((p) => String(p.year)))], subjects: ['All subjects', ...new Set(publicItems.map((p) => p.subject))], shifts: ['All shifts', ...new Set(publicItems.map((p) => p.shift).filter(Boolean))] };
  const papers = useMemo(() => publicItems.filter((p) => (exam === 'All exams' || p.exam === exam) && (year === 'All years' || String(p.year) === year) && (subject === 'All subjects' || p.subject === subject) && (shift === 'All shifts' || p.shift === shift)), [publicItems, exam, year, subject, shift]);
  return <PageShell title="Previous Year Question Papers" subtitle="Read the original paper or attempt its online test.">
    <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Select value={exam} onChange={(e) => setExam(e.target.value)}>{choices.exams.map((v) => <option key={v}>{v}</option>)}</Select><Select value={year} onChange={(e) => setYear(e.target.value)}>{choices.years.map((v) => <option key={v}>{v}</option>)}</Select><Select value={subject} onChange={(e) => setSubject(e.target.value)}>{choices.subjects.map((v) => <option key={v}>{v}</option>)}</Select><Select value={shift} onChange={(e) => setShift(e.target.value)}>{choices.shifts.map((v) => <option key={v}>{v}</option>)}</Select></div>
    {error && <p className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    {loading ? <p className="py-12 text-center text-sm text-ink-muted">Loading previous papers...</p> : papers.length === 0 ? <EmptyState icon={<FileTextIcon className="h-5 w-5" />} title="No papers match these filters." description="Try a different exam, year, subject, or shift." /> : <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{papers.map((paper) => <li key={paper._id} className="flex h-full flex-col rounded-2xl border border-line bg-white p-5"><div className="flex justify-between gap-3"><div><p className="text-xs font-semibold uppercase text-brand-600">{paper.exam} · {paper.year}</p><h2 className="mt-2 font-semibold text-ink">{paper.title}</h2><p className="mt-1 text-xs text-ink-muted">{[paper.stage, paper.shift, paper.subject].filter(Boolean).join(' · ')}</p></div><Badge tone="slate">PDF</Badge></div>{paper.questions.length > 0 && <p className="mt-4 flex gap-4 rounded-xl bg-brand-50 p-3 text-xs text-brand-800"><span className="flex items-center gap-1"><ListChecksIcon className="h-3.5 w-3.5" />{paper.questions.length} questions</span>{paper.duration > 0 && <span className="flex items-center gap-1"><ClockIcon className="h-3.5 w-3.5" />{paper.duration} min</span>}</p>}<div className="mt-auto flex gap-2 pt-5"><button onClick={() => openPdf({ title: paper.title, subtitle: `${paper.exam} ${paper.year} · Previous year paper`, module: 'previous-paper', url: paper.pdfUrl, pages: [] })} className={btn('secondary', 'sm', 'flex-1')}>View Paper</button>{paper.questions.length > 0 && <Link to={`/previous-papers/${paper._id}/test`} className={btn('primary', 'sm', 'flex-1')}>Attempt Online</Link>}</div></li>)}</ul>}
  </PageShell>;
}
