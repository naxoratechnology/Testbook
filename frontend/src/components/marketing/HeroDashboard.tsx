import React from 'react';
import { CalendarDaysIcon, ClockIcon, PlayIcon, TrendingUpIcon } from 'lucide-react';
import { Progress } from '../ui/Primitives';

export function HeroDashboard() {
  return (
    <div className="relative">
      <div className="rounded-3xl border border-line bg-canvas p-3 shadow-lift sm:p-4">
        <div className="rounded-2xl bg-white p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-semibold text-ink">Good morning, Aarav</p>
              <p className="text-xs text-ink-muted">Continue your preparation today.</p>
            </div>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-xs font-bold text-white">
              AS
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-line p-3">
              <p className="text-[11px] text-ink-muted">Course progress</p>
              <p className="mt-1 text-lg font-bold text-ink">64%</p>
              <Progress value={64} className="mt-2" />
              <p className="mt-1.5 text-[11px] text-ink-muted">SSC CGL Complete Course</p>
            </div>
            <div className="rounded-xl border border-line p-3">
              <p className="text-[11px] text-ink-muted">Last test score</p>
              <p className="mt-1 text-lg font-bold text-ink">156 / 200</p>
              <div className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
                <TrendingUpIcon className="h-3.5 w-3.5" /> +14 vs last mock
              </div>
              <p className="mt-1.5 text-[11px] text-ink-muted">Mock Test 01</p>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-3 rounded-xl border border-line bg-canvas p-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
              <PlayIcon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-ink">Upcoming test — Mock Test 05</p>
              <p className="flex items-center gap-1.5 text-[11px] text-ink-muted">
                <ClockIcon className="h-3 w-3" /> 100 questions · 60 minutes
              </p>
            </div>
            <span className="rounded-lg bg-brand-600 px-2.5 py-1.5 text-[11px] font-semibold text-white">
              Start
            </span>
          </div>

          <div className="mt-3 grid grid-cols-[1fr_auto] items-center gap-3 rounded-xl border border-line p-3">
            <div className="flex items-center gap-2.5">
              <CalendarDaysIcon className="h-4 w-4 text-brand-600" />
              <div>
                <p className="text-[13px] font-semibold text-ink">Current affairs — 29 Aug</p>
                <p className="text-[11px] text-ink-muted">10 daily questions ready</p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-brand-600">Take test →</span>
          </div>

          <div className="mt-3 rounded-xl border border-line p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[11px] text-ink-muted">Study progress this week</p>
              <p className="text-[11px] font-semibold text-ink">9h 20m</p>
            </div>
            <div className="flex h-16 items-end gap-1.5">
              {[35, 55, 40, 75, 60, 90, 70].map((h, i) =>
              <div
                key={i}
                className={`flex-1 rounded-t ${i === 5 ? 'bg-brand-600' : 'bg-brand-100'}`}
                style={{ height: `${h}%` }} />

              )}
            </div>
            <div className="mt-1.5 flex justify-between text-[10px] text-ink-muted">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) =>
              <span key={i} className="flex-1 text-center">
                  {d}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>);

}