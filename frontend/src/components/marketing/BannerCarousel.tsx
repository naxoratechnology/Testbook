import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bannersApi, type Banner } from '../../services/banners/banners.api';
const defaults: Banner[] = [
  { _id: 'default-1', title: 'Learn with confidence', subtitle: 'Structured courses, mock tests and notes for focused exam preparation.', thumbnail: '/banners/academy-study-group.png', buttonLabel: 'Explore Courses', buttonUrl: '/courses', placement: 'both', status: 'published', order: 1 },
  { _id: 'default-2', title: 'Practice. Improve. Succeed.', subtitle: 'Build exam confidence with realistic tests and detailed solutions.', thumbnail: '/banners/academy-focused-learning.png', buttonLabel: 'Take a Test', buttonUrl: '/test-series', placement: 'both', status: 'published', order: 2 },
  { _id: 'default-3', title: 'Your preparation, moving forward', subtitle: 'Everything you need for consistent learning in one academy.', thumbnail: '/banners/academy-success.png', buttonLabel: 'Start Learning', buttonUrl: '/courses', placement: 'both', status: 'published', order: 3 },
];
export function BannerCarousel({ placement }: { placement: 'home' | 'dashboard' }) {
  const [banners, setBanners] = useState<Banner[]>([]); const slides = banners.length ? banners : defaults; const [active, setActive] = useState(0);
  useEffect(() => { let current = true; const load = () => bannersApi.listPublic(placement).then(({ data }) => { if (current) setBanners(data.data.banners || []); }).catch(() => { if (current) setBanners([]); }); void load(); const timer = window.setInterval(load, 30000); window.addEventListener('focus', load); return () => { current = false; window.clearInterval(timer); window.removeEventListener('focus', load); }; }, [placement]);
  useEffect(() => { setActive(0); if (slides.length < 2) return; const timer = window.setInterval(() => setActive((value) => (value + 1) % slides.length), 6000); return () => window.clearInterval(timer); }, [slides.length]);
  return <section aria-label="Featured banners" className="relative aspect-[3/1] w-full overflow-hidden rounded-3xl bg-brand-900">
    {slides.map((slide, index) => <img key={slide._id} src={slide.thumbnail} alt={slide.title || `Banner ${index + 1}`} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-in-out motion-reduce:transition-none" style={{ transform: `translateX(${(index - active) * 100}%)` }} />)}
    {slides[active]?.showText && <div className="absolute bottom-12 left-4 z-10 max-w-[min(34rem,calc(100%-2rem))] rounded-2xl bg-slate-950/70 p-4 text-white shadow-lg backdrop-blur-sm sm:bottom-14 sm:left-8 sm:p-6">
      <h2 className="text-xl font-bold leading-tight sm:text-3xl">{slides[active].title}</h2>
      {slides[active].subtitle && <p className="mt-2 text-sm leading-5 text-white/90 sm:text-base">{slides[active].subtitle}</p>}
      {slides[active].buttonLabel && slides[active].buttonUrl && (slides[active].buttonUrl.startsWith('/')
        ? <Link to={slides[active].buttonUrl} className="mt-4 inline-flex rounded-lg bg-white px-4 py-2 text-sm font-semibold text-brand-900 hover:bg-brand-50">{slides[active].buttonLabel}</Link>
        : <a href={slides[active].buttonUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex rounded-lg bg-white px-4 py-2 text-sm font-semibold text-brand-900 hover:bg-brand-50">{slides[active].buttonLabel}</a>)}
    </div>}
    {slides.length > 1 && <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2 rounded-full bg-slate-950/25 px-3 py-2 backdrop-blur-sm">{slides.map((item, index) => <button key={item._id} type="button" aria-label={`Show banner ${index + 1}`} aria-current={active === index ? 'true' : undefined} onClick={() => setActive(index)} className={`h-2 rounded-full transition-all duration-300 ${active === index ? 'w-7 bg-white' : 'w-2 bg-white/60 hover:bg-white/85'}`} />)}</div>}
  </section>;
}
