import { useState, useEffect, useCallback } from 'react';
import {
  Lock,
  Plus,
  ExternalLink,
  Copy,
  Check,
  Edit3,
  Trash2,
  Camera,
  Upload,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Save,
  LogOut,
  Play,
  Link2,
  Image as ImageIcon,
  Layers,
  Globe,
  DollarSign,
} from 'lucide-react';
import { eventTemplates } from '../data/eventTemplates';
import { colorPalettes } from '../data/colorPalettes';
import {
  ENVELOPE_PRESETS,
  BACKDROP_STYLES,
  SEAL_IDLE_ANIMATIONS,
  SEAL_SHAPES,
  SEAL_ICONS,
  INITIALS_FONTS,
  ENVELOPE_SIZES,
  OPEN_ANIMATIONS,
  getEnvelopePresetById,
} from '../data/envelopePresets';
import UploadProgressModal from './UploadProgressModal';
import { uploadWithProgress } from '../utils/xhrUpload';
import './AdminDashboard.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const TOKEN_KEY = 'invite_admin_token';

const TYPE_LABELS = {
  wedding: 'Boda',
  xv: 'XV Años',
  baptism: 'Bautizo',
  custom: 'Evento Social',
};

const DEFAULT_SECTION_ORDER = [
  'countdown',
  'familyQuote',
  'locations',
  'dressCodeGifts',
  'gallery',
  'album',
  'rsvp',
];

const BUILTIN_SECTION_NAMES = {
  countdown: 'Cuenta Regresiva (Contador)',
  familyQuote: 'Frase y Padres / Padrinos',
  locations: 'Itinerario (Ceremonia y Recepción)',
  dressCodeGifts: 'Código de Vestimenta y Mesa de Regalos',
  gallery: 'Galería / Carrusel de Fotos y Videos',
  album: 'Álbum Colaborativo QR',
  rsvp: 'Confirmación de Asistencia (RSVP)',
};

const VIDEO_EXT_REGEX = /\.(mp4|mov|webm|m4v|avi|mkv)(\?.*)?$/i;

function isVideoMedia(item) {
  if (!item) return false;
  if (item.type === 'video') return true;
  return VIDEO_EXT_REGEX.test(item.url || '');
}

function buildNormalizedOrder(rawOrder, customHeroes) {
  const customIds = (customHeroes || []).map((h) => h.id).filter(Boolean);
  const validKeys = new Set([...DEFAULT_SECTION_ORDER, ...customIds]);
  const base = Array.isArray(rawOrder)
    ? rawOrder.filter((k) => validKeys.has(k))
    : [];

  const result = [...base];
  for (const key of DEFAULT_SECTION_ORDER) {
    if (!result.includes(key)) result.push(key);
  }
  for (const cId of customIds) {
    if (!result.includes(cId)) result.push(cId);
  }
  return result;
}

export default function AdminDashboard() {
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY) || '');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [checkingAuth, setCheckingAuth] = useState(Boolean(token));

  const [eventsList, setEventsList] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isNewEvent, setIsNewEvent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState('');
  const [newGalleryUrl, setNewGalleryUrl] = useState('');

  const [uploadState, setUploadState] = useState({
    active: false,
    fieldKey: '',
    title: 'Subiendo archivo...',
    fileName: '',
    progress: 0,
  });

  const [managingAlbumSlug, setManagingAlbumSlug] = useState('');
  const [albumMediaItems, setAlbumMediaItems] = useState([]);
  const [loadingAlbumMedia, setLoadingAlbumMedia] = useState(false);

  // Estado del editor de la Landing Page Comercial (ruta "/")
  const [editingLanding, setEditingLanding] = useState(false);
  const [landingForm, setLandingForm] = useState(null);
  const [savingLanding, setSavingLanding] = useState(false);

  const logout = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken('');
    setEditingEvent(null);
    setManagingAlbumSlug('');
  }, []);

  const fetchEventsList = useCallback(async () => {
    if (!token) return;
    setLoadingEvents(true);
    try {
      const res = await fetch(`${API_URL}/admin_events.php`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        logout();
        return;
      }
      const data = await res.json();
      if (data.success) {
        setEventsList(data.events || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEvents(false);
      setCheckingAuth(false);
    }
  }, [token, logout]);

  useEffect(() => {
    if (token) {
      fetchEventsList();
    } else {
      setCheckingAuth(false);
    }
  }, [token, fetchEventsList]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch(`${API_URL}/admin_auth.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success && data.token) {
        sessionStorage.setItem(TOKEN_KEY, data.token);
        setToken(data.token);
        setPassword('');
      } else {
        setAuthError(data.message || 'Contraseña incorrecta');
      }
    } catch {
      setAuthError('No se pudo conectar con el servidor PHP.');
    }
  };

  const normalizeEventForEditor = (rawEvent) => {
    const ev = JSON.parse(JSON.stringify(rawEvent));
    if (!ev.gallery) {
      ev.gallery = {
        enabled: true,
        subtitle: 'Nuestros Momentos',
        title: 'Galería',
        photos: [],
      };
    }
    if (!Array.isArray(ev.gallery.photos)) {
      ev.gallery.photos = [];
    }
    if (!Array.isArray(ev.customHeroes)) {
      ev.customHeroes = [];
    }
    if (!ev.sectionBackgrounds || typeof ev.sectionBackgrounds !== 'object') {
      ev.sectionBackgrounds = {};
    }
    for (const key of DEFAULT_SECTION_ORDER) {
      if (!ev.sectionBackgrounds[key]) {
        ev.sectionBackgrounds[key] = {
          useImage: false,
          imageUrl: '',
          overlayOpacity: 55,
        };
      }
    }
    ev.sectionOrder = buildNormalizedOrder(ev.sectionOrder, ev.customHeroes);
    return ev;
  };

  const openLandingEditor = async () => {
    try {
      const res = await fetch(`${API_URL}/landing_config.php`);
      const data = await res.json();
      if (data.success && data.landing) {
        setLandingForm(data.landing);
        setEditingLanding(true);
        setEditingEvent(null);
        setManagingAlbumSlug('');
      }
    } catch {
      alert('No se pudo cargar la configuración de la página principal.');
    }
  };

  const handleSaveLanding = async (e) => {
    e.preventDefault();
    if (!landingForm) return;
    setSavingLanding(true);
    try {
      const res = await fetch(`${API_URL}/landing_config.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(landingForm),
      });
      const data = await res.json();
      if (data.success) {
        setEditingLanding(false);
        alert('Página principal y precios guardados correctamente.');
      } else {
        alert(data.message || 'No se pudo guardar');
      }
    } catch {
      alert('Error de conexión al guardar la página principal.');
    } finally {
      setSavingLanding(false);
    }
  };

  const updateLandingField = (path, value) => {
    setLandingForm((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let cur = copy;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!cur[keys[i]] || typeof cur[keys[i]] !== 'object') {
          cur[keys[i]] = {};
        }
        cur = cur[keys[i]];
      }
      cur[keys[keys.length - 1]] = value;
      return copy;
    });
  };

  const startCreateFromTemplate = (templateKey) => {
    const clone = normalizeEventForEditor(eventTemplates[templateKey]);
    setEditingEvent(clone);
    setIsNewEvent(true);
    setManagingAlbumSlug('');
    setNewGalleryUrl('');
  };

  const startEditExisting = async (slug) => {
    try {
      const res = await fetch(
        `${API_URL}/admin_events.php?slug=${encodeURIComponent(slug)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (data.success && data.event) {
        setEditingEvent(normalizeEventForEditor(data.event));
        setIsNewEvent(false);
        setManagingAlbumSlug('');
        setNewGalleryUrl('');
      }
    } catch {
      alert('Error al cargar los datos del evento.');
    }
  };

  const openAlbumManager = async (slug) => {
    setManagingAlbumSlug(slug);
    setLoadingAlbumMedia(true);
    try {
      const res = await fetch(
        `${API_URL}/get_media.php?slug=${encodeURIComponent(slug)}`
      );
      const data = await res.json();
      if (data.success) {
        setAlbumMediaItems(data.media || []);
      }
    } catch {
      alert('Error al cargar archivos del álbum');
    } finally {
      setLoadingAlbumMedia(false);
    }
  };

  const handleDeleteAlbumMedia = async (filename) => {
    if (!window.confirm('¿Eliminar permanentemente este archivo del álbum?')) {
      return;
    }
    try {
      const res = await fetch(`${API_URL}/delete_media.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          slug: managingAlbumSlug,
          filename,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAlbumMediaItems((prev) =>
          prev.filter((item) => item.filename !== filename)
        );
        fetchEventsList();
      } else {
        alert(data.message || 'No se pudo eliminar');
      }
    } catch {
      alert('Error de conexión al eliminar archivo');
    }
  };

  const handleDeleteEvent = async (slug) => {
    if (
      !window.confirm(
        `¿Seguro que deseas eliminar la invitación "/${slug}" y todas sus fotos?`
      )
    ) {
      return;
    }
    try {
      const res = await fetch(
        `${API_URL}/admin_events.php?slug=${encodeURIComponent(slug)}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (data.success) {
        fetchEventsList();
      } else {
        alert(data.message || 'No se pudo eliminar');
      }
    } catch {
      alert('Error de red al eliminar');
    }
  };

  const handleCopyInviteUrl = (slug) => {
    const fullUrl = `${window.location.origin}/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(''), 2200);
  };

  const handleAssetUpload = async (file, fieldKey, labelTitle, onSuccessUrl) => {
    if (!file || uploadState.active) return;
    const cleanSlug = editingEvent?.slug?.trim().toLowerCase();
    if (!cleanSlug) {
      alert(
        'Primero escribe el identificador de URL (slug) del evento en la parte superior.'
      );
      return;
    }

    const formData = new FormData();
    formData.append('slug', cleanSlug);
    formData.append('asset', file);

    setUploadState({
      active: true,
      fieldKey,
      title: labelTitle || 'Subiendo archivo...',
      fileName: file.name,
      progress: 0,
    });

    try {
      const data = await uploadWithProgress({
        url: `${API_URL}/admin_upload_asset.php`,
        formData,
        headers: { Authorization: `Bearer ${token}` },
        onProgress: (pct) => {
          setUploadState((prev) => ({
            ...prev,
            progress: pct,
          }));
        },
      });

      if (data?.url) {
        onSuccessUrl(data.url, data.mediaType);
      }
    } catch (err) {
      alert(err.message || 'Error al subir archivo al servidor.');
    } finally {
      setTimeout(() => {
        setUploadState({
          active: false,
          fieldKey: '',
          title: 'Subiendo archivo...',
          fileName: '',
          progress: 0,
        });
      }, 450);
    }
  };

  const handleGalleryMultiUpload = async (fileList) => {
    const files = Array.from(fileList || []);
    if (files.length === 0 || uploadState.active) return;

    const cleanSlug = editingEvent?.slug?.trim().toLowerCase();
    if (!cleanSlug) {
      alert(
        'Primero escribe el identificador de URL (slug) del evento en la parte superior.'
      );
      return;
    }

    const newlyUploaded = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('slug', cleanSlug);
      formData.append('asset', file);

      setUploadState({
        active: true,
        fieldKey: 'gallery',
        title:
          files.length > 1
            ? `Subiendo galería (${i + 1} de ${files.length})...`
            : 'Subiendo a galería...',
        fileName: file.name,
        progress: 0,
      });

      try {
        const data = await uploadWithProgress({
          url: `${API_URL}/admin_upload_asset.php`,
          formData,
          headers: { Authorization: `Bearer ${token}` },
          onProgress: (pct) => {
            setUploadState((prev) => ({
              ...prev,
              progress: pct,
            }));
          },
        });

        if (data?.url) {
          const isVid =
            data.mediaType === 'video' ||
            file.type.startsWith('video/') ||
            VIDEO_EXT_REGEX.test(file.name);

          newlyUploaded.push({
            id: `gal_${Date.now()}_${i}`,
            url: data.url,
            type: isVid ? 'video' : 'image',
            alt: '',
          });
        }
      } catch (err) {
        alert(`Error con "${file.name}": ${err.message}`);
      }
    }

    if (newlyUploaded.length > 0) {
      setEditingEvent((prev) => {
        const copy = JSON.parse(JSON.stringify(prev));
        copy.gallery.photos = [...(copy.gallery.photos || []), ...newlyUploaded];
        return copy;
      });
    }

    setTimeout(() => {
      setUploadState({
        active: false,
        fieldKey: '',
        title: 'Subiendo archivo...',
        fileName: '',
        progress: 0,
      });
    }, 450);
  };

  const handleAddGalleryByUrl = () => {
    const trimmed = newGalleryUrl.trim();
    if (!trimmed) return;
    const isVid = VIDEO_EXT_REGEX.test(trimmed);
    setEditingEvent((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      copy.gallery.photos = [
        ...(copy.gallery.photos || []),
        {
          id: `gal_${Date.now()}`,
          url: trimmed,
          type: isVid ? 'video' : 'image',
          alt: '',
        },
      ];
      return copy;
    });
    setNewGalleryUrl('');
  };

  const handleMoveGalleryItem = (index, direction) => {
    setEditingEvent((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      const list = copy.gallery.photos || [];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= list.length) return prev;
      const temp = list[index];
      list[index] = list[targetIndex];
      list[targetIndex] = temp;
      copy.gallery.photos = list;
      return copy;
    });
  };

  const handleRemoveGalleryItem = (index) => {
    setEditingEvent((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      copy.gallery.photos = (copy.gallery.photos || []).filter(
        (_, i) => i !== index
      );
      return copy;
    });
  };

  // Funciones para Secciones Hero Personalizadas
  const handleAddCustomHero = () => {
    const newId = `custom_hero_${Date.now()}`;
    setEditingEvent((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      const nextNum = (copy.customHeroes?.length || 0) + 1;
      copy.customHeroes = [
        ...(copy.customHeroes || []),
        {
          id: newId,
          enabled: true,
          eyebrow: 'Momento Especial',
          title: `Sección Hero #${nextNum}`,
          bodyText: '',
          backgroundImage: copy.hero?.heroImage || '',
          overlayOpacity: 45,
          alignment: 'center',
          buttonText: '',
          buttonUrl: '',
        },
      ];
      copy.sectionOrder = buildNormalizedOrder(
        [...(copy.sectionOrder || []), newId],
        copy.customHeroes
      );
      return copy;
    });
  };

  const handleUpdateCustomHero = (index, field, value) => {
    setEditingEvent((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      copy.customHeroes[index][field] = value;
      return copy;
    });
  };

  const handleRemoveCustomHero = (index) => {
    setEditingEvent((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      const removedId = copy.customHeroes[index]?.id;
      copy.customHeroes = copy.customHeroes.filter((_, i) => i !== index);
      copy.sectionOrder = (copy.sectionOrder || []).filter(
        (k) => k !== removedId
      );
      return copy;
    });
  };

  // Reordenamiento de secciones
  const handleMoveSectionOrder = (index, direction) => {
    setEditingEvent((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      const order = [...(copy.sectionOrder || [])];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= order.length) return prev;
      const temp = order[index];
      order[index] = order[targetIndex];
      order[targetIndex] = temp;
      copy.sectionOrder = order;
      return copy;
    });
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    if (uploadState.active) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/admin_events.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editingEvent),
      });
      const data = await res.json();
      if (data.success) {
        setEditingEvent(null);
        fetchEventsList();
      } else {
        alert(data.message || 'Error al guardar la invitación');
      }
    } catch {
      alert('Error de conexión al guardar');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (path, value) => {
    setEditingEvent((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let cur = copy;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!cur[keys[i]] || typeof cur[keys[i]] !== 'object') {
          cur[keys[i]] = {};
        }
        cur = cur[keys[i]];
      }
      cur[keys[keys.length - 1]] = value;
      return copy;
    });
  };

  // Helper UI reutilizable para elegir Paleta vs Fotografía de Fondo en cualquier sección
  const renderSectionBackgroundControl = (sectionKey, sectionLabel) => {
    const bgCfg = editingEvent?.sectionBackgrounds?.[sectionKey] || {
      useImage: false,
      imageUrl: '',
      overlayOpacity: 55,
    };
    const fieldUploadKey = `sec_bg_${sectionKey}`;

    return (
      <div className="section-bg-config-box">
        <div className="section-bg-config-header">
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={Boolean(bgCfg.useImage)}
              onChange={(e) =>
                updateField(
                  `sectionBackgrounds.${sectionKey}.useImage`,
                  e.target.checked
                )
              }
            />
            <ImageIcon size={15} />
            Usar fotografía de fondo en esta sección ({sectionLabel})
          </label>
          <span style={{ fontSize: '0.73rem', color: '#6e6862' }}>
            {bgCfg.useImage
              ? 'Fondo fotográfico activo'
              : 'Usando color de la paleta'}
          </span>
        </div>

        {bgCfg.useImage && (
          <div style={{ marginTop: '0.85rem' }}>
            <div className="editor-grid-2">
              <div className="field-box" style={{ marginBottom: 0 }}>
                <label>Imagen de Fondo (URL o Subir)</label>
                <div className="upload-inline-row">
                  <input
                    type="text"
                    className="field-input"
                    placeholder="https://... o sube una foto"
                    value={bgCfg.imageUrl || ''}
                    onChange={(e) =>
                      updateField(
                        `sectionBackgrounds.${sectionKey}.imageUrl`,
                        e.target.value
                      )
                    }
                  />
                  <label
                    className="admin-mini-btn"
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    <Upload size={15} />
                    {uploadState.active &&
                    uploadState.fieldKey === fieldUploadKey
                      ? `${uploadState.progress}%`
                      : 'Subir'}
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      disabled={uploadState.active}
                      onChange={(e) => {
                        handleAssetUpload(
                          e.target.files?.[0],
                          fieldUploadKey,
                          `Subiendo fondo de ${sectionLabel}...`,
                          (url) =>
                            updateField(
                              `sectionBackgrounds.${sectionKey}.imageUrl`,
                              url
                            )
                        );
                        e.target.value = '';
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="field-box" style={{ marginBottom: 0 }}>
                <label>
                  Oscurecimiento para legibilidad ({bgCfg.overlayOpacity ?? 55}%)
                </label>
                <input
                  type="range"
                  min="15"
                  max="85"
                  value={bgCfg.overlayOpacity ?? 55}
                  onChange={(e) =>
                    updateField(
                      `sectionBackgrounds.${sectionKey}.overlayOpacity`,
                      Number(e.target.value)
                    )
                  }
                />
              </div>
            </div>

            {bgCfg.imageUrl?.trim() && (
              <div className="section-bg-preview-strip">
                <img
                  src={bgCfg.imageUrl}
                  alt="Vista previa fondo"
                  className="section-bg-thumb"
                />
                <span style={{ fontSize: '0.75rem', color: '#6e6862' }}>
                  Vista previa de imagen asignada
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (checkingAuth) {
    return <div className="state-screen">Verificando sesión...</div>;
  }

  if (!token) {
    return (
      <div className="admin-shell">
        <div className="admin-login-wrapper">
          <form className="admin-login-card" onSubmit={handleLogin}>
            <Lock
              size={32}
              strokeWidth={1.3}
              style={{ color: '#8c7a6b', marginBottom: '1rem' }}
            />
            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '2rem',
                marginBottom: '0.4rem',
              }}
            >
              Panel Administrativo
            </h1>
            <p
              style={{
                fontSize: '0.85rem',
                color: '#6e6862',
                marginBottom: '1.75rem',
              }}
            >
              invite.uberreyes.com
            </p>
            <div className="field-box" style={{ textAlign: 'left' }}>
              <label htmlFor="adminPass">Contraseña Maestra</label>
              <input
                id="adminPass"
                type="password"
                required
                className="field-input"
                placeholder="••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {authError && (
              <p
                style={{
                  color: '#b91c1c',
                  fontSize: '0.82rem',
                  marginBottom: '1rem',
                }}
              >
                {authError}
              </p>
            )}
            <button type="submit" className="btn-solid" style={{ width: '100%' }}>
              Ingresar al Panel
            </button>
          </form>
        </div>
      </div>
    );
  }

  const isMusicEnabled = editingEvent?.hero?.musicEnabled !== false;
  const isDressCodeEnabled = editingEvent?.dressCode?.enabled !== false;
  const isGiftsEnabled = Boolean(editingEvent?.gifts?.enabled);
  const isBankEnabled = editingEvent?.gifts?.bank?.enabled !== false;
  const isStoreEnabled = editingEvent?.gifts?.storeRegistry?.enabled !== false;
  const isGalleryEnabled = editingEvent?.gallery?.enabled !== false;
  const galleryPhotos = editingEvent?.gallery?.photos || [];
  const customHeroes = editingEvent?.customHeroes || [];
  const currentSectionOrder = editingEvent?.sectionOrder || DEFAULT_SECTION_ORDER;

  const getSectionOrderMeta = (key) => {
    if (key === 'countdown') {
      return {
        label: BUILTIN_SECTION_NAMES.countdown,
        active: Boolean(editingEvent?.hero?.dateISO),
        isCustom: false,
      };
    }
    if (key === 'familyQuote') {
      return {
        label: BUILTIN_SECTION_NAMES.familyQuote,
        active:
          Boolean(editingEvent?.quote?.enabled) ||
          editingEvent?.familySection?.enabled !== false,
        isCustom: false,
      };
    }
    if (key === 'locations') {
      return {
        label: BUILTIN_SECTION_NAMES.locations,
        active: (editingEvent?.events || []).some((e) => e.enabled !== false),
        isCustom: false,
      };
    }
    if (key === 'dressCodeGifts') {
      return {
        label: BUILTIN_SECTION_NAMES.dressCodeGifts,
        active: isDressCodeEnabled || isGiftsEnabled,
        isCustom: false,
      };
    }
    if (key === 'gallery') {
      return {
        label: BUILTIN_SECTION_NAMES.gallery,
        active: isGalleryEnabled && galleryPhotos.length > 0,
        isCustom: false,
      };
    }
    if (key === 'album') {
      return {
        label: BUILTIN_SECTION_NAMES.album,
        active: Boolean(editingEvent?.album?.enabled),
        isCustom: false,
      };
    }
    if (key === 'rsvp') {
      return {
        label: BUILTIN_SECTION_NAMES.rsvp,
        active: Boolean(editingEvent?.rsvp),
        isCustom: false,
      };
    }
    const chIdx = customHeroes.findIndex((c) => c.id === key);
    const ch = chIdx >= 0 ? customHeroes[chIdx] : null;
    return {
      label: ch
        ? `Hero Personalizado #${chIdx + 1}: ${ch.title || ch.eyebrow || 'Sin título'}`
        : key,
      active: ch ? ch.enabled !== false : false,
      isCustom: true,
    };
  };

  return (
    <div className="admin-shell">
      <nav className="admin-navbar">
        <div className="admin-brand">
          <span>Gestor de Invitaciones</span>
        </div>
        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="admin-mini-btn"
            onClick={openLandingEditor}
          >
            <Globe size={15} />
            Configurar Página Principal & Precios
          </button>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="admin-mini-btn"
          >
            <ExternalLink size={15} /> Ver Landing
          </a>
          <button type="button" className="admin-mini-btn" onClick={logout}>
            <LogOut size={15} />
            Cerrar sesión
          </button>
        </div>
      </nav>

      <UploadProgressModal
        isOpen={uploadState.active}
        progress={uploadState.progress}
        title={uploadState.title}
        subtitle={uploadState.fileName}
      />

      <div className="admin-container">
        {editingLanding && landingForm ? (
          <form onSubmit={handleSaveLanding}>
            <div className="admin-toolbar">
              <button
                type="button"
                className="admin-mini-btn"
                onClick={() => setEditingLanding(false)}
              >
                <ArrowLeft size={15} /> Volver al listado
              </button>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.9rem' }}>
                Configurar Página Principal de Ventas (/)
              </h2>
            </div>

            {/* BLOQUE 1: PRECIOS Y OFERTA */}
            <div className="editor-card">
              <h3 className="editor-section-title">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
                  <DollarSign size={20} /> 1. Precios, Oferta y WhatsApp de Ventas
                </span>
                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={landingForm.pricing?.showBasePrice !== false}
                    onChange={(e) =>
                      updateLandingField(
                        'pricing.showBasePrice',
                        e.target.checked
                      )
                    }
                  />
                  Mostrar precio base tachado (Anclaje de oferta)
                </label>
              </h3>

              <div className="editor-grid-4">
                <div className="field-box">
                  <label>Precio Base Regular (Tachado)</label>
                  <input
                    type="number"
                    required
                    className="field-input"
                    value={landingForm.pricing?.basePrice ?? 1000}
                    onChange={(e) =>
                      updateLandingField(
                        'pricing.basePrice',
                        Number(e.target.value)
                      )
                    }
                  />
                </div>
                <div className="field-box">
                  <label>Precio Oferta Actual *</label>
                  <input
                    type="number"
                    required
                    className="field-input"
                    value={landingForm.pricing?.offerPrice ?? 500}
                    onChange={(e) =>
                      updateLandingField(
                        'pricing.offerPrice',
                        Number(e.target.value)
                      )
                    }
                  />
                </div>
                <div className="field-box">
                  <label>Moneda</label>
                  <input
                    type="text"
                    className="field-input"
                    value={landingForm.pricing?.currency || 'MXN'}
                    onChange={(e) =>
                      updateLandingField('pricing.currency', e.target.value)
                    }
                  />
                </div>
                <div className="field-box">
                  <label>WhatsApp de Ventas (521 + 10 dígitos)</label>
                  <input
                    type="text"
                    required
                    className="field-input"
                    value={landingForm.whatsappPhone || ''}
                    onChange={(e) =>
                      updateLandingField('whatsappPhone', e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="editor-grid-2">
                <div className="field-box">
                  <label>Cinta de Promoción / Descuento</label>
                  <input
                    type="text"
                    className="field-input"
                    value={landingForm.pricing?.offerBadge || ''}
                    onChange={(e) =>
                      updateLandingField('pricing.offerBadge', e.target.value)
                    }
                  />
                </div>
                <div className="field-box">
                  <label>Nombre del Paquete</label>
                  <input
                    type="text"
                    className="field-input"
                    value={landingForm.pricing?.packageName || ''}
                    onChange={(e) =>
                      updateLandingField('pricing.packageName', e.target.value)
                    }
                  />
                </div>
                <div className="field-box">
                  <label>Texto Botón de Compra</label>
                  <input
                    type="text"
                    className="field-input"
                    value={landingForm.pricing?.ctaText || ''}
                    onChange={(e) =>
                      updateLandingField('pricing.ctaText', e.target.value)
                    }
                  />
                </div>
                <div className="field-box">
                  <label>Frase de Urgencia debajo del Precio</label>
                  <input
                    type="text"
                    className="field-input"
                    value={landingForm.pricing?.urgencyNote || ''}
                    onChange={(e) =>
                      updateLandingField('pricing.urgencyNote', e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="field-box">
                <label>Mensaje Prellenado al abrir WhatsApp</label>
                <input
                  type="text"
                  className="field-input"
                  value={landingForm.whatsappMessage || ''}
                  onChange={(e) =>
                    updateLandingField('whatsappMessage', e.target.value)
                  }
                />
              </div>

              <div className="field-box" style={{ marginBottom: 0 }}>
                <label>Lista de Beneficios Incluidos (uno por línea)</label>
                <textarea
                  rows="6"
                  className="field-input"
                  value={(landingForm.pricing?.includedItems || []).join('\n')}
                  onChange={(e) =>
                    updateLandingField(
                      'pricing.includedItems',
                      e.target.value.split('\n').filter((line) => line.trim())
                    )
                  }
                />
              </div>
            </div>

            {/* BLOQUE 2: PORTADA COMERCIAL */}
            <div className="editor-card">
              <h3 className="editor-section-title">
                2. Portada Comercial Principal (Hero)
              </h3>
              <div className="editor-grid-2">
                <div className="field-box">
                  <label>Nombre de Marca / Estudio</label>
                  <input
                    type="text"
                    className="field-input"
                    value={landingForm.brandName || ''}
                    onChange={(e) =>
                      updateLandingField('brandName', e.target.value)
                    }
                  />
                </div>
                <div className="field-box">
                  <label>Etiqueta Superior (Eyebrow)</label>
                  <input
                    type="text"
                    className="field-input"
                    value={landingForm.hero?.eyebrow || ''}
                    onChange={(e) =>
                      updateLandingField('hero.eyebrow', e.target.value)
                    }
                  />
                </div>
                <div className="field-box">
                  <label>Titular Principal Persuasivo</label>
                  <input
                    type="text"
                    className="field-input"
                    value={landingForm.hero?.title || ''}
                    onChange={(e) =>
                      updateLandingField('hero.title', e.target.value)
                    }
                  />
                </div>
                <div className="field-box">
                  <label>Enlace del Botón "Ver Demo Interactivo"</label>
                  <input
                    type="text"
                    className="field-input"
                    placeholder="/karina-brayan"
                    value={landingForm.hero?.demoUrl || ''}
                    onChange={(e) =>
                      updateLandingField('hero.demoUrl', e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="field-box">
                <label>Subtítulo Persuasivo</label>
                <textarea
                  rows="2"
                  className="field-input"
                  value={landingForm.hero?.subtitle || ''}
                  onChange={(e) =>
                    updateLandingField('hero.subtitle', e.target.value)
                  }
                />
              </div>

              <div className="field-box" style={{ marginBottom: 0 }}>
                <label>Imagen de Fondo de la Portada Comercial (URL)</label>
                <input
                  type="text"
                  className="field-input"
                  value={landingForm.hero?.heroImage || ''}
                  onChange={(e) =>
                    updateLandingField('hero.heroImage', e.target.value)
                  }
                />
              </div>
            </div>

            {/* BLOQUE 3: TARJETAS DE DEMOS EN VIVO */}
            <div className="editor-card">
              <h3 className="editor-section-title">
                <span>3. Tarjetas de Invitaciones Demo en Vivo</span>
                <button
                  type="button"
                  className="admin-mini-btn"
                  onClick={() =>
                    updateLandingField('demosSection.items', [
                      ...(landingForm.demosSection?.items || []),
                      {
                        id: `demo_${Date.now()}`,
                        category: 'Evento Especial',
                        title: 'Nuevo Demo',
                        desc: 'Descripción persuasiva del diseño.',
                        image:
                          'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80',
                        url: '/karina-brayan',
                      },
                    ])
                  }
                >
                  <Plus size={14} /> Agregar Demo
                </button>
              </h3>

              {(landingForm.demosSection?.items || []).map((demo, idx) => (
                <div key={demo.id || idx} className="repeat-subcard">
                  <div className="subcard-header">
                    <strong>Demo #{idx + 1}: {demo.title}</strong>
                    <button
                      type="button"
                      className="admin-mini-btn danger"
                      style={{ padding: '0.3rem 0.5rem' }}
                      onClick={() =>
                        updateLandingField(
                          'demosSection.items',
                          landingForm.demosSection.items.filter(
                            (_, i) => i !== idx
                          )
                        )
                      }
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <div className="editor-grid-4">
                    <div className="field-box">
                      <label>Categoría</label>
                      <input
                        type="text"
                        className="field-input"
                        value={demo.category || ''}
                        onChange={(e) => {
                          const next = [...landingForm.demosSection.items];
                          next[idx].category = e.target.value;
                          updateLandingField('demosSection.items', next);
                        }}
                      />
                    </div>
                    <div className="field-box">
                      <label>Título</label>
                      <input
                        type="text"
                        className="field-input"
                        value={demo.title || ''}
                        onChange={(e) => {
                          const next = [...landingForm.demosSection.items];
                          next[idx].title = e.target.value;
                          updateLandingField('demosSection.items', next);
                        }}
                      />
                    </div>
                    <div className="field-box">
                      <label>Ruta / Enlace Demo</label>
                      <input
                        type="text"
                        className="field-input"
                        placeholder="/karina-brayan"
                        value={demo.url || ''}
                        onChange={(e) => {
                          const next = [...landingForm.demosSection.items];
                          next[idx].url = e.target.value;
                          updateLandingField('demosSection.items', next);
                        }}
                      />
                    </div>
                    <div className="field-box">
                      <label>Imagen Portada (URL)</label>
                      <input
                        type="text"
                        className="field-input"
                        value={demo.image || ''}
                        onChange={(e) => {
                          const next = [...landingForm.demosSection.items];
                          next[idx].image = e.target.value;
                          updateLandingField('demosSection.items', next);
                        }}
                      />
                    </div>
                  </div>
                  <div className="field-box" style={{ marginBottom: 0 }}>
                    <label>Descripción corta</label>
                    <input
                      type="text"
                      className="field-input"
                      value={demo.desc || ''}
                      onChange={(e) => {
                        const next = [...landingForm.demosSection.items];
                        next[idx].desc = e.target.value;
                        updateLandingField('demosSection.items', next);
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="editor-sticky-bar">
              <button
                type="button"
                className="btn-outline"
                onClick={() => setEditingLanding(false)}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-solid"
                disabled={savingLanding}
              >
                <Save size={16} />
                {savingLanding ? 'Guardando...' : 'Guardar Página Principal'}
              </button>
            </div>
          </form>
        ) : managingAlbumSlug ? (
          <div className="editor-card">
            <div className="admin-toolbar">
              <button
                type="button"
                className="admin-mini-btn"
                onClick={() => setManagingAlbumSlug('')}
              >
                <ArrowLeft size={15} /> Volver al listado
              </button>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.9rem' }}>
                Álbum de /{managingAlbumSlug} ({albumMediaItems.length})
              </h2>
              <a
                href={`/${managingAlbumSlug}/album`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline"
              >
                <ExternalLink size={15} /> Abrir Álbum Público
              </a>
            </div>

            {loadingAlbumMedia ? (
              <p>Cargando archivos...</p>
            ) : albumMediaItems.length === 0 ? (
              <p style={{ color: '#6e6862', padding: '2rem 0' }}>
                Aún no hay fotos o videos subidos en este álbum.
              </p>
            ) : (
              <div className="admin-album-grid">
                {albumMediaItems.map((item) => (
                  <div key={item.id || item.filename} className="admin-album-thumb">
                    {item.type === 'video' ? (
                      <>
                        <video
                          src={`${item.url}#t=0.1`}
                          muted
                          playsInline
                          preload="metadata"
                        />
                        <div
                          style={{
                            position: 'absolute',
                            bottom: '0.4rem',
                            left: '0.4rem',
                            background: 'rgba(0,0,0,0.75)',
                            color: '#fff',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '0.65rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                          }}
                        >
                          <Play size={10} fill="#fff" /> Video
                        </div>
                      </>
                    ) : (
                      <img src={item.url} alt={item.filename} loading="lazy" />
                    )}
                    <button
                      type="button"
                      className="admin-album-del"
                      title="Eliminar archivo"
                      onClick={() => handleDeleteAlbumMedia(item.filename)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : !editingEvent ? (
          <>
            <div className="admin-toolbar">
              <div>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem' }}>
                  Invitaciones Activas
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#6e6862' }}>
                  Crea una nueva invitación desde una plantilla o edita un evento
                  existente.
                </p>
              </div>

              <div className="template-picker">
                <button
                  type="button"
                  className="btn-solid"
                  onClick={() => startCreateFromTemplate('wedding')}
                >
                  <Plus size={15} /> Boda
                </button>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => startCreateFromTemplate('xv')}
                >
                  <Plus size={15} /> XV Años
                </button>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => startCreateFromTemplate('baptism')}
                >
                  <Plus size={15} /> Bautizo
                </button>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => startCreateFromTemplate('custom')}
                >
                  <Plus size={15} /> Otro
                </button>
              </div>
            </div>

            {loadingEvents ? (
              <p>Cargando invitaciones...</p>
            ) : (
              <div className="events-admin-grid">
                {eventsList.map((ev) => (
                  <article key={ev.slug} className="admin-event-card">
                    <img
                      src={ev.heroImage}
                      alt={ev.pageTitle}
                      className="admin-event-cover"
                    />
                    <div className="admin-event-body">
                      <span className="admin-badge">
                        {TYPE_LABELS[ev.eventType] || 'Evento'} • /{ev.slug}
                      </span>
                      <h3 className="admin-event-title">{ev.pageTitle}</h3>
                      <p className="admin-event-meta">
                        {ev.dateDisplay} • {ev.mediaCount} archivos en álbum
                      </p>

                      <div className="admin-card-actions">
                        <a
                          href={`/${ev.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="admin-mini-btn"
                        >
                          <ExternalLink size={14} /> Ver Invitación
                        </a>

                        <button
                          type="button"
                          className="admin-mini-btn"
                          onClick={() => handleCopyInviteUrl(ev.slug)}
                        >
                          {copiedSlug === ev.slug ? (
                            <>
                              <Check size={14} /> ¡Copiado!
                            </>
                          ) : (
                            <>
                              <Copy size={14} /> Copiar Link
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          className="admin-mini-btn"
                          onClick={() => openAlbumManager(ev.slug)}
                        >
                          <Camera size={14} /> Gestionar Álbum ({ev.mediaCount})
                        </button>

                        <button
                          type="button"
                          className="admin-mini-btn"
                          onClick={() => startEditExisting(ev.slug)}
                        >
                          <Edit3 size={14} /> Editar
                        </button>

                        <button
                          type="button"
                          className="admin-mini-btn danger"
                          style={{ gridColumn: 'span 2' }}
                          onClick={() => handleDeleteEvent(ev.slug)}
                        >
                          <Trash2 size={14} /> Eliminar Evento
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        ) : (
          /* FORMULARIO EDITOR DE INVITACIÓN */
          <form onSubmit={handleSaveEvent}>
            <div className="admin-toolbar">
              <button
                type="button"
                className="admin-mini-btn"
                onClick={() => setEditingEvent(null)}
              >
                <ArrowLeft size={15} /> Volver al listado
              </button>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.9rem' }}>
                {isNewEvent ? 'Nueva Invitación' : `Editando: /${editingEvent.slug}`}
              </h2>
            </div>

            {/* 1. IDENTIFICADOR Y PALETAS DE COLORES */}
            <div className="editor-card">
              <h3 className="editor-section-title">1. URL y Apariencia</h3>
              <div className="editor-grid-2">
                <div className="field-box">
                  <label>Identificador URL (Slug) *</label>
                  <input
                    type="text"
                    required
                    disabled={!isNewEvent}
                    className="field-input"
                    placeholder="ej. dania o karina-brayan"
                    value={editingEvent.slug}
                    onChange={(e) =>
                      updateField(
                        'slug',
                        e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')
                      )
                    }
                  />
                  <small style={{ color: '#6e6862', fontSize: '0.75rem' }}>
                    Enlace final: {window.location.origin}/
                    {editingEvent.slug || 'tu-evento'}
                  </small>
                </div>

                <div className="field-box">
                  <label>Título de la pestaña del navegador *</label>
                  <input
                    type="text"
                    required
                    className="field-input"
                    value={editingEvent.pageTitle}
                    onChange={(e) => updateField('pageTitle', e.target.value)}
                  />
                </div>
              </div>

              <div className="field-box" style={{ marginTop: '0.5rem' }}>
                <label>Paletas de Colores Sugeridas (10 Combinaciones)</label>
                <div className="palettes-grid">
                  {colorPalettes.map((pal) => {
                    const isSelected =
                      editingEvent.theme['--accent-primary']?.toLowerCase() ===
                        pal.theme['--accent-primary'].toLowerCase() &&
                      editingEvent.theme['--bg-primary']?.toLowerCase() ===
                        pal.theme['--bg-primary'].toLowerCase();

                    return (
                      <button
                        key={pal.id}
                        type="button"
                        className={`palette-chip ${isSelected ? 'active' : ''}`}
                        onClick={() => updateField('theme', { ...pal.theme })}
                      >
                        <div className="palette-swatches">
                          <span
                            className="palette-dot"
                            style={{ backgroundColor: pal.theme['--bg-primary'] }}
                          />
                          <span
                            className="palette-dot"
                            style={{ backgroundColor: pal.theme['--bg-secondary'] }}
                          />
                          <span
                            className="palette-dot"
                            style={{
                              backgroundColor: pal.theme['--accent-primary'],
                            }}
                          />
                          <span
                            className="palette-dot"
                            style={{ backgroundColor: pal.theme['--accent-dark'] }}
                          />
                        </div>
                        <span className="palette-name">{pal.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="editor-grid-4">
                <div className="field-box">
                  <label>Fondo Principal</label>
                  <input
                    type="color"
                    className="field-input"
                    style={{ height: '42px', padding: '4px' }}
                    value={editingEvent.theme['--bg-primary']}
                    onChange={(e) =>
                      updateField('theme.--bg-primary', e.target.value)
                    }
                  />
                </div>
                <div className="field-box">
                  <label>Fondo Secundario</label>
                  <input
                    type="color"
                    className="field-input"
                    style={{ height: '42px', padding: '4px' }}
                    value={editingEvent.theme['--bg-secondary']}
                    onChange={(e) =>
                      updateField('theme.--bg-secondary', e.target.value)
                    }
                  />
                </div>
                <div className="field-box">
                  <label>Color Acento</label>
                  <input
                    type="color"
                    className="field-input"
                    style={{ height: '42px', padding: '4px' }}
                    value={editingEvent.theme['--accent-primary']}
                    onChange={(e) =>
                      updateField('theme.--accent-primary', e.target.value)
                    }
                  />
                </div>
                <div className="field-box">
                  <label>Acento Hover</label>
                  <input
                    type="color"
                    className="field-input"
                    style={{ height: '42px', padding: '4px' }}
                    value={editingEvent.theme['--accent-dark']}
                    onChange={(e) =>
                      updateField('theme.--accent-dark', e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            {/* 2. PORTADA Y BIENVENIDA */}
            <div className="editor-card">
              <h3 className="editor-section-title">
                2. Portada y Pantalla de Bienvenida
              </h3>
              <div className="editor-grid-2">
                <div className="field-box">
                  <label>Iniciales Sello (Pantalla inicial)</label>
                  <input
                    type="text"
                    className="field-input"
                    value={editingEvent.welcome.initials}
                    onChange={(e) =>
                      updateField('welcome.initials', e.target.value)
                    }
                  />
                </div>
                <div className="field-box">
                  <label>Mensaje Pantalla Inicial</label>
                  <input
                    type="text"
                    className="field-input"
                    value={editingEvent.welcome.message}
                    onChange={(e) =>
                      updateField('welcome.message', e.target.value)
                    }
                  />
                </div>
                <div className="field-box">
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(editingEvent.welcome.showButtonText)}
                      onChange={(e) => {
                        const enabled = e.target.checked;
                        updateField('welcome.showButtonText', enabled);
                        if (enabled && !editingEvent.welcome.buttonText) {
                          updateField('welcome.buttonText', 'Abrir Invitación');
                        }
                      }}
                    />
                    <span>Mostrar Texto Botón de Entrada (Opcional)</span>
                  </label>
                  {editingEvent.welcome.showButtonText && (
                    <input
                      type="text"
                      className="field-input"
                      placeholder="Abrir Invitación"
                      value={editingEvent.welcome.buttonText || ''}
                      onChange={(e) =>
                        updateField('welcome.buttonText', e.target.value)
                      }
                    />
                  )}
                </div>
              </div>

              {/* SUBPANEL: DISEÑO Y PERSONALIZACIÓN DEL SOBRE DE BIENVENIDA */}
              <div
                style={{
                  marginTop: '1.25rem',
                  marginBottom: '1.5rem',
                  padding: '1.25rem',
                  backgroundColor: '#faf8f5',
                  border: '1px solid #e5dfd5',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                    marginBottom: '1rem',
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '0.95rem', color: '#2c2825' }}>
                      Diseño y Personalización del Sobre Inicial (11 Estilos)
                    </strong>
                    <p
                      style={{
                        fontSize: '0.78rem',
                        color: '#6e6862',
                        margin: '0.2rem 0 0',
                      }}
                    >
                      Elige un diseño base (Original, Tenue, Sobrio, Con Diseño o
                      Realista) y personaliza colores, imagen, sello y
                      animación.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="admin-mini-btn"
                    onClick={() => {
                      updateField('welcome.envelopeBgColor', '');
                      updateField('welcome.envelopeFlapColor', '');
                      updateField('welcome.envelopeLinerColor', '');
                      updateField('welcome.envelopeSealColor', '');
                      updateField('welcome.envelopeTextColor', '');
                      updateField('welcome.envelopeBorderColor', '');
                      updateField('welcome.envelopeImage', '');
                      updateField('welcome.envelopeImageOpacity', 0.35);
                    }}
                  >
                    Restaurar colores del diseño
                  </button>
                </div>

                {/* Cuadrícula de los 11 estilos de sobres */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fill, minmax(175px, 1fr))',
                    gap: '0.75rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  {ENVELOPE_PRESETS.map((preset) => {
                    const activeStyle =
                      (editingEvent.welcome.envelopeStyle || 'default') ===
                      preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() =>
                          updateField('welcome.envelopeStyle', preset.id)
                        }
                        style={{
                          textAlign: 'left',
                          padding: '0.7rem',
                          backgroundColor: '#ffffff',
                          border: activeStyle
                            ? '2px solid #2c2825'
                            : '1px solid #dfd8ce',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.45rem',
                          boxShadow: activeStyle
                            ? '0 6px 16px rgba(44,40,37,0.12)'
                            : 'none',
                        }}
                      >
                        {/* Miniatura visual del sobre */}
                        <div
                          style={{
                            height: '58px',
                            width: '100%',
                            background: preset.paperBg,
                            border: `1px solid ${preset.borderColor}`,
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              position: 'absolute',
                              inset: 0,
                              background: preset.flapBg,
                              clipPath: 'polygon(0 0, 100% 0, 50% 56%)',
                            }}
                          />
                          <div
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              background: preset.sealBg,
                              color: preset.sealColor,
                              fontSize: '0.62rem',
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              position: 'relative',
                              zIndex: 2,
                              boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                            }}
                          >
                            {editingEvent.welcome.initials || 'I'}
                          </div>
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '0.25rem',
                          }}
                        >
                          <span
                            style={{
                              fontSize: '0.64rem',
                              fontWeight: 600,
                              letterSpacing: '0.08em',
                              textTransform: 'uppercase',
                              color: '#8c7a6b',
                            }}
                          >
                            {preset.category}
                          </span>
                          {activeStyle && (
                            <span
                              style={{
                                fontSize: '0.62rem',
                                fontWeight: 700,
                                color: '#16a34a',
                              }}
                            >
                              ✓ Activo
                            </span>
                          )}
                        </div>
                        <strong
                          style={{
                            fontSize: '0.82rem',
                            color: '#2c2825',
                            lineHeight: 1.25,
                          }}
                        >
                          {preset.name}
                        </strong>
                      </button>
                    );
                  })}
                </div>

                {/* Controles de Fondo detrás del sobre, Forma de Sello, Icono, Tipografía, Tamaño y Animación */}
                <div className="editor-grid-3">
                  <div className="field-box">
                    <label>Fondo Detrás del Sobre</label>
                    <select
                      className="field-input"
                      value={editingEvent.welcome.backdropStyle || 'auto'}
                      onChange={(e) =>
                        updateField('welcome.backdropStyle', e.target.value)
                      }
                    >
                      {BACKDROP_STYLES.map((bg) => (
                        <option key={bg.id} value={bg.id}>
                          {bg.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="field-box">
                    <label>Forma del Sello de Lacre</label>
                    <select
                      className="field-input"
                      value={editingEvent.welcome.sealShape || 'organic-wax'}
                      onChange={(e) =>
                        updateField('welcome.sealShape', e.target.value)
                      }
                    >
                      {SEAL_SHAPES.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="field-box">
                    <label>Contenido / Icono del Sello</label>
                    <select
                      className="field-input"
                      value={editingEvent.welcome.sealIcon || 'initials'}
                      onChange={(e) =>
                        updateField('welcome.sealIcon', e.target.value)
                      }
                    >
                      {SEAL_ICONS.map((ic) => (
                        <option key={ic.id} value={ic.id}>
                          {ic.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="field-box">
                    <label>Tipografía de las Iniciales</label>
                    <select
                      className="field-input"
                      value={
                        editingEvent.welcome.initialsFont || 'serif-editorial'
                      }
                      onChange={(e) =>
                        updateField('welcome.initialsFont', e.target.value)
                      }
                    >
                      {INITIALS_FONTS.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="field-box">
                    <label>Tamaño del Sobre</label>
                    <select
                      className="field-input"
                      value={editingEvent.welcome.envelopeSize || 'standard'}
                      onChange={(e) =>
                        updateField('welcome.envelopeSize', e.target.value)
                      }
                    >
                      {ENVELOPE_SIZES.map((sz) => (
                        <option key={sz.id} value={sz.id}>
                          {sz.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="field-box">
                    <label>Animación del Sello (Invitar a Abrir)</label>
                    <select
                      className="field-input"
                      value={
                        editingEvent.welcome.sealIdleAnimation || 'pulse-glow'
                      }
                      onChange={(e) =>
                        updateField(
                          'welcome.sealIdleAnimation',
                          e.target.value
                        )
                      }
                    >
                      {SEAL_IDLE_ANIMATIONS.map((anim) => (
                        <option key={anim.id} value={anim.id}>
                          {anim.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="field-box">
                    <label>Animación de Apertura</label>
                    <select
                      className="field-input"
                      value={editingEvent.welcome.openAnimation || 'flap-up'}
                      onChange={(e) =>
                        updateField('welcome.openAnimation', e.target.value)
                      }
                    >
                      {OPEN_ANIMATIONS.map((an) => (
                        <option key={an.id} value={an.id}>
                          {an.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Colores personalizados opcionales del sobre */}
                {(() => {
                  const activePreset = getEnvelopePresetById(
                    editingEvent.welcome.envelopeStyle || 'default'
                  );
                  return (
                    <div
                      className="editor-grid-4"
                      style={{ marginTop: '0.5rem' }}
                    >
                      <div className="field-box">
                        <label>Color Papel / Cuerpo</label>
                        <input
                          type="color"
                          className="field-input"
                          style={{ height: '38px', padding: '2px' }}
                          value={
                            editingEvent.welcome.envelopeBgColor?.startsWith(
                              '#'
                            )
                              ? editingEvent.welcome.envelopeBgColor
                              : activePreset.paperBg.startsWith('#')
                              ? activePreset.paperBg
                              : '#f6f1e9'
                          }
                          onChange={(e) =>
                            updateField(
                              'welcome.envelopeBgColor',
                              e.target.value
                            )
                          }
                        />
                      </div>

                      <div className="field-box">
                        <label>Color Forro Interior / Tarjeta</label>
                        <input
                          type="color"
                          className="field-input"
                          style={{ height: '38px', padding: '2px' }}
                          value={
                            editingEvent.welcome.envelopeLinerColor?.startsWith(
                              '#'
                            )
                              ? editingEvent.welcome.envelopeLinerColor
                              : activePreset.linerBg?.startsWith('#')
                              ? activePreset.linerBg
                              : '#9b0c14'
                          }
                          onChange={(e) =>
                            updateField(
                              'welcome.envelopeLinerColor',
                              e.target.value
                            )
                          }
                        />
                      </div>

                      <div className="field-box">
                        <label>Color Solapas</label>
                        <input
                          type="color"
                          className="field-input"
                          style={{ height: '38px', padding: '2px' }}
                          value={
                            editingEvent.welcome.envelopeFlapColor?.startsWith(
                              '#'
                            )
                              ? editingEvent.welcome.envelopeFlapColor
                              : activePreset.flapBg.startsWith('#')
                              ? activePreset.flapBg
                              : '#ede4d6'
                          }
                          onChange={(e) =>
                            updateField(
                              'welcome.envelopeFlapColor',
                              e.target.value
                            )
                          }
                        />
                      </div>

                      <div className="field-box">
                        <label>Color Sello de Lacre</label>
                        <input
                          type="color"
                          className="field-input"
                          style={{ height: '38px', padding: '2px' }}
                          value={
                            editingEvent.welcome.envelopeSealColor?.startsWith(
                              '#'
                            )
                              ? editingEvent.welcome.envelopeSealColor
                              : activePreset.sealBg.startsWith('#')
                              ? activePreset.sealBg
                              : '#c59b27'
                          }
                          onChange={(e) =>
                            updateField(
                              'welcome.envelopeSealColor',
                              e.target.value
                            )
                          }
                        />
                      </div>

                      <div className="field-box">
                        <label>Color Texto y Borde</label>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <input
                            type="color"
                            title="Color de texto"
                            className="field-input"
                            style={{ height: '38px', padding: '2px' }}
                            value={
                              editingEvent.welcome.envelopeTextColor?.startsWith(
                                '#'
                              )
                                ? editingEvent.welcome.envelopeTextColor
                                : activePreset.textColor
                            }
                            onChange={(e) =>
                              updateField(
                                'welcome.envelopeTextColor',
                                e.target.value
                              )
                            }
                          />
                          <input
                            type="color"
                            title="Color de borde"
                            className="field-input"
                            style={{ height: '38px', padding: '2px' }}
                            value={
                              editingEvent.welcome.envelopeBorderColor?.startsWith(
                                '#'
                              )
                                ? editingEvent.welcome.envelopeBorderColor
                                : activePreset.borderColor.startsWith('#')
                                ? activePreset.borderColor
                                : '#d4af37'
                            }
                            onChange={(e) =>
                              updateField(
                                'welcome.envelopeBorderColor',
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Imagen de sobre completa o textura personalizada */}
                <div className="editor-grid-2" style={{ marginTop: '0.35rem' }}>
                  <div className="field-box" style={{ marginBottom: 0 }}>
                    <label>
                      Imagen de Sobre Propia o Textura (Conversión automática a .webp)
                    </label>
                    <div className="upload-inline-row">
                      <input
                        type="text"
                        className="field-input"
                        placeholder="https://... (.webp, .png, .jpg) o sube archivo"
                        value={editingEvent.welcome.envelopeImage || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateField('welcome.envelopeImage', val);
                          if (val.trim()) {
                            updateField('welcome.envelopeStyle', 'custom-image');
                          }
                        }}
                      />
                      <label
                        className="admin-mini-btn"
                        style={{
                          cursor: uploadState.active ? 'not-allowed' : 'pointer',
                          whiteSpace: 'nowrap',
                          opacity: uploadState.active ? 0.65 : 1,
                        }}
                      >
                        <Upload size={14} />
                        {uploadState.active &&
                        uploadState.fieldKey === 'envelopeImage'
                          ? `Subiendo ${uploadState.progress}%`
                          : 'Subir .webp'}
                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          disabled={uploadState.active}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            handleAssetUpload(
                              file,
                              'envelopeImage',
                              'Subiendo y optimizando sobre (.webp)...',
                              (uploadedUrl) => {
                                updateField('welcome.envelopeImage', uploadedUrl);
                                updateField(
                                  'welcome.envelopeStyle',
                                  'custom-image'
                                );
                              }
                            );
                            e.target.value = '';
                          }}
                        />
                      </label>
                    </div>

                    {editingEvent.welcome.envelopeImage && (
                      <div
                        style={{
                          marginTop: '0.6rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '0.5rem 0.65rem',
                          background: '#ffffff',
                          border: '1px solid #dfd8ce',
                        }}
                      >
                        <img
                          src={editingEvent.welcome.envelopeImage}
                          alt="Vista previa del sobre"
                          style={{
                            width: '56px',
                            height: '56px',
                            objectFit: 'contain',
                            background:
                              'repeating-conic-gradient(#eee 0% 25%, #fff 0% 50%) 50% / 12px 12px',
                            border: '1px solid #e5dfd5',
                          }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              color: '#2c2825',
                            }}
                          >
                            Imagen del sobre cargada (.webp)
                          </div>
                          <div
                            style={{
                              fontSize: '0.7rem',
                              color: '#6e6862',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {editingEvent.welcome.envelopeImage}
                          </div>
                        </div>
                        <button
                          type="button"
                          className="admin-mini-btn"
                          style={{ color: '#9b1c1c', padding: '0.35rem 0.6rem' }}
                          onClick={() => {
                            updateField('welcome.envelopeImage', '');
                            if (
                              editingEvent.welcome.envelopeStyle ===
                              'custom-image'
                            ) {
                              updateField('welcome.envelopeStyle', 'default');
                            }
                          }}
                        >
                          <Trash2 size={13} /> Quitar
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="field-box" style={{ marginBottom: 0 }}>
                    <label>
                      Opacidad de Imagen del Sobre (
                      {Math.round(
                        (typeof editingEvent.welcome.envelopeImageOpacity ===
                        'number'
                          ? editingEvent.welcome.envelopeImageOpacity
                          : 0.35) * 100
                      )}
                      %)
                    </label>
                    <input
                      type="range"
                      min="0.05"
                      max="1"
                      step="0.05"
                      style={{ width: '100%', marginTop: '0.5rem' }}
                      value={
                        typeof editingEvent.welcome.envelopeImageOpacity ===
                        'number'
                          ? editingEvent.welcome.envelopeImageOpacity
                          : 0.35
                      }
                      onChange={(e) =>
                        updateField(
                          'welcome.envelopeImageOpacity',
                          Number(e.target.value)
                        )
                      }
                    />
                  </div>
                </div>

                {/* Controles exclusivos cuando se usa Imagen de Sobre Completa (custom-image) */}
                {editingEvent.welcome.envelopeImage && (
                  <div
                    style={{
                      marginTop: '0.85rem',
                      padding: '0.85rem 1rem',
                      backgroundColor: '#ffffff',
                      border: '1px solid #dfd8ce',
                      display: 'grid',
                      gridTemplateColumns:
                        'repeat(auto-fit, minmax(220px, 1fr))',
                      gap: '0.85rem',
                      alignItems: 'center',
                    }}
                  >
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={
                          (editingEvent.welcome.envelopeStyle || 'default') ===
                          'custom-image'
                        }
                        onChange={(e) =>
                          updateField(
                            'welcome.envelopeStyle',
                            e.target.checked ? 'custom-image' : 'default'
                          )
                        }
                      />
                      <span>
                        <strong>Mostrar imagen tal cual como sobre</strong> (sin
                        triángulos CSS)
                      </span>
                    </label>

                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(
                          editingEvent.welcome.hideOverlayTextOnCustomImage
                        )}
                        onChange={(e) =>
                          updateField(
                            'welcome.hideOverlayTextOnCustomImage',
                            e.target.checked
                          )
                        }
                      />
                      <span>
                        Mi imagen ya trae su sello/texto (hacer toda la imagen
                        clickable)
                      </span>
                    </label>

                    {!editingEvent.welcome.hideOverlayTextOnCustomImage && (
                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '0.74rem',
                            color: '#6e6862',
                            marginBottom: '0.25rem',
                          }}
                        >
                          Posición Vertical del Sello sobre la Imagen (
                          {typeof editingEvent.welcome.customSealTop ===
                          'number'
                            ? editingEvent.welcome.customSealTop
                            : 54}
                          %)
                        </label>
                        <input
                          type="range"
                          min="15"
                          max="85"
                          step="1"
                          style={{ width: '100%' }}
                          value={
                            typeof editingEvent.welcome.customSealTop ===
                            'number'
                              ? editingEvent.welcome.customSealTop
                              : 54
                          }
                          onChange={(e) =>
                            updateField(
                              'welcome.customSealTop',
                              Number(e.target.value)
                            )
                          }
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="editor-grid-2">
                <div className="field-box">
                  <label>
                    Etiqueta Superior Portada (ej. ¡Nos Casamos! / Mis XV Años)
                  </label>
                  <input
                    type="text"
                    className="field-input"
                    value={editingEvent.hero.tag}
                    onChange={(e) => updateField('hero.tag', e.target.value)}
                  />
                </div>
                <div className="field-box">
                  <label>Nombre Principal *</label>
                  <input
                    type="text"
                    required
                    className="field-input"
                    value={editingEvent.hero.primaryName}
                    onChange={(e) =>
                      updateField('hero.primaryName', e.target.value)
                    }
                  />
                </div>
                <div className="field-box">
                  <label>
                    Conector (ej. &amp; — dejar vacío si es 1 persona)
                  </label>
                  <input
                    type="text"
                    className="field-input"
                    value={editingEvent.hero.connector}
                    onChange={(e) =>
                      updateField('hero.connector', e.target.value)
                    }
                  />
                </div>
                <div className="field-box">
                  <label>Segundo Nombre (opcional, solo bodas/parejas)</label>
                  <input
                    type="text"
                    className="field-input"
                    value={editingEvent.hero.secondaryName}
                    onChange={(e) =>
                      updateField('hero.secondaryName', e.target.value)
                    }
                  />
                </div>
                <div className="field-box">
                  <label>Fecha y Hora Exacta (para Contador)</label>
                  <input
                    type="datetime-local"
                    required
                    className="field-input"
                    value={editingEvent.hero.dateISO.slice(0, 16)}
                    onChange={(e) =>
                      updateField('hero.dateISO', `${e.target.value}:00`)
                    }
                  />
                  <label
                    className="checkbox-row"
                    style={{ marginTop: '0.55rem', fontSize: '0.8rem' }}
                  >
                    <input
                      type="checkbox"
                      checked={editingEvent.hero.showCalendarButton !== false}
                      onChange={(e) =>
                        updateField(
                          'hero.showCalendarButton',
                          e.target.checked
                        )
                      }
                    />
                    Mostrar botón &quot;Agendar en Calendario&quot; debajo del contador
                  </label>
                </div>
                <div className="field-box">
                  <label>Fecha Visible en Portada</label>
                  <input
                    type="text"
                    className="field-input"
                    placeholder="19 . DICIEMBRE . 2026"
                    value={editingEvent.hero.dateDisplay}
                    onChange={(e) =>
                      updateField('hero.dateDisplay', e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="field-box">
                <label>Fotografía Principal de Portada (URL o Subir Imagen)</label>
                <div className="upload-inline-row">
                  <input
                    type="text"
                    className="field-input"
                    value={editingEvent.hero.heroImage}
                    onChange={(e) =>
                      updateField('hero.heroImage', e.target.value)
                    }
                  />
                  <label
                    className="admin-mini-btn"
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    <Upload size={15} />
                    {uploadState.active && uploadState.fieldKey === 'hero'
                      ? `${uploadState.progress}%`
                      : 'Subir'}
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      disabled={uploadState.active}
                      onChange={(e) => {
                        handleAssetUpload(
                          e.target.files?.[0],
                          'hero',
                          'Subiendo foto de portada...',
                          (url) => {
                            updateField('hero.heroImage', url);
                            updateField('album.avatarImage', url);
                          }
                        );
                        e.target.value = '';
                      }}
                    />
                  </label>
                </div>
              </div>

              <div
                className={`repeat-subcard ${
                  !isMusicEnabled ? 'disabled-block' : ''
                }`}
                style={{ marginTop: '0.75rem', marginBottom: 0 }}
              >
                <div className="subcard-header">
                  <label className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={isMusicEnabled}
                      onChange={(e) =>
                        updateField('hero.musicEnabled', e.target.checked)
                      }
                    />
                    Activar música de fondo al abrir invitación
                  </label>
                  <span style={{ fontSize: '0.75rem', color: '#6e6862' }}>
                    {isMusicEnabled ? 'Con música' : 'Sin música'}
                  </span>
                </div>

                {isMusicEnabled && (
                  <div className="field-box" style={{ marginBottom: 0 }}>
                    <label>Música de Fondo (.mp3 URL o Subir MP3)</label>
                    <div className="upload-inline-row">
                      <input
                        type="text"
                        className="field-input"
                        value={editingEvent.hero.musicUrl}
                        onChange={(e) =>
                          updateField('hero.musicUrl', e.target.value)
                        }
                      />
                      <label
                        className="admin-mini-btn"
                        style={{ whiteSpace: 'nowrap' }}
                      >
                        <Upload size={15} />
                        {uploadState.active && uploadState.fieldKey === 'music'
                          ? `${uploadState.progress}%`
                          : 'Subir MP3'}
                        <input
                          type="file"
                          accept="audio/mp3,audio/mpeg"
                          hidden
                          disabled={uploadState.active}
                          onChange={(e) => {
                            handleAssetUpload(
                              e.target.files?.[0],
                              'music',
                              'Subiendo música MP3...',
                              (url) => updateField('hero.musicUrl', url)
                            );
                            e.target.value = '';
                          }}
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {renderSectionBackgroundControl('countdown', 'Cuenta Regresiva')}
            </div>

            {/* 3. FRASE Y ROLES FAMILIARES OPCIONALES */}
            <div className="editor-card">
              <h3 className="editor-section-title">
                <span>3. Frase y Padres / Padrinos</span>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <label className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={editingEvent.familySection.enabled !== false}
                      onChange={(e) =>
                        updateField('familySection.enabled', e.target.checked)
                      }
                    />
                    Mostrar sección familiar
                  </label>
                  {editingEvent.familySection.enabled !== false && (
                    <button
                      type="button"
                      className="admin-mini-btn"
                      onClick={() =>
                        updateField('familySection.groups', [
                          ...editingEvent.familySection.groups,
                          {
                            id: `grp_${Date.now()}`,
                            enabled: true,
                            role: 'Nuevo Rol (ej. Padrinos)',
                            members: ['Nombre 1', 'Nombre 2'],
                          },
                        ])
                      }
                    >
                      <Plus size={14} /> Agregar Rol
                    </button>
                  )}
                </div>
              </h3>

              <div className="editor-grid-2">
                <div className="field-box">
                  <label>Frase Romántica / Bendición</label>
                  <input
                    type="text"
                    className="field-input"
                    value={editingEvent.quote.text}
                    onChange={(e) => updateField('quote.text', e.target.value)}
                  />
                </div>
                <div className="field-box">
                  <label>Autor de la Frase</label>
                  <input
                    type="text"
                    className="field-input"
                    value={editingEvent.quote.author}
                    onChange={(e) =>
                      updateField('quote.author', e.target.value)
                    }
                  />
                </div>
              </div>

              {editingEvent.familySection.enabled !== false && (
                <>
                  <div className="field-box">
                    <label>Subtítulo de Sección Familiar</label>
                    <input
                      type="text"
                      className="field-input"
                      value={editingEvent.familySection.subtitle}
                      onChange={(e) =>
                        updateField('familySection.subtitle', e.target.value)
                      }
                    />
                  </div>
                  <div className="editor-grid-2">
                    {editingEvent.familySection.groups.map((grp, gIdx) => {
                      const isGroupEnabled = grp.enabled !== false;
                      return (
                        <div
                          key={grp.id || gIdx}
                          className={`repeat-subcard ${
                            !isGroupEnabled ? 'disabled-block' : ''
                          }`}
                        >
                          <div className="subcard-header">
                            <label className="checkbox-row">
                              <input
                                type="checkbox"
                                checked={isGroupEnabled}
                                onChange={(e) => {
                                  const next = [
                                    ...editingEvent.familySection.groups,
                                  ];
                                  next[gIdx].enabled = e.target.checked;
                                  updateField('familySection.groups', next);
                                }}
                              />
                              Mostrar {grp.role || `Rol #${gIdx + 1}`}
                            </label>

                            {editingEvent.familySection.groups.length > 1 && (
                              <button
                                type="button"
                                className="admin-mini-btn danger"
                                style={{ padding: '0.3rem 0.5rem' }}
                                title="Eliminar rol"
                                onClick={() => {
                                  const next =
                                    editingEvent.familySection.groups.filter(
                                      (_, i) => i !== gIdx
                                    );
                                  updateField('familySection.groups', next);
                                }}
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>

                          <div className="field-box">
                            <label>
                              Título del Rol (ej. Padres / Padrinos / Damas)
                            </label>
                            <input
                              type="text"
                              className="field-input"
                              value={grp.role}
                              onChange={(e) => {
                                const next = [
                                  ...editingEvent.familySection.groups,
                                ];
                                next[gIdx].role = e.target.value;
                                updateField('familySection.groups', next);
                              }}
                            />
                          </div>
                          <div className="field-box" style={{ marginBottom: 0 }}>
                            <label>Nombres (uno por línea)</label>
                            <textarea
                              rows="2"
                              className="field-input"
                              value={grp.members.join('\n')}
                              onChange={(e) => {
                                const next = [
                                  ...editingEvent.familySection.groups,
                                ];
                                next[gIdx].members = e.target.value.split('\n');
                                updateField('familySection.groups', next);
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {renderSectionBackgroundControl('familyQuote', 'Frase y Familia')}
            </div>

            {/* 4. UBICACIONES */}
            <div className="editor-card">
              <h3 className="editor-section-title">
                <span>4. Ceremonia y Recepción</span>
                <button
                  type="button"
                  className="admin-mini-btn"
                  onClick={() =>
                    updateField('events', [
                      ...editingEvent.events,
                      {
                        id: `ev_${Date.now()}`,
                        enabled: true,
                        icon: 'wine',
                        type: 'Nuevo Lugar',
                        time: '20:00 HRS',
                        venue: '',
                        address: '',
                        mapUrl: 'https://maps.google.com',
                      },
                    ])
                  }
                >
                  <Plus size={14} /> Agregar Lugar
                </button>
              </h3>

              {editingEvent.events.map((loc, idx) => {
                const isLocEnabled = loc.enabled !== false;
                return (
                  <div
                    key={loc.id || idx}
                    className={`repeat-subcard ${
                      !isLocEnabled ? 'disabled-block' : ''
                    }`}
                  >
                    <div className="subcard-header">
                      <label className="checkbox-row">
                        <input
                          type="checkbox"
                          checked={isLocEnabled}
                          onChange={(e) => {
                            const next = [...editingEvent.events];
                            next[idx].enabled = e.target.checked;
                            updateField('events', next);
                          }}
                        />
                        Mostrar acto: {loc.type || `Lugar #${idx + 1}`}
                      </label>

                      {editingEvent.events.length > 1 && (
                        <button
                          type="button"
                          className="admin-mini-btn danger"
                          style={{ padding: '0.3rem 0.5rem' }}
                          title="Eliminar ubicación"
                          onClick={() => {
                            const next = editingEvent.events.filter(
                              (_, i) => i !== idx
                            );
                            updateField('events', next);
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>

                    <div className="editor-grid-4">
                      <div className="field-box">
                        <label>Tipo de Acto</label>
                        <input
                          type="text"
                          className="field-input"
                          value={loc.type}
                          onChange={(e) => {
                            const next = [...editingEvent.events];
                            next[idx].type = e.target.value;
                            updateField('events', next);
                          }}
                        />
                      </div>
                      <div className="field-box">
                        <label>Hora</label>
                        <input
                          type="text"
                          className="field-input"
                          value={loc.time}
                          onChange={(e) => {
                            const next = [...editingEvent.events];
                            next[idx].time = e.target.value;
                            updateField('events', next);
                          }}
                        />
                      </div>
                      <div className="field-box">
                        <label>Icono</label>
                        <select
                          className="field-input"
                          value={loc.icon}
                          onChange={(e) => {
                            const next = [...editingEvent.events];
                            next[idx].icon = e.target.value;
                            updateField('events', next);
                          }}
                        >
                          <option value="church">Iglesia</option>
                          <option value="wine">Copas / Brindis</option>
                          <option value="sparkles">Fiesta / Vals</option>
                          <option value="utensils">Comida / Banquete</option>
                        </select>
                      </div>
                      <div className="field-box">
                        <label>Nombre del Lugar</label>
                        <input
                          type="text"
                          className="field-input"
                          value={loc.venue}
                          onChange={(e) => {
                            const next = [...editingEvent.events];
                            next[idx].venue = e.target.value;
                            updateField('events', next);
                          }}
                        />
                      </div>
                    </div>
                    <div className="editor-grid-2">
                      <div className="field-box" style={{ marginBottom: 0 }}>
                        <label>Dirección</label>
                        <input
                          type="text"
                          className="field-input"
                          value={loc.address}
                          onChange={(e) => {
                            const next = [...editingEvent.events];
                            next[idx].address = e.target.value;
                            updateField('events', next);
                          }}
                        />
                      </div>
                      <div className="field-box" style={{ marginBottom: 0 }}>
                        <label>Enlace Google Maps</label>
                        <input
                          type="url"
                          className="field-input"
                          value={loc.mapUrl}
                          onChange={(e) => {
                            const next = [...editingEvent.events];
                            next[idx].mapUrl = e.target.value;
                            updateField('events', next);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}

              {renderSectionBackgroundControl('locations', 'Itinerario')}
            </div>

            {/* 5. VESTIMENTA Y MESA DE REGALOS */}
            <div className="editor-card">
              <h3 className="editor-section-title">
                <span>5. Vestimenta y Mesa de Regalos</span>
              </h3>

              <div
                className={`repeat-subcard ${
                  !isDressCodeEnabled ? 'disabled-block' : ''
                }`}
              >
                <div className="subcard-header">
                  <label className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={isDressCodeEnabled}
                      onChange={(e) =>
                        updateField('dressCode.enabled', e.target.checked)
                      }
                    />
                    Activar Código de Vestimenta
                  </label>
                </div>

                {isDressCodeEnabled && (
                  <div className="editor-grid-2">
                    <div className="field-box" style={{ marginBottom: 0 }}>
                      <label>Código de Vestimenta (Título)</label>
                      <input
                        type="text"
                        className="field-input"
                        value={editingEvent.dressCode.title}
                        onChange={(e) =>
                          updateField('dressCode.title', e.target.value)
                        }
                      />
                    </div>
                    <div className="field-box" style={{ marginBottom: 0 }}>
                      <label>Descripción Vestimenta</label>
                      <input
                        type="text"
                        className="field-input"
                        value={editingEvent.dressCode.description}
                        onChange={(e) =>
                          updateField('dressCode.description', e.target.value)
                        }
                      />
                    </div>
                  </div>
                )}
              </div>

              <div
                className={`repeat-subcard ${
                  !isGiftsEnabled ? 'disabled-block' : ''
                }`}
                style={{ marginBottom: 0 }}
              >
                <div className="subcard-header">
                  <label className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={isGiftsEnabled}
                      onChange={(e) =>
                        updateField('gifts.enabled', e.target.checked)
                      }
                    />
                    Activar Mesa de Regalos
                  </label>
                </div>

                {isGiftsEnabled && (
                  <>
                    <div className="editor-grid-2">
                      <div className="field-box">
                        <label>Subtítulo Mesa de Regalos</label>
                        <input
                          type="text"
                          className="field-input"
                          value={editingEvent.gifts.subtitle}
                          onChange={(e) =>
                            updateField('gifts.subtitle', e.target.value)
                          }
                        />
                      </div>
                      <div className="field-box">
                        <label>Mensaje de Invitación a Regalo</label>
                        <input
                          type="text"
                          className="field-input"
                          value={editingEvent.gifts.message}
                          onChange={(e) =>
                            updateField('gifts.message', e.target.value)
                          }
                        />
                      </div>
                    </div>

                    <div
                      className={`repeat-subcard ${
                        !isBankEnabled ? 'disabled-block' : ''
                      }`}
                      style={{ background: '#ffffff' }}
                    >
                      <div className="subcard-header">
                        <label className="checkbox-row">
                          <input
                            type="checkbox"
                            checked={isBankEnabled}
                            onChange={(e) =>
                              updateField('gifts.bank.enabled', e.target.checked)
                            }
                          />
                          Activar Transferencia / Datos Bancarios
                        </label>
                      </div>

                      {isBankEnabled && (
                        <div className="editor-grid-2">
                          <div className="field-box" style={{ marginBottom: 0 }}>
                            <label>Banco</label>
                            <input
                              type="text"
                              className="field-input"
                              value={editingEvent.gifts.bank.bankName}
                              onChange={(e) =>
                                updateField(
                                  'gifts.bank.bankName',
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <div className="field-box" style={{ marginBottom: 0 }}>
                            <label>Titular</label>
                            <input
                              type="text"
                              className="field-input"
                              value={editingEvent.gifts.bank.holder}
                              onChange={(e) =>
                                updateField('gifts.bank.holder', e.target.value)
                              }
                            />
                          </div>
                          <div
                            className="field-box"
                            style={{ gridColumn: '1 / -1', marginBottom: 0 }}
                          >
                            <label>CLABE Interbancaria</label>
                            <input
                              type="text"
                              className="field-input"
                              value={editingEvent.gifts.bank.clabe}
                              onChange={(e) =>
                                updateField('gifts.bank.clabe', e.target.value)
                              }
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div
                      className={`repeat-subcard ${
                        !isStoreEnabled ? 'disabled-block' : ''
                      }`}
                      style={{ background: '#ffffff', marginBottom: 0 }}
                    >
                      <div className="subcard-header">
                        <label className="checkbox-row">
                          <input
                            type="checkbox"
                            checked={isStoreEnabled}
                            onChange={(e) =>
                              updateField(
                                'gifts.storeRegistry.enabled',
                                e.target.checked
                              )
                            }
                          />
                          Activar Tienda Mesa de Regalos
                        </label>
                      </div>

                      {isStoreEnabled && (
                        <div className="editor-grid-2">
                          <div className="field-box" style={{ marginBottom: 0 }}>
                            <label>
                              Tienda Mesa de Regalos (dejar vacío si no aplica)
                            </label>
                            <input
                              type="text"
                              className="field-input"
                              placeholder="ej. Liverpool / Amazon"
                              value={editingEvent.gifts.storeRegistry.storeName}
                              onChange={(e) =>
                                updateField(
                                  'gifts.storeRegistry.storeName',
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <div className="field-box" style={{ marginBottom: 0 }}>
                            <label>Número de Evento Tienda</label>
                            <input
                              type="text"
                              className="field-input"
                              value={
                                editingEvent.gifts.storeRegistry.eventNumber
                              }
                              onChange={(e) =>
                                updateField(
                                  'gifts.storeRegistry.eventNumber',
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <div
                            className="field-box"
                            style={{ gridColumn: '1 / -1', marginBottom: 0 }}
                          >
                            <label>URL Mesa de Regalos</label>
                            <input
                              type="url"
                              className="field-input"
                              value={editingEvent.gifts.storeRegistry.url}
                              onChange={(e) =>
                                updateField(
                                  'gifts.storeRegistry.url',
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {renderSectionBackgroundControl(
                'dressCodeGifts',
                'Vestimenta y Regalos'
              )}
            </div>

            {/* 6. GALERÍA / CARRUSEL DE FOTOS Y VIDEOS DE LA INVITACIÓN */}
            <div className="editor-card">
              <h3 className="editor-section-title">
                <span>6. Galería / Carrusel de Fotos y Videos</span>
                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={isGalleryEnabled}
                    onChange={(e) =>
                      updateField('gallery.enabled', e.target.checked)
                    }
                  />
                  Mostrar Galería en Invitación
                </label>
              </h3>

              {isGalleryEnabled && (
                <>
                  <div className="editor-grid-2">
                    <div className="field-box">
                      <label>Subtítulo de la Galería</label>
                      <input
                        type="text"
                        className="field-input"
                        placeholder="Nuestros Momentos"
                        value={editingEvent.gallery?.subtitle || ''}
                        onChange={(e) =>
                          updateField('gallery.subtitle', e.target.value)
                        }
                      />
                    </div>
                    <div className="field-box">
                      <label>Título de la Galería</label>
                      <input
                        type="text"
                        className="field-input"
                        placeholder="Galería"
                        value={editingEvent.gallery?.title || ''}
                        onChange={(e) =>
                          updateField('gallery.title', e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="editor-grid-2" style={{ alignItems: 'end' }}>
                    <div className="field-box" style={{ marginBottom: 0 }}>
                      <label>Subir Fotos o Videos (Selección Múltiple)</label>
                      <label
                        className="btn-solid"
                        style={{ width: '100%', cursor: 'pointer' }}
                      >
                        <Upload size={16} />
                        Seleccionar Fotos / Videos
                        <input
                          type="file"
                          accept="image/*,video/mp4,video/quicktime,video/webm,video/x-m4v"
                          multiple
                          hidden
                          disabled={uploadState.active}
                          onChange={(e) => {
                            handleGalleryMultiUpload(e.target.files);
                            e.target.value = '';
                          }}
                        />
                      </label>
                    </div>

                    <div className="field-box" style={{ marginBottom: 0 }}>
                      <label>O agregar mediante URL externa</label>
                      <div className="upload-inline-row">
                        <input
                          type="url"
                          className="field-input"
                          placeholder="https://... (.jpg, .png, .mp4)"
                          value={newGalleryUrl}
                          onChange={(e) => setNewGalleryUrl(e.target.value)}
                        />
                        <button
                          type="button"
                          className="admin-mini-btn"
                          style={{ whiteSpace: 'nowrap', padding: '0.72rem 0.9rem' }}
                          onClick={handleAddGalleryByUrl}
                        >
                          <Link2 size={15} /> Agregar
                        </button>
                      </div>
                    </div>
                  </div>

                  {galleryPhotos.length === 0 ? (
                    <p
                      style={{
                        color: '#6e6862',
                        fontSize: '0.85rem',
                        marginTop: '1.25rem',
                        padding: '1rem',
                        background: '#faf8f5',
                        border: '1px dashed #dcd5ca',
                        textAlign: 'center',
                      }}
                    >
                      No hay elementos en la galería. Sube fotos o videos para
                      activar el carrusel.
                    </p>
                  ) : (
                    <>
                      <p
                        style={{
                          fontSize: '0.78rem',
                          color: '#6e6862',
                          marginTop: '1.1rem',
                        }}
                      >
                        {galleryPhotos.length === 1
                          ? '1 elemento cargado (se mostrará centrado). Agrega 2 o más para activar el carrusel automático.'
                          : `${galleryPhotos.length} elementos cargados (se mostrarán en carrusel interactivo). Usa las flechas para cambiar el orden.`}
                      </p>

                      <div className="admin-gallery-manager-grid">
                        {galleryPhotos.map((item, idx) => {
                          const isVid = isVideoMedia(item);
                          return (
                            <div
                              key={item.id || idx}
                              className="admin-gallery-item-card"
                            >
                              <div className="admin-gallery-preview-box">
                                {isVid ? (
                                  <>
                                    <video
                                      src={`${item.url}#t=0.1`}
                                      muted
                                      playsInline
                                      preload="metadata"
                                    />
                                    <span className="admin-gallery-type-badge">
                                      <Play size={10} fill="#ffffff" /> Video
                                    </span>
                                  </>
                                ) : (
                                  <img
                                    src={item.url}
                                    alt={item.alt || `Slide ${idx + 1}`}
                                    loading="lazy"
                                  />
                                )}
                                <span className="admin-gallery-order-badge">
                                  #{idx + 1}
                                </span>
                              </div>

                              <input
                                type="text"
                                className="field-input"
                                style={{ padding: '0.45rem 0.6rem', fontSize: '0.78rem' }}
                                placeholder="Descripción corta (opcional)"
                                value={item.alt || ''}
                                onChange={(e) => {
                                  const next = [...galleryPhotos];
                                  next[idx] = { ...next[idx], alt: e.target.value };
                                  updateField('gallery.photos', next);
                                }}
                              />

                              <div className="admin-gallery-controls">
                                <button
                                  type="button"
                                  className="admin-mini-btn"
                                  disabled={idx === 0}
                                  title="Mover antes"
                                  onClick={() => handleMoveGalleryItem(idx, -1)}
                                >
                                  <ArrowLeft size={14} />
                                </button>
                                <button
                                  type="button"
                                  className="admin-mini-btn"
                                  disabled={idx === galleryPhotos.length - 1}
                                  title="Mover después"
                                  onClick={() => handleMoveGalleryItem(idx, 1)}
                                >
                                  <ArrowRight size={14} />
                                </button>
                                <button
                                  type="button"
                                  className="admin-mini-btn danger"
                                  title="Eliminar de la galería"
                                  onClick={() => handleRemoveGalleryItem(idx)}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </>
              )}

              {renderSectionBackgroundControl('gallery', 'Galería')}
            </div>

            {/* 7. SECCIONES PERSONALIZADAS TIPO HERO (PANTALLA COMPLETA 100vh) */}
            <div className="editor-card">
              <h3 className="editor-section-title">
                <span>7. Secciones Personalizadas Tipo Hero (Pantalla Completa)</span>
                <button
                  type="button"
                  className="btn-solid"
                  style={{ padding: '0.6rem 1.2rem' }}
                  onClick={handleAddCustomHero}
                >
                  <Plus size={15} /> Agregar Sección Hero
                </button>
              </h3>

              <p
                style={{
                  fontSize: '0.83rem',
                  color: '#6e6862',
                  marginBottom: '1rem',
                }}
              >
                Crea bloques fotográficos a pantalla completa (100vh) con textos
                personalizados encima. Después puedes ubicarlos en cualquier lugar
                de la invitación en la sección 9.
              </p>

              {customHeroes.length === 0 ? (
                <p
                  style={{
                    color: '#6e6862',
                    fontSize: '0.85rem',
                    padding: '1rem',
                    background: '#faf8f5',
                    border: '1px dashed #dcd5ca',
                    textAlign: 'center',
                  }}
                >
                  No has agregado secciones personalizadas tipo Hero aún.
                </p>
              ) : (
                customHeroes.map((ch, idx) => {
                  const isChEnabled = ch.enabled !== false;
                  const chUploadKey = `custom_hero_bg_${ch.id}`;

                  return (
                    <div
                      key={ch.id || idx}
                      className={`repeat-subcard ${
                        !isChEnabled ? 'disabled-block' : ''
                      }`}
                    >
                      <div className="subcard-header">
                        <label className="checkbox-row">
                          <input
                            type="checkbox"
                            checked={isChEnabled}
                            onChange={(e) =>
                              handleUpdateCustomHero(
                                idx,
                                'enabled',
                                e.target.checked
                              )
                            }
                          />
                          Mostrar Hero Personalizado #{idx + 1}
                        </label>

                        <button
                          type="button"
                          className="admin-mini-btn danger"
                          style={{ padding: '0.3rem 0.6rem' }}
                          onClick={() => handleRemoveCustomHero(idx)}
                        >
                          <Trash2 size={13} /> Eliminar
                        </button>
                      </div>

                      <div className="editor-grid-2">
                        <div className="field-box">
                          <label>Etiqueta Superior (opcional)</label>
                          <input
                            type="text"
                            className="field-input"
                            placeholder="ej. Nuestra Historia / Recepción"
                            value={ch.eyebrow || ''}
                            onChange={(e) =>
                              handleUpdateCustomHero(
                                idx,
                                'eyebrow',
                                e.target.value
                              )
                            }
                          />
                        </div>

                        <div className="field-box">
                          <label>Título Principal (opcional)</label>
                          <input
                            type="text"
                            className="field-input"
                            placeholder="ej. Un nuevo comienzo"
                            value={ch.title || ''}
                            onChange={(e) =>
                              handleUpdateCustomHero(
                                idx,
                                'title',
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>

                      <div className="field-box">
                        <label>Texto / Mensaje Superpuesto (opcional)</label>
                        <textarea
                          rows="3"
                          className="field-input"
                          placeholder="Escribe un mensaje, dedicatoria o información adicional..."
                          value={ch.bodyText || ''}
                          onChange={(e) =>
                            handleUpdateCustomHero(
                              idx,
                              'bodyText',
                              e.target.value
                            )
                          }
                        />
                      </div>

                      <div className="editor-grid-2">
                        <div className="field-box">
                          <label>Fotografía de Fondo (100vh)</label>
                          <div className="upload-inline-row">
                            <input
                              type="text"
                              className="field-input"
                              placeholder="URL o sube fotografía"
                              value={ch.backgroundImage || ''}
                              onChange={(e) =>
                                handleUpdateCustomHero(
                                  idx,
                                  'backgroundImage',
                                  e.target.value
                                )
                              }
                            />
                            <label
                              className="admin-mini-btn"
                              style={{ whiteSpace: 'nowrap' }}
                            >
                              <Upload size={15} />
                              {uploadState.active &&
                              uploadState.fieldKey === chUploadKey
                                ? `${uploadState.progress}%`
                                : 'Subir'}
                              <input
                                type="file"
                                accept="image/*"
                                hidden
                                disabled={uploadState.active}
                                onChange={(e) => {
                                  handleAssetUpload(
                                    e.target.files?.[0],
                                    chUploadKey,
                                    `Subiendo foto Hero #${idx + 1}...`,
                                    (url) =>
                                      handleUpdateCustomHero(
                                        idx,
                                        'backgroundImage',
                                        url
                                      )
                                  );
                                  e.target.value = '';
                                }}
                              />
                            </label>
                          </div>
                        </div>

                        <div className="editor-grid-2">
                          <div className="field-box">
                            <label>Alineación Texto</label>
                            <select
                              className="field-input"
                              value={ch.alignment || 'center'}
                              onChange={(e) =>
                                handleUpdateCustomHero(
                                  idx,
                                  'alignment',
                                  e.target.value
                                )
                              }
                            >
                              <option value="center">Centrado</option>
                              <option value="left">Izquierda</option>
                              <option value="right">Derecha</option>
                            </select>
                          </div>

                          <div className="field-box">
                            <label>
                              Oscurecimiento ({ch.overlayOpacity ?? 45}%)
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="85"
                              value={ch.overlayOpacity ?? 45}
                              onChange={(e) =>
                                handleUpdateCustomHero(
                                  idx,
                                  'overlayOpacity',
                                  Number(e.target.value)
                                )
                              }
                            />
                          </div>
                        </div>
                      </div>

                      <div className="editor-grid-2">
                        <div className="field-box" style={{ marginBottom: 0 }}>
                          <label>Texto Botón Opcional</label>
                          <input
                            type="text"
                            className="field-input"
                            placeholder="ej. Ver Ubicación / Más Info"
                            value={ch.buttonText || ''}
                            onChange={(e) =>
                              handleUpdateCustomHero(
                                idx,
                                'buttonText',
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className="field-box" style={{ marginBottom: 0 }}>
                          <label>Enlace del Botón Opcional</label>
                          <input
                            type="text"
                            className="field-input"
                            placeholder="https://... o #cuenta-regresiva"
                            value={ch.buttonUrl || ''}
                            onChange={(e) =>
                              handleUpdateCustomHero(
                                idx,
                                'buttonUrl',
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* 8. ÁLBUM COLABORATIVO Y RSVP */}
            <div className="editor-card">
              <h3 className="editor-section-title">
                <span>
                  8. Álbum Colaborativo (/{editingEvent.slug || 'evento'}/album)
                  y RSVP
                </span>
                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={editingEvent.album.enabled}
                    onChange={(e) =>
                      updateField('album.enabled', e.target.checked)
                    }
                  />
                  Activar Álbum QR
                </label>
              </h3>

              <div className="editor-grid-2">
                <div className="field-box">
                  <label>Encabezado en Página del Álbum</label>
                  <input
                    type="text"
                    className="field-input"
                    value={editingEvent.album.pageHeading}
                    onChange={(e) =>
                      updateField('album.pageHeading', e.target.value)
                    }
                  />
                </div>
                <div className="field-box">
                  <label>Avatar Circular del Álbum</label>
                  <div className="upload-inline-row">
                    <input
                      type="text"
                      className="field-input"
                      value={editingEvent.album.avatarImage}
                      onChange={(e) =>
                        updateField('album.avatarImage', e.target.value)
                      }
                    />
                    <label
                      className="admin-mini-btn"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      <Upload size={15} />
                      {uploadState.active && uploadState.fieldKey === 'avatar'
                        ? `${uploadState.progress}%`
                        : 'Subir'}
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        disabled={uploadState.active}
                        onChange={(e) => {
                          handleAssetUpload(
                            e.target.files?.[0],
                            'avatar',
                            'Subiendo avatar del álbum...',
                            (url) => updateField('album.avatarImage', url)
                          );
                          e.target.value = '';
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div className="field-box">
                  <label>WhatsApp Confirmación (521 + 10 dígitos)</label>
                  <input
                    type="text"
                    required
                    className="field-input"
                    placeholder="5214531234567"
                    value={editingEvent.rsvp.whatsappPhone}
                    onChange={(e) =>
                      updateField('rsvp.whatsappPhone', e.target.value)
                    }
                  />
                </div>

                <div className="field-box">
                  <label>Monograma Pie de Página</label>
                  <input
                    type="text"
                    className="field-input"
                    value={editingEvent.footer.monogram}
                    onChange={(e) =>
                      updateField('footer.monogram', e.target.value)
                    }
                  />
                </div>
              </div>

              {renderSectionBackgroundControl('album', 'Álbum QR')}
              {renderSectionBackgroundControl('rsvp', 'Confirmación RSVP')}
            </div>

            {/* 9. ORDEN DE VISUALIZACIÓN DE LAS SECCIONES */}
            <div className="editor-card">
              <h3 className="editor-section-title">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Layers size={20} /> 9. Orden de Visualización de las Secciones
                </span>
              </h3>
              <p
                style={{
                  fontSize: '0.83rem',
                  color: '#6e6862',
                  marginBottom: '1rem',
                }}
              >
                La Portada Principal siempre abre la invitación y el Pie de Página
                la cierra. Usa las flechas para decidir el orden exacto de todas
                las secciones intermedias (incluidos tus Hero personalizados).
              </p>

              <div className="section-order-list">
                {currentSectionOrder.map((key, idx) => {
                  const meta = getSectionOrderMeta(key);
                  return (
                    <div
                      key={key}
                      className={`section-order-row ${
                        meta.isCustom ? 'is-custom-hero' : ''
                      }`}
                    >
                      <div className="section-order-info">
                        <span className="section-order-num">{idx + 1}</span>
                        <span className="section-order-label">{meta.label}</span>
                        {meta.isCustom && (
                          <span className="section-order-tag">Hero Extra</span>
                        )}
                        {!meta.active && (
                          <span className="section-order-tag inactive">
                            Oculta / Sin datos
                          </span>
                        )}
                      </div>

                      <div className="section-order-actions">
                        <button
                          type="button"
                          className="admin-mini-btn"
                          disabled={idx === 0}
                          title="Subir sección"
                          onClick={() => handleMoveSectionOrder(idx, -1)}
                        >
                          <ArrowUp size={15} />
                        </button>
                        <button
                          type="button"
                          className="admin-mini-btn"
                          disabled={idx === currentSectionOrder.length - 1}
                          title="Bajar sección"
                          onClick={() => handleMoveSectionOrder(idx, 1)}
                        >
                          <ArrowDown size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="editor-sticky-bar">
              <button
                type="button"
                className="btn-outline"
                onClick={() => setEditingEvent(null)}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-solid"
                disabled={saving || uploadState.active}
              >
                <Save size={16} />
                {saving ? 'Guardando...' : 'Guardar Invitación'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
