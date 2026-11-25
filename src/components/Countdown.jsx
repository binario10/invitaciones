import { useState, useEffect, useRef } from 'react';
import { CalendarPlus, ExternalLink, Download, ChevronDown } from 'lucide-react';
import './Countdown.css';

function detectDevicePlatform() {
  if (typeof navigator === 'undefined') return 'desktop';
  const ua = navigator.userAgent || navigator.vendor || '';
  const platform = navigator.platform || '';
  const maxTouchPoints = navigator.maxTouchPoints || 0;

  // iPhone, iPod, iPad (incluyendo iPadOS 13+ que se reporta como MacIntel con touch)
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (platform === 'MacIntel' && maxTouchPoints > 1);
  if (isIOS) return 'ios';

  // Android
  if (/Android/i.test(ua)) return 'android';

  // macOS escritorio
  if (/Mac/i.test(platform) || /Macintosh/i.test(ua)) return 'mac';

  return 'desktop';
}

function formatIcsLocalDate(dateObj) {
  const pad = (n) => String(n).padStart(2, '0');
  return (
    `${dateObj.getFullYear()}` +
    `${pad(dateObj.getMonth() + 1)}` +
    `${pad(dateObj.getDate())}T` +
    `${pad(dateObj.getHours())}` +
    `${pad(dateObj.getMinutes())}` +
    `${pad(dateObj.getSeconds())}`
  );
}

function formatGoogleUtcDate(dateObj) {
  const pad = (n) => String(n).padStart(2, '0');
  return (
    `${dateObj.getUTCFullYear()}` +
    `${pad(dateObj.getUTCMonth() + 1)}` +
    `${pad(dateObj.getUTCDate())}T` +
    `${pad(dateObj.getUTCHours())}` +
    `${pad(dateObj.getUTCMinutes())}` +
    `${pad(dateObj.getUTCSeconds())}Z`
  );
}

function escapeIcsText(str) {
  return String(str || '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

export default function Countdown({ targetDate, eventConfig }) {
  const calculateTimeLeft = () => {
    const difference = +new Date(targetDate) - +new Date();
    if (difference <= 0) {
      return { dias: 0, horas: 0, min: 0, seg: 0 };
    }
    return {
      dias: Math.floor(difference / (1000 * 60 * 60 * 24)),
      horas: Math.floor((difference / (1000 * 60 * 60)) % 24),
      min: Math.floor((difference / 1000 / 60) % 60),
      seg: Math.floor((difference / 1000) % 60),
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);
  const [menuOpen, setMenuOpen] = useState(false);
  const [devicePlatform, setDevicePlatform] = useState('desktop');
  const menuWrapperRef = useRef(null);

  useEffect(() => {
    setDevicePlatform(detectDevicePlatform());
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  useEffect(() => {
    if (!menuOpen) return;
    const handleOutsideClick = (e) => {
      if (
        menuWrapperRef.current &&
        !menuWrapperRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [menuOpen]);

  const hero = eventConfig?.hero || {};
  const showCalendarButton = hero.showCalendarButton !== false;
  const customButtonLabel = hero.calendarButtonText?.trim() || '';

  const buildCalendarPayload = () => {
    const startObj = new Date(targetDate);
    const validStart = Number.isNaN(startObj.getTime()) ? new Date() : startObj;
    const endObj = new Date(validStart.getTime() + 4 * 60 * 60 * 1000);

    const activeActs = Array.isArray(eventConfig?.events)
      ? eventConfig.events.filter((ev) => ev.enabled !== false)
      : [];

    const primaryAct = activeActs[0] || null;
    const locationStr = primaryAct
      ? [primaryAct.venue, primaryAct.address].filter(Boolean).join(' - ')
      : '';

    const inviteUrl =
      typeof window !== 'undefined' ? window.location.href : '';

    const summaryTitle =
      eventConfig?.pageTitle?.trim() ||
      [
        hero.tag,
        [hero.primaryName, hero.connector, hero.secondaryName]
          .filter(Boolean)
          .join(' '),
      ]
        .filter(Boolean)
        .join(' - ') ||
      'Evento Especial';

    const descLines = [];
    if (eventConfig?.quote?.enabled && eventConfig?.quote?.text) {
      descLines.push(eventConfig.quote.text);
      descLines.push('');
    }
    if (activeActs.length > 0) {
      descLines.push('ITINERARIO:');
      activeActs.forEach((act) => {
        const line = `• ${act.type || 'Evento'} (${act.time || ''}): ${
          act.venue || ''
        }${act.address ? ` - ${act.address}` : ''}`;
        descLines.push(line);
        if (act.mapUrl) {
          descLines.push(`  Ubicación GPS: ${act.mapUrl}`);
        }
      });
      descLines.push('');
    }
    if (inviteUrl) {
      descLines.push(`Ver invitación digital: ${inviteUrl}`);
    }

    return {
      title: summaryTitle,
      startObj: validStart,
      endObj,
      location: locationStr,
      description: descLines.join('\n'),
      inviteUrl,
    };
  };

  const getGoogleCalendarUrl = () => {
    const data = buildCalendarPayload();
    const datesParam = `${formatGoogleUtcDate(
      data.startObj
    )}/${formatGoogleUtcDate(data.endObj)}`;
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: data.title,
      dates: datesParam,
      details: data.description,
      location: data.location,
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  const handleDownloadIcs = () => {
    const data = buildCalendarPayload();
    const uid = `${eventConfig?.slug || 'evento'}-${Date.now()}@invite.uberreyes.com`;
    const dtStamp = formatGoogleUtcDate(new Date());
    const dtStartLocal = formatIcsLocalDate(data.startObj);
    const dtEndLocal = formatIcsLocalDate(data.endObj);

    const icsLines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Uber Reyes Invitaciones Digitales//ES',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${dtStamp}`,
      `DTSTART:${dtStartLocal}`,
      `DTEND:${dtEndLocal}`,
      `SUMMARY:${escapeIcsText(data.title)}`,
      data.location ? `LOCATION:${escapeIcsText(data.location)}` : null,
      data.description
        ? `DESCRIPTION:${escapeIcsText(data.description)}`
        : null,
      data.inviteUrl ? `URL:${data.inviteUrl}` : null,
      'BEGIN:VALARM',
      'TRIGGER:-P1D',
      'ACTION:DISPLAY',
      `DESCRIPTION:Recordatorio mañana: ${escapeIcsText(data.title)}`,
      'END:VALARM',
      'BEGIN:VALARM',
      'TRIGGER:-PT2H',
      'ACTION:DISPLAY',
      `DESCRIPTION:Hoy es el gran día: ${escapeIcsText(data.title)}`,
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR',
    ].filter(Boolean);

    const blob = new Blob([icsLines.join('\r\n')], {
      type: 'text/calendar;charset=utf-8',
    });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `${eventConfig?.slug || 'recordatorio-evento'}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1500);
    setMenuOpen(false);
  };

  const items = [
    { label: 'Días', value: timeLeft.dias },
    { label: 'Horas', value: timeLeft.horas },
    { label: 'Minutos', value: timeLeft.min },
    { label: 'Segundos', value: timeLeft.seg },
  ];

  const isAppleDevice = devicePlatform === 'ios' || devicePlatform === 'mac';
  const isAndroidDevice = devicePlatform === 'android';

  return (
    <div id="cuenta-regresiva" className="countdown-wrapper">
      <section className="countdown-section">
        <span className="section-subtitle">Falta muy poco</span>
        <h2 className="section-title">Cuenta Regresiva</h2>

        <div className="countdown-grid">
          {items.map((item) => (
            <div key={item.label} className="countdown-box">
              <span className="countdown-number">
                {String(item.value).padStart(2, '0')}
              </span>
              <span className="countdown-label">{item.label}</span>
            </div>
          ))}
        </div>

        {showCalendarButton && (
          <div className="countdown-calendar-box" ref={menuWrapperRef}>
            {isAppleDevice ? (
              <>
                <button
                  type="button"
                  className="countdown-calendar-trigger"
                  onClick={handleDownloadIcs}
                >
                  <CalendarPlus size={16} />
                  <span>
                    {customButtonLabel || 'Agregar a Apple Calendar'}
                  </span>
                </button>
                <a
                  href={getGoogleCalendarUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="countdown-calendar-alt"
                >
                  ¿Usas Google Calendar? Ábrelo aquí
                </a>
              </>
            ) : isAndroidDevice ? (
              <>
                <a
                  href={getGoogleCalendarUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="countdown-calendar-trigger"
                >
                  <CalendarPlus size={16} />
                  <span>
                    {customButtonLabel || 'Agregar a Google Calendar'}
                  </span>
                </a>
                <button
                  type="button"
                  className="countdown-calendar-alt"
                  onClick={handleDownloadIcs}
                >
                  Descargar archivo .ics (Outlook / Samsung)
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="countdown-calendar-trigger"
                  onClick={() => setMenuOpen((prev) => !prev)}
                  aria-expanded={menuOpen}
                >
                  <CalendarPlus size={16} />
                  <span>{customButtonLabel || 'Agendar en mi Calendario'}</span>
                  <ChevronDown
                    size={15}
                    style={{
                      transform: menuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                    }}
                  />
                </button>

                {menuOpen && (
                  <div className="countdown-calendar-menu">
                    <a
                      href={getGoogleCalendarUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="countdown-calendar-option"
                      onClick={() => setMenuOpen(false)}
                    >
                      <span>Google Calendar</span>
                      <ExternalLink size={14} />
                    </a>
                    <button
                      type="button"
                      className="countdown-calendar-option"
                      onClick={handleDownloadIcs}
                    >
                      <span>Apple Calendar / Outlook (.ics)</span>
                      <Download size={14} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
