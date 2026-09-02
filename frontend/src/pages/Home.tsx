import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRightIcon,
  BarChart3Icon,
  CalendarDaysIcon,
  FileTextIcon,
  GraduationCapIcon,
  LandmarkIcon,
  ListChecksIcon,
  MapPinIcon,
  NotebookTextIcon,
  PlayCircleIcon,
  ScaleIcon,
  ShieldIcon,
  TrainFrontIcon } from
'lucide-react';
import { categories, courses } from '../data/courses';
import { testSeriesList } from '../data/testSeries';
import { currentAffairs } from '../data/content';
import { CourseCard } from '../components/cards/CourseCard';
import { TestSeriesCard } from '../components/cards/TestSeriesCard';
import { Badge, SectionHeading, btn } from '../components/ui/Primitives';
import { useViewer, buildPdf } from '../contexts/ViewerContext';
import { HeroDashboard } from '../components/marketing/HeroDashboard';

const catIcons: Record<string, React.ElementType> = {
  FileText: FileTextIcon,
  Landmark: LandmarkIcon,
  TrainFront: TrainFrontIcon,
  Scale: ScaleIcon,
  Shield: ShieldIcon,
  GraduationCap: GraduationCapIcon,
  MapPin: MapPinIcon
};

export function Home() {
  const { openPdf } = useViewer();
  const today = currentAffairs[0];

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="border-b border-line bg-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:gap-14 lg:px-8 lg:py-20">
          <div>
            <Badge tone="brand">2026 exam-ready syllabus</Badge>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-[56px]">
              Prepare Smarter.
              <br />
              Learn Better.
              <br />
              <span className="text-brand-600">Score Higher.</span>
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-ink-soft sm:text-base">
              Courses, mock tests, notes, current affairs and previous year papers — everything you need for
              your exam preparation in one place.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/courses" className={btn('primary', 'lg')}>
                Explore Courses
              </Link>
              <Link to="/test-series/quant-sectional" className={btn('secondary', 'lg')}>
                Take a Free Test
              </Link>
            </div>
            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-6 border-t border-line pt-7">
              {[
              ['12,540+', 'Students'],
              ['320', 'Mock tests'],
              ['18,450', 'Questions']].
              map(([value, label]) =>
              <div key={label}>
                  <dt className="text-xl font-bold text-ink sm:text-2xl">{value}</dt>
                  <dd className="text-xs text-ink-soft sm:text-[13px]">{label}</dd>
                </div>
              )}
            </dl>
          </div>
          <HeroDashboard />
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <SectionHeading title="Popular categories" subtitle="Pick your exam and start with a focused path." />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat) => {
            const Icon = catIcons[cat.icon] ?? FileTextIcon;
            return (
              <Link
                key={cat.name}
                to="/courses"
                className="group flex items-center gap-3.5 rounded-2xl border border-line bg-white p-4 transition-colors duration-150 ease-smooth hover:border-brand-200 hover:bg-brand-50/40">
                
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-ink">{cat.name}</span>
                  <span className="block text-xs text-ink-muted">{cat.resources} resources</span>
                </span>
                <ArrowRightIcon className="h-4 w-4 shrink-0 text-ink-muted transition-transform duration-150 ease-smooth group-hover:translate-x-0.5 group-hover:text-brand-600" />
              </Link>);

          })}
        </div>
      </section>

      {/* Featured courses */}
      <section className="border-y border-line bg-canvas">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <SectionHeading
            title="Featured courses"
            subtitle="Video classes, notes and practice tests in a single track."
            action={
            <Link to="/courses" className={btn('secondary', 'sm')}>
                All courses <ArrowRightIcon className="h-4 w-4" />
              </Link>
            } />
          
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {courses.slice(0, 4).map((course) =>
            <CourseCard key={course.id} course={course} />
            )}
          </div>
        </div>
      </section>

      {/* Test series */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <SectionHeading
          title="Popular test series"
          subtitle="Real exam interface, instant analysis, detailed solutions."
          action={
          <Link to="/test-series" className={btn('secondary', 'sm')}>
              All test series <ArrowRightIcon className="h-4 w-4" />
            </Link>
          } />
        
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {testSeriesList.slice(0, 3).map((series) =>
          <TestSeriesCard key={series.id} series={series} />
          )}
        </div>
      </section>

      {/* Current affairs */}
      <section className="border-y border-line bg-canvas">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <SectionHeading title="Latest current affairs" subtitle="Updated every morning, with a daily test." />
          <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
            <div className="rounded-2xl border border-line bg-white p-5 sm:p-6">
              <div className="flex items-center gap-2">
                <CalendarDaysIcon className="h-4 w-4 text-brand-600" />
                <p className="text-sm font-semibold text-ink">{today.date}</p>
                <Badge tone="green" className="ml-auto">
                  Free
                </Badge>
              </div>
              <ul className="mt-4 space-y-2.5">
                {today.highlights.slice(0, 4).map((item) =>
                <li key={item} className="flex gap-2.5 text-[13.5px] leading-relaxed text-ink-soft">
                    <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                    {item}
                  </li>
                )}
              </ul>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
                <p className="text-[13px] text-ink-soft">
                  <span className="font-semibold text-ink">{today.questions} current affairs questions</span> ·{' '}
                  {today.minutes} minutes
                </p>
                <Link to="/current-affairs" className={btn('primary', 'sm')}>
                  Take Daily Test <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="flex flex-col rounded-2xl border border-line bg-white p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500">
                  <FileTextIcon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">Today's Current Affairs PDF</p>
                  <p className="text-xs text-ink-muted">{today.date} · 12 pages · View only</p>
                </div>
              </div>
              <div className="mt-5 flex-1 space-y-2 rounded-xl border border-line bg-canvas p-4">
                {[90, 70, 80, 60, 75].map((w, i) =>
                <div key={i} className="h-2 rounded bg-slate-200/70" style={{ width: `${w}%` }} />
                )}
              </div>
              <button
                type="button"
                onClick={() =>
                openPdf(
                  buildPdf(today.title, 'Current Affairs', 'current-affairs', [
                  'National Affairs',
                  'International Affairs',
                  'Economy & Banking',
                  'Science & Technology',
                  'Sports & Awards']
                  )
                )
                }
                className={btn('secondary', 'md', 'mt-4 w-full')}>
                
                Read PDF
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <SectionHeading title="Why PrepArena" subtitle="A simple loop: learn, practice, test, review." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
          { icon: PlayCircleIcon, title: 'Learn with Video', text: 'Concept-first classes taught by exam toppers and full-time faculty.' },
          { icon: ListChecksIcon, title: 'Practice with Tests', text: 'Full-length and sectional mocks in the real exam interface.' },
          { icon: NotebookTextIcon, title: 'Study with Notes', text: 'Curated PDF notes and formula sheets for quick revision.' },
          { icon: BarChart3Icon, title: 'Track Your Progress', text: 'Section-wise accuracy so you always know what to fix next.' }].
          map((item) =>
          <div key={item.title} className="rounded-2xl border border-line bg-white p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <item.icon className="h-5 w-5" />
              </span>
              <p className="mt-4 text-[15px] font-semibold text-ink">{item.title}</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">{item.text}</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-ink px-6 py-10 sm:px-10 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Start your preparation today
            </h2>
            <p className="mt-2 max-w-xl text-sm text-slate-300">
              Free current affairs, free sectional tests and a free foundation course — no payment needed to begin.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/register" className={btn('primary', 'lg')}>
              Start Learning
            </Link>
            <Link
              to="/test-series"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-700 px-6 text-[15px] font-medium text-white transition-colors duration-150 ease-smooth hover:bg-slate-800">
              
              Browse Test Series
            </Link>
          </div>
        </div>
      </section>
    </div>);

}
