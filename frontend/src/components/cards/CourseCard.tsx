import React from 'react';
import { Link } from 'react-router-dom';
import { ClockIcon, FileTextIcon, PlayCircleIcon } from 'lucide-react';
import { Course } from '../../types';
import { Badge, Progress, btn } from '../ui/Primitives';

export function CourseCard({ course }: {course: Course;}) {
  const free = course.type === 'free';
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white transition-shadow duration-200 ease-smooth hover:shadow-soft">
      <div className="relative aspect-[16/9] overflow-hidden bg-canvas">
        <img
          src={course.thumbnail}
          alt=""
          className="h-full w-full object-cover transition-transform duration-300 ease-smooth group-hover:scale-[1.03]" />
        
        <span className="absolute left-3 top-3">
          <Badge tone={free ? 'green' : 'violet'}>{free ? 'Free' : 'Paid'}</Badge>
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-600">{course.exam}</p>
        <h3 className="mt-1.5 text-[15px] font-semibold leading-snug text-ink">
          <Link to={`/courses/${course.id}`} className="hover:text-brand-700">
            {course.title}
          </Link>
        </h3>
        <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-ink-soft">{course.description}</p>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink-soft">
          <span className="inline-flex items-center gap-1.5">
            <PlayCircleIcon className="h-3.5 w-3.5" /> {course.videos} videos
          </span>
          <span className="inline-flex items-center gap-1.5">
            <FileTextIcon className="h-3.5 w-3.5" /> {course.notes} notes
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ClockIcon className="h-3.5 w-3.5" /> {course.duration}
          </span>
        </div>

        <p className="mt-3 text-xs text-ink-muted">By {course.instructor}</p>

        {course.enrolled && typeof course.progress === 'number' &&
        <div className="mt-3">
            <div className="mb-1.5 flex justify-between text-xs">
              <span className="font-medium text-ink">{course.progress}% complete</span>
              <span className="text-ink-muted">
                {course.completedLessons} / {course.lessons} lessons
              </span>
            </div>
            <Progress value={course.progress} />
          </div>
        }

        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <span className="text-sm font-semibold text-ink">
            {free ? 'Free access' : `₹${course.price?.toLocaleString('en-IN')}`}
          </span>
          <Link to={`/courses/${course.id}`} className={btn(free ? 'primary' : 'secondary', 'sm')}>
            {free ? 'Start Learning' : 'View Course'}
          </Link>
        </div>
      </div>
    </article>);

}