import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRightIcon,
  BarChart3Icon,
  BookOpenIcon,
  CalendarDaysIcon,
  ClockIcon,
  ListChecksIcon,
  TargetIcon } from
'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { PageShell, Panel, StatCard } from '../components/ui/PageShell';
import { Badge, EmptyState, Progress, btn } from '../components/ui/Primitives';
import { courses } from '../data/courses';
import { recentResults, testSeriesList } from '../data/testSeries';
import { currentAffairs } from '../data/content';

export function Dashboard() {
  const { user } = useAuth();
  const enrolled = courses.filter((c) => c.enrolled);
  const today = currentAffairs[0];
  const recommended = testSeriesList[0].tests.find((t) => t.status !== 'completed');

  return (
    <PageShell
      title={`Good morning${user ? `, ${user.name.split(' ')[0]}` : ''} 👋`}
      subtitle="Continue your preparation today."
      actions={
      <Link to="/current-affairs" className={btn('secondary', 'md')}>
          <CalendarDaysIcon className="h-4 w-4" /> Today's current affairs
        </Link>
      }>
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Courses enrolled" value={String(enrolled.length)} hint="2 in progress" icon={<BookOpenIcon className="h-4 w-4" />} />
        <StatCard label="Tests attempted" value="18" hint="3 this week" icon={<ListChecksIcon className="h-4 w-4" />} />
        <StatCard label="Average score" value="78%" hint="+6% vs last month" icon={<TargetIcon className="h-4 w-4" />} />
        <StatCard label="Study progress" value="64%" hint="SSC CGL track" icon={<BarChart3Icon className="h-4 w-4" />} />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-5">
          <Panel>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-ink">Continue learning</h2>
              <Link to="/courses" className="text-[13px] font-medium text-brand-700 hover:underline">
                All courses
              </Link>
            </div>
            <div className="space-y-3">
              {enrolled.map((course) =>
              <div
                key={course.id}
                className="flex flex-col gap-4 rounded-xl border border-line p-4 sm:flex-row sm:items-center">
                
                  <img src={course.thumbnail} alt="" className="h-16 w-full rounded-lg object-cover sm:w-24" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink">{course.title}</p>
                    <div className="mt-2 flex items-center gap-3">
                      <Progress value={course.progress ?? 0} className="max-w-[220px]" />
                      <span className="text-xs font-semibold text-ink">{course.progress}%</span>
                    </div>
                    <p className="mt-1.5 text-xs text-ink-muted">
                      {course.completedLessons} / {course.lessons} lessons completed
                    </p>
                  </div>
                  <Link
                  to={`/learn/${course.id}/${course.sections[0].lessons[2]?.id ?? course.sections[0].lessons[0].id}`}
                  className={btn('primary', 'sm', 'shrink-0')}>
                  
                    Continue Course <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </div>
          </Panel>

          <Panel>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-ink">Recent results</h2>
              <Link to="/test-series" className="text-[13px] font-medium text-brand-700 hover:underline">
                View results
              </Link>
            </div>
            {recentResults.length === 0 ?
            <EmptyState
              icon={<ListChecksIcon className="h-5 w-5" />}
              title="No test results yet."
              description="Attempt your first mock to unlock section-wise analysis."
              action={
              <Link to="/test-series" className={btn('primary', 'md')}>
                    Take Your First Test
                  </Link>
              } /> :


            <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-sm">
                  <thead>
                    <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">
                      <th className="pb-2.5">Test</th>
                      <th className="pb-2.5">Score</th>
                      <th className="pb-2.5">Accuracy</th>
                      <th className="pb-2.5">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentResults.map((r) =>
                  <tr key={r.id} className="border-b border-line last:border-0">
                        <td className="py-3 pr-4 font-medium text-ink">{r.test}</td>
                        <td className="py-3 pr-4 tabular-nums text-ink-soft">{r.score}</td>
                        <td className="py-3 pr-4 tabular-nums text-ink-soft">{r.accuracy}</td>
                        <td className="py-3 text-ink-muted">{r.date}</td>
                      </tr>
                  )}
                  </tbody>
                </table>
              </div>
            }
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel>
            <h2 className="text-base font-semibold text-ink">Recommended test</h2>
            <div className="mt-4 rounded-xl border border-line p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-ink">
                  SSC CGL {recommended?.title ?? 'Mock Test 05'}
                </p>
                <Badge tone="brand">Recommended</Badge>
              </div>
              <p className="mt-2 flex items-center gap-3 text-xs text-ink-soft">
                <span className="inline-flex items-center gap-1.5">
                  <ListChecksIcon className="h-3.5 w-3.5" /> 100 questions
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ClockIcon className="h-3.5 w-3.5" /> 60 minutes
                </span>
              </p>
              <Link
                to={`/test/${recommended?.id ?? 'ssc-cgl-mock-05'}`}
                className={btn('primary', 'md', 'mt-4 w-full')}>
                
                Start Test
              </Link>
            </div>
          </Panel>

          <Panel>
            <h2 className="text-base font-semibold text-ink">Today's current affairs</h2>
            <p className="mt-1 text-xs text-ink-muted">{today.date}</p>
            <div className="mt-4 rounded-xl bg-brand-50 p-4">
              <p className="text-sm font-semibold text-brand-800">{today.questions} daily questions</p>
              <p className="mt-1 text-xs text-brand-700">{today.minutes} minutes · free for everyone</p>
              <Link to="/current-affairs" className={btn('primary', 'sm', 'mt-3.5 w-full')}>
                Take Test <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          </Panel>

          <Panel>
            <h2 className="text-base font-semibold text-ink">Section accuracy</h2>
            <ul className="mt-4 space-y-3.5">
              {[
              ['Quantitative', 82],
              ['Reasoning', 91],
              ['English', 76],
              ['General Awareness', 64]].
              map(([name, value]) =>
              <li key={name as string}>
                  <div className="mb-1.5 flex justify-between text-[13px]">
                    <span className="text-ink-soft">{name}</span>
                    <span className="font-semibold text-ink">{value}%</span>
                  </div>
                  <Progress value={value as number} />
                </li>
              )}
            </ul>
          </Panel>
        </div>
      </div>
    </PageShell>);

}