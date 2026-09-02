import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  CheckCircle2Icon,
  ChevronDownIcon,
  ClockIcon,
  FileTextIcon,
  ListChecksIcon,
  LockIcon,
  PlayCircleIcon,
  UserIcon } from
'lucide-react';
import { getCourse } from '../data/courses';
import { PageShell, Panel } from '../components/ui/PageShell';
import { Badge, Progress, btn } from '../components/ui/Primitives';
import { buildPdf, useViewer } from '../contexts/ViewerContext';

export function CourseDetail() {
  const { courseId = '' } = useParams();
  const course = getCourse(courseId);
  const { openPdf } = useViewer();
  const [open, setOpen] = useState<string | null>(null);

  if (!course) {
    return (
      <PageShell title="Course not found" subtitle="This course may have been unpublished.">
        <Link to="/courses" className={btn('primary', 'md')}>
          Back to courses
        </Link>
      </PageShell>);

  }

  const free = course.type === 'free';
  const openSection = open ?? course.sections[0].id;

  return (
    <PageShell>
      <nav aria-label="Breadcrumb" className="mb-5 text-[13px] text-ink-muted">
        <Link to="/courses" className="hover:text-ink">
          Courses
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink-soft">{course.title}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[1.55fr_1fr] lg:items-start">
        <div>
          <div className="overflow-hidden rounded-2xl border border-line bg-white">
            <img src={course.thumbnail} alt="" className="aspect-[16/9] w-full object-cover" />
            <div className="p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="brand">{course.exam}</Badge>
                <Badge tone={free ? 'green' : 'violet'}>{free ? 'Free' : 'Paid'}</Badge>
              </div>
              <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink sm:text-3xl">{course.title}</h1>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{course.description}</p>
              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2.5 border-t border-line pt-5 text-[13px] text-ink-soft">
                <span className="inline-flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-ink-muted" /> {course.instructor}
                </span>
                <span className="inline-flex items-center gap-2">
                  <PlayCircleIcon className="h-4 w-4 text-ink-muted" /> {course.videos} video lessons
                </span>
                <span className="inline-flex items-center gap-2">
                  <FileTextIcon className="h-4 w-4 text-ink-muted" /> {course.notes} note PDFs
                </span>
                <span className="inline-flex items-center gap-2">
                  <ListChecksIcon className="h-4 w-4 text-ink-muted" /> Test series included
                </span>
                <span className="inline-flex items-center gap-2">
                  <ClockIcon className="h-4 w-4 text-ink-muted" /> {course.duration}
                </span>
              </div>
            </div>
          </div>

          <section className="mt-6">
            <h2 className="text-lg font-semibold text-ink">Course content</h2>
            <p className="mt-1 text-[13px] text-ink-muted">
              {course.sections.length} sections · {course.lessons} lessons · {course.duration}
            </p>
            <div className="mt-4 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
              {course.sections.map((section) => {
                const expanded = openSection === section.id;
                return (
                  <div key={section.id}>
                    <button
                      type="button"
                      onClick={() => setOpen(expanded ? '' : section.id)}
                      aria-expanded={expanded}
                      className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors duration-150 ease-smooth hover:bg-canvas sm:px-5">
                      
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-ink">{section.title}</span>
                        <span className="mt-0.5 block text-xs text-ink-muted">
                          {section.lessons.filter((l) => l.kind === 'video').length} videos ·{' '}
                          {section.lessons.filter((l) => l.kind === 'pdf').length} PDF
                        </span>
                      </span>
                      <ChevronDownIcon
                        className={`h-4 w-4 shrink-0 text-ink-muted transition-transform duration-200 ease-smooth ${
                        expanded ? 'rotate-180' : ''}`
                        } />
                      
                    </button>
                    {expanded &&
                    <ul className="border-t border-line bg-canvas/60 px-2 py-2">
                        {section.lessons.map((lesson) =>
                      <li key={lesson.id}>
                            {lesson.kind === 'video' ?
                        <Link
                          to={`/learn/${course.id}/${lesson.id}`}
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors duration-150 ease-smooth hover:bg-white">
                          
                                <PlayCircleIcon className="h-4 w-4 shrink-0 text-brand-600" />
                                <span className="min-w-0 flex-1 truncate text-[13.5px] text-ink">
                                  {lesson.title}
                                </span>
                                {lesson.completed &&
                          <CheckCircle2Icon className="h-4 w-4 shrink-0 text-emerald-500" />
                          }
                                <span className="shrink-0 text-xs tabular-nums text-ink-muted">
                                  {lesson.duration}
                                </span>
                              </Link> :

                        <button
                          type="button"
                          onClick={() =>
                          openPdf(
                            buildPdf(lesson.title, `${course.title} · ${section.title}`, 'course', [
                            'Concept summary',
                            'Worked examples',
                            'Shortcut techniques',
                            'Practice set']
                            )
                          )
                          }
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors duration-150 ease-smooth hover:bg-white">
                          
                                <FileTextIcon className="h-4 w-4 shrink-0 text-red-500" />
                                <span className="min-w-0 flex-1 truncate text-[13.5px] text-ink">
                                  {lesson.title}
                                </span>
                                <Badge tone="slate">PDF available</Badge>
                              </button>
                        }
                          </li>
                      )}
                      </ul>
                    }
                  </div>);

              })}
            </div>
          </section>
        </div>

        <div className="space-y-5 lg:sticky lg:top-24">
          <Panel>
            {free ?
            <p className="text-2xl font-bold text-ink">Free</p> :

            <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-ink">₹{course.price?.toLocaleString('en-IN')}</p>
                <p className="text-sm text-ink-muted line-through">₹{((course.price ?? 0) * 2).toLocaleString('en-IN')}</p>
              </div>
            }

            {course.enrolled ?
            <>
                <div className="mt-4">
                  <div className="mb-1.5 flex justify-between text-[13px]">
                    <span className="font-medium text-ink">{course.progress}% complete</span>
                    <span className="text-ink-muted">
                      {course.completedLessons} / {course.lessons}
                    </span>
                  </div>
                  <Progress value={course.progress ?? 0} />
                </div>
                <Link
                to={`/learn/${course.id}/${course.sections[0].lessons[2]?.id ?? course.sections[0].lessons[0].id}`}
                className={btn('primary', 'lg', 'mt-4 w-full')}>
                
                  Continue Learning
                </Link>
              </> :

            <Link
              to={`/learn/${course.id}/${course.sections[0].lessons[0].id}`}
              className={btn('primary', 'lg', 'mt-4 w-full')}>
              
                {free ? 'Start Learning' : 'Buy Course'}
              </Link>
            }

            <ul className="mt-5 space-y-2.5 border-t border-line pt-5 text-[13px] text-ink-soft">
              {[
              `${course.videos} video lessons`,
              `${course.notes} note PDFs (view only)`,
              'Full-length and sectional tests',
              'Lifetime access on web and mobile'].
              map((item) =>
              <li key={item} className="flex items-start gap-2.5">
                  <CheckCircle2Icon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  {item}
                </li>
              )}
            </ul>
          </Panel>

          <Panel>
            <h3 className="text-sm font-semibold text-ink">Included test series</h3>
            <Link
              to="/test-series/ssc-cgl-mock"
              className="mt-3 flex items-center gap-3 rounded-xl border border-line p-3.5 transition-colors duration-150 ease-smooth hover:bg-canvas">
              
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <ListChecksIcon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-semibold text-ink">SSC CGL Mock Test Series</span>
                <span className="block text-xs text-ink-muted">20 tests · 2,000 questions</span>
              </span>
            </Link>
            {!free &&
            <p className="mt-3 flex items-center gap-2 text-xs text-ink-muted">
                <LockIcon className="h-3.5 w-3.5" /> Unlocks with course purchase
              </p>
            }
          </Panel>
        </div>
      </div>
    </PageShell>);

}