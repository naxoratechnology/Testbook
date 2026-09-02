import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  CheckCircle2Icon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FileTextIcon,
  ListIcon,
  PlayIcon,
  XIcon } from
'lucide-react';
import { getCourse } from '../data/courses';
import { Badge, btn } from '../components/ui/Primitives';
import { Logo } from '../components/layout/Logo';
import { buildPdf, useViewer } from '../contexts/ViewerContext';

export function VideoViewer() {
  const { courseId = '', lessonId = '' } = useParams();
  const course = getCourse(courseId);
  const navigate = useNavigate();
  const { openPdf } = useViewer();
  const [completed, setCompleted] = useState<string[]>([]);
  const [playlistOpen, setPlaylistOpen] = useState(false);

  const flat = useMemo(
    () =>
    course?.sections.flatMap((section) =>
    section.lessons.map((lesson) => ({ ...lesson, sectionTitle: section.title }))
    ) ?? [],
    [course]
  );

  if (!course) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <Link to="/courses" className={btn('primary', 'md')}>
          Back to courses
        </Link>
      </div>);

  }

  const index = Math.max(
    0,
    flat.findIndex((l) => l.id === lessonId)
  );
  const lesson = flat[index];
  const prev = flat[index - 1];
  const next = flat[index + 1];
  const isDone = lesson.completed || completed.includes(lesson.id);

  const playlist =
  <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-line px-4 py-3.5">
        <div>
          <p className="text-sm font-semibold text-ink">Course lessons</p>
          <p className="text-xs text-ink-muted">
            {flat.length} lessons · {course.duration}
          </p>
        </div>
        <button
        type="button"
        onClick={() => setPlaylistOpen(false)}
        aria-label="Close playlist"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted hover:bg-canvas lg:hidden">
        
          <XIcon className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {course.sections.map((section) =>
      <div key={section.id} className="mb-2">
            <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
              {section.title}
            </p>
            {section.lessons.map((l) => {
          const active = l.id === lesson.id;
          const done = l.completed || completed.includes(l.id);
          if (l.kind === 'pdf') {
            return (
              <button
                key={l.id}
                type="button"
                onClick={() =>
                openPdf(
                  buildPdf(l.title, `${course.title} · ${section.title}`, 'course', [
                  'Concept summary',
                  'Worked examples',
                  'Practice set']
                  )
                )
                }
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors duration-150 ease-smooth hover:bg-canvas">
                
                    <FileTextIcon className="h-4 w-4 shrink-0 text-red-500" />
                    <span className="min-w-0 flex-1 truncate text-[13px] text-ink-soft">{l.title}</span>
                    <span className="shrink-0 text-[11px] text-ink-muted">PDF</span>
                  </button>);

          }
          return (
            <Link
              key={l.id}
              to={`/learn/${course.id}/${l.id}`}
              onClick={() => setPlaylistOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors duration-150 ease-smooth ${
              active ? 'bg-brand-50' : 'hover:bg-canvas'}`
              }>
              
                  {done ?
              <CheckCircle2Icon className="h-4 w-4 shrink-0 text-emerald-500" /> :

              <PlayIcon className={`h-4 w-4 shrink-0 ${active ? 'text-brand-600' : 'text-ink-muted'}`} />
              }
                  <span
                className={`min-w-0 flex-1 truncate text-[13px] ${
                active ? 'font-semibold text-brand-800' : 'text-ink-soft'}`
                }>
                
                    {l.title}
                  </span>
                  <span className="shrink-0 text-[11px] tabular-nums text-ink-muted">{l.duration}</span>
                </Link>);

        })}
          </div>
      )}
      </div>
    </div>;


  return (
    <div className="flex min-h-screen w-full flex-col bg-canvas">
      <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-line bg-white px-4 sm:px-6">
        <Logo />
        <div className="ml-2 hidden min-w-0 border-l border-line pl-4 sm:block">
          <p className="truncate text-[13px] font-semibold text-ink">{course.title}</p>
          <p className="truncate text-xs text-ink-muted">{lesson.sectionTitle}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPlaylistOpen(true)}
            className={btn('secondary', 'sm', 'lg:hidden')}>
            
            <ListIcon className="h-4 w-4" /> Lessons
          </button>
          <Link to={`/courses/${course.id}`} className={btn('secondary', 'sm')}>
            Course page
          </Link>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl flex-1 gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[1.7fr_360px] lg:px-8">
        <div>
          <div className="overflow-hidden rounded-2xl bg-ink">
            <div className="relative flex aspect-video items-center justify-center">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#1e293b_0%,#0f172a_70%)]" />
              <button
                type="button"
                aria-label="Play lesson"
                className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-ink transition-transform duration-150 ease-smooth hover:scale-105">
                
                <PlayIcon className="ml-0.5 h-6 w-6" />
              </button>
              <div className="absolute inset-x-0 bottom-0 p-4">
                <div className="h-1 w-full rounded-full bg-white/25">
                  <div className="h-full w-1/3 rounded-full bg-brand-500" />
                </div>
                <div className="mt-2.5 flex items-center justify-between text-[11px] text-white/80">
                  <span className="tabular-nums">06:12 / {lesson.duration ?? '18:24'}</span>
                  <span>1080p · 1.0x</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-line bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <Badge tone="brand">{lesson.sectionTitle}</Badge>
                <h1 className="mt-2.5 text-xl font-bold tracking-tight text-ink">{lesson.title}</h1>
              </div>
              <button
                type="button"
                onClick={() => setCompleted((c) => c.includes(lesson.id) ? c : [...c, lesson.id])}
                className={btn(isDone ? 'secondary' : 'primary', 'md')}>
                
                {isDone ?
                <>
                    <CheckIcon className="h-4 w-4" /> Completed
                  </> :

                'Mark as completed'
                }
              </button>
            </div>
            <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">
              In this lesson we build the core method for {lesson.title.toLowerCase()}, starting from the base
              concept and moving into exam-level questions. Attempt the practice set in the section PDF right
              after watching to lock the approach in.
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
              <button
                type="button"
                disabled={!prev}
                onClick={() => prev && navigate(`/learn/${course.id}/${prev.id}`)}
                className={btn('secondary', 'md')}>
                
                <ChevronLeftIcon className="h-4 w-4" /> Previous lesson
              </button>
              <button
                type="button"
                disabled={!next}
                onClick={() => next && navigate(`/learn/${course.id}/${next.id}`)}
                className={btn('primary', 'md')}>
                
                Next lesson <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <aside className="hidden overflow-hidden rounded-2xl border border-line bg-white lg:block lg:h-[calc(100vh-6.5rem)] lg:sticky lg:top-[4.75rem]">
          {playlist}
        </aside>
      </div>

      {playlistOpen &&
      <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setPlaylistOpen(false)} />
          <div className="absolute inset-y-0 right-0 w-[86%] max-w-sm bg-white shadow-lift">{playlist}</div>
        </div>
      }
    </div>);

}