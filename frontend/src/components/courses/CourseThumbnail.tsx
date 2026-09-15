import { useEffect, useState } from 'react';
import { BookOpenIcon } from 'lucide-react';

export function CourseThumbnail({ src, alt, className = '' }: { src?: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  if (src && !failed) return <img src={src} alt={alt} onError={() => setFailed(true)} className={className} />;
  return <div role="img" aria-label={`${alt} course`} className={`${className} flex items-center justify-center bg-gradient-to-br from-brand-50 to-sky-100 text-brand-600`}><BookOpenIcon className="h-10 w-10" aria-hidden="true" /></div>;
}
