const RELOAD_GUARD_KEY = 'invite_last_forced_reload_build';

/**
 * Compara la versión compilada en este bundle (__APP_BUILD_ID__) contra /version.json
 * en el servidor. Si detecta un despliegue nuevo, limpia cachés del navegador (si aplica)
 * y recarga la página una sola vez de forma segura.
 */
export async function checkForNewBuildAndReload() {
  if (typeof window === 'undefined' || import.meta.env.DEV) return;

  const currentBuild =
    typeof __APP_BUILD_ID__ !== 'undefined' ? String(__APP_BUILD_ID__) : '';
  if (!currentBuild) return;

  try {
    const res = await fetch(`/version.json?t=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
      },
    });
    if (!res.ok) return;

    const data = await res.json();
    const serverBuild = String(data?.buildId || '');
    if (!serverBuild || serverBuild === currentBuild) return;

    // Evitar bucles de recarga si un proxy intermedio aún sirve HTML viejo
    const alreadyReloadedFor = sessionStorage.getItem(RELOAD_GUARD_KEY);
    if (alreadyReloadedFor === serverBuild) return;
    sessionStorage.setItem(RELOAD_GUARD_KEY, serverBuild);

    if ('caches' in window) {
      const keys = await window.caches.keys();
      await Promise.all(keys.map((k) => window.caches.delete(k)));
    }

    window.location.reload();
  } catch {
    // Ignorar fallos silenciosos cuando el usuario está sin red
  }
}

export function initAutoVersionUpdater() {
  if (typeof window === 'undefined' || import.meta.env.DEV) return;

  // 1. Verificar inmediatamente al abrir la app
  checkForNewBuildAndReload();

  // 2. Verificar cada vez que el usuario regresa a la pestaña / app en móvil
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      checkForNewBuildAndReload();
    }
  });

  // 3. Si Vite intenta cargar un chunk .js antiguo eliminado en el nuevo despliegue, recargar
  window.addEventListener('vite:preloadError', () => {
    window.location.reload();
  });
}
