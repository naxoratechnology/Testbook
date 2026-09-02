import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpenIcon, SearchIcon } from 'lucide-react';
import { courses } from '../data/courses';
import { CourseCard } from '../components/cards/CourseCard';
import { PageShell } from '../components/ui/PageShell';
import { EmptyState, FilterChips, Select, btn, inputClass } from '../components/ui/Primitives';

const priceFilters = ['All', 'Free', 'Paid'];

export function Courses() {
  const [query, setQuery] = useState('');
  const [price, setPrice] = useState('All');
  const [exam, setExam] = useState('All exams');
  const [category, setCategory] = useState('All categories');

  const exams = ['All exams', ...Array.from(new Set(courses.map((c) => c.exam)))];
  const cats = ['All categories', ...Array.from(new Set(courses.map((c) => c.category)))];

  const filtered = useMemo(
    () =>
    courses.
    filter((c) => c.status === 'published' || c.enrolled).
    filter((c) => price === 'All' ? true : c.type === price.toLowerCase()).
    filter((c) => exam === 'All exams' ? true : c.exam === exam).
    filter((c) => category === 'All categories' ? true : c.category === category).
    filter((c) =>
    query.trim() ? (c.title + c.description + c.exam).toLowerCase().includes(query.toLowerCase()) : true
    ),
    [query, price, exam, category]
  );

  return (
    <PageShell title="Courses" subtitle="Structured video courses with notes and practice tests included.">
      <div className="mb-6 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search courses..."
              aria-label="Search courses"
              className={`${inputClass} pl-10`} />
            
          </div>
          <Select value={exam} onChange={(e) => setExam(e.target.value)} className="sm:w-44" aria-label="Filter by exam">
            {exams.map((e) =>
            <option key={e}>{e}</option>
            )}
          </Select>
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="sm:w-48"
            aria-label="Filter by category">
            
            {cats.map((c) =>
            <option key={c}>{c}</option>
            )}
          </Select>
        </div>
        <div className="flex items-center justify-between gap-3">
          <FilterChips options={priceFilters} value={price} onChange={setPrice} />
          <p className="shrink-0 text-[13px] text-ink-muted">{filtered.length} courses</p>
        </div>
      </div>

      {filtered.length === 0 ?
      <EmptyState
        icon={<BookOpenIcon className="h-5 w-5" />}
        title="No courses available yet."
        description="Try a different exam or clear your filters to see everything."
        action={
        <Link to="/test-series" className={btn('primary', 'md')}>
              Explore Test Series
            </Link>
        } /> :


      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((course) =>
        <CourseCard key={course.id} course={course} />
        )}
        </div>
      }
    </PageShell>);

}