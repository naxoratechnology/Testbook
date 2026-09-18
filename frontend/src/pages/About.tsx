import { useEffect, useState } from 'react';
import { InstagramIcon, YoutubeIcon, MessageCircleIcon, SendIcon, UserIcon, MailIcon, PhoneIcon, MapPinIcon } from 'lucide-react';
import { PageShell, Panel } from '../components/ui/PageShell';
import { Button } from '../components/ui/Primitives';
import { settingsApiService } from '../services/settings/settings.api';
import type { AdminSettingsData } from '../services/settings/settings.api';

export function About() {
  const [content, setContent] = useState<(AdminSettingsData & { founderPhoto: string }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [failedPhoto, setFailedPhoto] = useState('');
  useEffect(() => {
    let active = true;
    setLoading(true); setError('');
    void settingsApiService.about().then(response => { if (active) setContent(response.data.data.content); })
      .catch(() => { if (active) setError('Unable to load academy details. Please try again.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [retry]);
  const socials = [
    { name: 'Instagram', url: content?.instagramUrl, Icon: InstagramIcon },
    { name: 'WhatsApp', url: content?.whatsappUrl, Icon: MessageCircleIcon },
    { name: 'Telegram', url: content?.telegramUrl, Icon: SendIcon },
    { name: 'YouTube', url: content?.youtubeUrl, Icon: YoutubeIcon },
  ];
  return <PageShell title="About" subtitle="Get to know Chandrabhaga Academy and contact our team.">
    {error && <Panel><p role="alert" className="text-sm text-red-600">{error}</p><Button className="mt-3" variant="secondary" onClick={() => { setRetry(value => value + 1); }}>Retry</Button></Panel>}
    {!content ? <p className="py-10 text-center text-ink-muted">{loading ? 'Loading academy details...' : 'Academy details are currently unavailable.'}</p> : <div className="space-y-6">
      <Panel><h2 className="text-2xl font-bold text-ink">{content.aboutTitle}</h2><p className="mt-5 whitespace-pre-line leading-8 text-ink-soft">{content.aboutDescription}</p></Panel>
      <Panel><h2 className="text-xl font-semibold text-ink">Contact us</h2><div className="mt-6 grid gap-6 lg:grid-cols-2">
        {(content.founderName || content.founderPhoto || content.founderEmail || content.founderPhone) && <div className="rounded-2xl border border-line p-5"><div className="flex flex-wrap items-center gap-4">{content.founderPhoto && failedPhoto !== content.founderPhoto ? <img src={content.founderPhoto} alt={content.founderName || 'Founder'} onError={() => setFailedPhoto(content.founderPhoto)} className="h-24 w-24 rounded-2xl object-cover" /> : <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-brand-50"><UserIcon className="h-12 w-12 text-brand-600" /></div>}<div><p className="text-sm text-ink-muted">Founder</p>{content.founderName && <h3 className="mt-1 text-lg font-semibold">{content.founderName}</h3>}</div></div><div className="mt-5 space-y-3">{content.founderPhone && <a className="flex items-center gap-3 text-sm text-brand-700" href={'tel:' + content.founderPhone}><PhoneIcon className="h-4 w-4 shrink-0" />{content.founderPhone}</a>}{content.founderEmail && <a className="flex items-center gap-3 break-all text-sm text-brand-700" href={'mailto:' + content.founderEmail}><MailIcon className="h-4 w-4 shrink-0" />{content.founderEmail}</a>}</div></div>}
        <div className="space-y-4">{content.contactEmail && <a className="flex items-center gap-3 break-all text-ink-soft" href={'mailto:' + content.contactEmail}><MailIcon className="h-5 w-5 shrink-0 text-brand-600" />{content.contactEmail}</a>}{content.contactPhone && <a className="flex items-center gap-3 text-ink-soft" href={'tel:' + content.contactPhone}><PhoneIcon className="h-5 w-5 shrink-0 text-brand-600" />{content.contactPhone}</a>}{content.contactAddress && <p className="flex items-start gap-3 whitespace-pre-line text-ink-soft"><MapPinIcon className="h-5 w-5 shrink-0 text-brand-600" />{content.contactAddress}</p>}<div className="flex flex-wrap gap-3">{socials.filter(item => typeof item.url === 'string' && /^https:\/\//i.test(item.url)).map(({ name, url, Icon }) => <a key={name} href={url} target="_blank" rel="noopener noreferrer" aria-label={name} title={name} className="flex h-11 w-11 items-center justify-center rounded-xl border border-line text-brand-600 hover:bg-brand-50"><Icon className="h-5 w-5" /></a>)}</div></div>
      </div></Panel>
    </div>}
  </PageShell>;
}
