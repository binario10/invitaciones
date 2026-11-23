/**
 * Sube un FormData mediante XMLHttpRequest reportando progreso real (0% a 100%)
 * y espera confirmación JSON del servidor antes de resolver.
 */
export function uploadWithProgress({
  url,
  formData,
  headers = {},
  onProgress,
}) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);

    Object.entries(headers).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        xhr.setRequestHeader(key, value);
      }
    });

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && typeof onProgress === 'function') {
        const pct = Math.min(99, Math.round((event.loaded / event.total) * 100));
        onProgress(pct);
      }
    };

    xhr.onload = () => {
      let data = null;
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        data = null;
      }

      if (xhr.status >= 200 && xhr.status < 300 && data?.success) {
        if (typeof onProgress === 'function') {
          onProgress(100);
        }
        resolve(data);
      } else {
        const serverMsg =
          data?.message ||
          (xhr.status === 413
            ? 'El archivo supera el tamaño máximo permitido por el servidor.'
            : `Error del servidor (${xhr.status || 'desconocido'}).`);
        reject(new Error(serverMsg));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Error de red o conexión interrumpida durante la subida.'));
    };

    xhr.onabort = () => {
      reject(new Error('La subida fue cancelada.'));
    };

    xhr.send(formData);
  });
}
