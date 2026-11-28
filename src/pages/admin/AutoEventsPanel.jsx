import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage } from '../../api/client';
import { getAutoEvents, setAutoEventHidden, syncAutoEvents } from '../../api/adminApi';
import PlatformBadge from '../../components/PlatformBadge';
import { RefreshCw } from 'lucide-react';
import { ErrorBox, LoadingRow, PANEL, Pill } from './ui';
import { formatAgo, formatDateTime, formatDuration } from './format';
import { useTranslation, Trans } from 'react-i18next';
import i18n from '../../i18n';

// Sự kiện của các sàn tự đăng (CellphoneS, HACOM, GearVN): xem, đồng bộ ngay, ẩn / hiện
export default function AutoEventsPanel() {
  const { t } = useTranslation();
  const [platforms, setPlatforms] = useState(null);
  const [error, setError] = useState(null);
  const [syncing, setSyncing] = useState({}); // { HACOM: true }
  const [busyEventId, setBusyEventId] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setPlatforms(await getAutoEvents());
    } catch (err) {
      console.error(err);
      setError(err.response ? getErrorMessage(err, i18n.t('Failed to load events.')) : i18n.t('Unable to connect to the backend server!'));
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const replacePlatform = (updated) =>
    setPlatforms(prev => prev.map(p => (p.platform === updated.platform ? updated : p)));

  const handleSync = async (platform) => {
    setSyncing(prev => ({ ...prev, [platform]: true }));
    try {
      const updated = await syncAutoEvents(platform);
      replacePlatform(updated);
      if (updated.lastSync && !updated.lastSync.success) alert(`⚠️ ${platform}: ${t('{{error}} – existing events were kept.', { error: updated.lastSync.error ?? t('Sync failed') })}`);
    } catch (err) {
      console.error(err);
      alert(err.response ? t('Error: {{message}}', { message: getErrorMessage(err, t('Sync failed')) }) : t('Unable to connect to the backend server!'));
    } finally {
      setSyncing(prev => ({ ...prev, [platform]: false }));
    }
  };

  const handleToggleHidden = async (platform, evt) => {
    if (!evt.isHiddenByAdmin && !window.confirm(t('Hide "{{title}}" from users? It stays hidden after future syncs until you show it again.', { title: evt.title }))) return;

    setBusyEventId(evt.eventId);
    try {
      const updated = await setAutoEventHidden(evt.eventId, !evt.isHiddenByAdmin);
      setPlatforms(prev => prev.map(p => (p.platform !== platform ? p : {
        ...p,
        events: p.events.map(e => (e.eventId === updated.eventId ? updated : e)),
      })));
    } catch (err) {
      console.error(err);
      alert(err.response ? t('Error: {{message}}', { message: getErrorMessage(err, t('Request failed')) }) : t('Unable to connect to the backend server!'));
    } finally {
      setBusyEventId(null);
    }
  };

  if (error && !platforms) return <ErrorBox message={error} onRetry={load} />;
  if (!platforms) return <LoadingRow />;

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-500">
        <Trans i18nKey="These platforms publish events automatically (job every 15 minutes). Use <b>Sync now</b> to refresh one platform immediately, or <b>Hide</b> an event you don't want users to see." components={{ b: <b /> }} />
      </p>

      {platforms.map(p => (
        <section key={p.platform} className={`${PANEL} overflow-hidden`}>
          <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <PlatformBadge platform={p.platform} />
              <span className="text-base font-semibold text-slate-900">{t("{{count}} events", { count: p.events.length })}</span>
              <SyncStatus status={p.lastSync} />
            </div>
            <button
              onClick={() => handleSync(p.platform)}
              disabled={syncing[p.platform]}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw size={15} className={syncing[p.platform] ? 'animate-spin' : ''} aria-hidden="true" />
              {syncing[p.platform] ? t('Syncing…') : t('Sync now')}
            </button>
          </div>

          {p.events.length === 0 ? (
            <LoadingRow text={t("No events stored for this platform.")} />
          ) : (
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <th className="p-4 font-semibold">{t("Image")}</th>
                  <th className="p-4 font-semibold">{t("Event")}</th>
                  <th className="p-4 font-semibold text-center">{t("Products")}</th>
                  <th className="p-4 font-semibold text-center">{t("Ends")}</th>
                  <th className="p-4 font-semibold text-center">{t("Status")}</th>
                  <th className="p-4 font-semibold text-center">{t("Action")}</th>
                </tr>
              </thead>
              <tbody>
                {p.events.map(evt => {
                  const expired = evt.endsAt && new Date(evt.endsAt) <= new Date();
                  return (
                    <tr key={evt.eventId} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                      <td className="p-4"><EventImage evt={evt} /></td>
                      <td className="p-4">
                        <p className="text-slate-900 font-medium mb-1">{evt.title}</p>
                        <a href={evt.eventLink} target="_blank" rel="noreferrer" className="text-sky-700 hover:underline text-xs truncate block max-w-xs">{evt.eventLink}</a>
                      </td>
                      <td className="p-4 text-center text-slate-700 tabular-nums" title={t("From cache (empty after a server restart until the next sync)")}>
                        {evt.productCount ?? '—'}
                      </td>
                      <td className="p-4 text-center text-slate-700 whitespace-nowrap" title={evt.endsAtIsExact ? t('Exact end time from the platform') : t('Rolling expiry, extended on every sync')}>
                        {formatDateTime(evt.endsAt)}{!evt.endsAtIsExact && evt.endsAt ? ' *' : ''}
                      </td>
                      <td className="p-4 text-center">
                        {expired ? <Pill>{t("Expired")}</Pill>
                          : evt.isHiddenByAdmin ? <Pill tone="bad">{t("Hidden by admin")}</Pill>
                          : evt.isPublished ? <Pill tone="good">{t("Live")}</Pill>
                          : <Pill tone="warn">{t("Not published")}</Pill>}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleToggleHidden(p.platform, evt)}
                          disabled={busyEventId === evt.eventId}
                          className={`px-3.5 py-1.5 rounded-lg text-sm font-medium border transition-colors disabled:opacity-50 ${evt.isHiddenByAdmin
                            ? 'border-slate-300 text-slate-700 hover:bg-slate-50'
                            : 'border-rose-200 text-rose-700 hover:bg-rose-50'}`}
                        >
                          {evt.isHiddenByAdmin ? t('Show') : t('Hide')}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>
      ))}
      <p className="text-xs text-slate-500">{t("* Rolling expiry: the platform gives no end time, so the event lives 6 hours after it was last seen.")}</p>
    </div>
  );
}

function SyncStatus({ status }) {
  const { t } = useTranslation();
  if (!status) return <Pill title={t("No sync since the server started")}>{t("Not synced yet")}</Pill>;
  const text = `${formatAgo(status.runAt)} · ${formatDuration(status.durationMs)}`;
  return status.success
    ? <Pill tone="good" title={t("Found {{found}}, showing {{shown}}, removed {{removed}}", { found: status.eventsFound, shown: status.eventsShown, removed: status.eventsRemoved })}>{t("Synced {{when}}", { when: text })}</Pill>
    : <Pill tone="bad" title={status.error}>{t("Sync failed {{when}}", { when: text })}</Pill>;
}

// Banner nếu có; không có banner thì ghép ảnh sản phẩm (giống trang Events của người dùng)
function EventImage({ evt }) {
  const previews = evt.previewImageUrls ?? [];
  if (previews.length >= 2) {
    return (
      <div className="grid grid-cols-2 w-16 h-16 rounded-lg overflow-hidden border border-slate-200 bg-white">
        {previews.slice(0, 4).map(url => <img key={url} src={url} alt="" className="w-full h-full object-contain" />)}
      </div>
    );
  }
  return (
    <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200 bg-white">
      {evt.imageUrl && <img src={evt.imageUrl} alt={evt.title} className="w-full h-full object-cover" />}
    </div>
  );
}
