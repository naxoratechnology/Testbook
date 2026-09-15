import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpenIcon, SearchIcon } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { CourseCard } from '../components/cards/CourseCard';
import { PageShell, Panel } from '../components/ui/PageShell';
import { EmptyState, FilterChips, Select, btn, inputClass } from '../components/ui/Primitives';
import { fetchPublicCourses } from '../services/courses/courses.slice';
import type { AdminCourse } from '../services/courses/courses.api';
import type { Course } from '../types';
import type { AppDispatch, RootState } from '../store';

const priceFilters = ['All', 'Free', 'Paid'];
const toCardCourse = (course: AdminCourse): Course => ({ id: course._id, title: course.title, description: course.description, exam: course.exam, category: course.category, instructor: course.instructor, thumbnail: course.thumbnail, type: course.access, price: course.price, videos: course.lectures.length, notes: course.lectures.filter((lecture) => Boolean(lecture.pdfUrl)).length, duration: `${course.lectures.length} lectures`, lessons: course.lectures.length, status: course.status, created: new Date(course.createdAt).toLocaleDateString('en-IN'), sections: [] });

export function Courses() {
  const dispatch = useDispatch<AppDispatch>(); const { publicItems, loading, error } = useSelector((state: RootState) => state.courses);
  const [query, setQuery] = useState(''); const [price, setPrice] = useState('All'); const [exam, setExam] = useState('All exams'); const [category, setCategory] = useState('All categories');
  useEffect(() => { dispatch(fetchPublicCourses()); }, [dispatch]);
  const exams = ['All exams', ...Array.from(new Set(publicItems.map((course) => course.exam)))]; const categories = ['All categories', ...Array.from(new Set(publicItems.map((course) => course.category)))];
  const filtered = useMemo(() => publicItems.filter((course) => price === 'All' || course.access === price.toLowerCase()).filter((course) => exam === 'All exams' || course.exam === exam).filter((course) => category === 'All categories' || course.category === category).filter((course) => !query.trim() || `${course.title} ${course.description} ${course.exam}`.toLowerCase().includes(query.toLowerCase())), [publicItems, query, price, exam, category]);
  return <PageShell title="Courses" subtitle="Structured video courses with lecture PDF notes."><div className="mb-6 space-y-3"><div className="flex flex-col gap-3 sm:flex-row"><div className="relative flex-1"><SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search courses..." className={`${inputClass} pl-10`} /></div><Select value={exam} onChange={(e) => setExam(e.target.value)} className="sm:w-44">{exams.map((item) => <option key={item}>{item}</option>)}</Select><Select value={category} onChange={(e) => setCategory(e.target.value)} className="sm:w-48">{categories.map((item) => <option key={item}>{item}</option>)}</Select></div><div className="flex items-center justify-between gap-3"><FilterChips options={priceFilters} value={price} onChange={setPrice} /><p className="text-[13px] text-ink-muted">{filtered.length} courses</p></div></div>
    {error && <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}{loading ? <Panel><p className="text-sm text-ink-muted">Loading courses...</p></Panel> : filtered.length === 0 ? <EmptyState icon={<BookOpenIcon className="h-5 w-5" />} title="No courses available yet." description="Try different filters or check again later." action={<Link to="/test-series" className={btn('primary', 'md')}>Explore Test Series</Link>} /> : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{filtered.map((course) => <CourseCard key={course._id} course={toCardCourse(course)} />)}</div>}
  </PageShell>;
}
