<?php
require_once __DIR__ . '/config.php';
handleCors('POST, OPTIONS');
requireAdminAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJson(['success' => false, 'message' => 'Método no permitido'], 405);
}

$contentLength = (int)($_SERVER['CONTENT_LENGTH'] ?? 0);
if ($contentLength > 0 && empty($_POST) && empty($_FILES)) {
    $maxPost = ini_get('post_max_size') ?: 'límite del servidor';
    sendJson([
        'success' => false,
        'message' => "El archivo supera el límite máximo permitido por PHP (post_max_size: {$maxPost}).",
    ], 413);
}

$slug = sanitizeSlug($_POST['slug'] ?? '');
if (!$slug) {
    sendJson(['success' => false, 'message' => 'Primero define un identificador (slug) válido para el evento'], 400);
}

if (!isset($_FILES['asset'])) {
    sendJson(['success' => false, 'message' => 'No se recibió ningún archivo'], 400);
}

if ($_FILES['asset']['error'] !== UPLOAD_ERR_OK) {
    $errCode = $_FILES['asset']['error'];
    $msg = $errCode === UPLOAD_ERR_INI_SIZE
        ? 'El archivo supera upload_max_filesize (' . ini_get('upload_max_filesize') . ') en PHP.'
        : 'Error al subir archivo (código ' . $errCode . ')';
    sendJson(['success' => false, 'message' => $msg], 400);
}

$allowedMimes = [
    'image/jpeg'          => ['ext' => 'jpg',  'mediaType' => 'image'],
    'image/png'           => ['ext' => 'png',  'mediaType' => 'image'],
    'image/webp'          => ['ext' => 'webp', 'mediaType' => 'image'],
    'image/gif'           => ['ext' => 'gif',  'mediaType' => 'image'],
    'audio/mpeg'          => ['ext' => 'mp3',  'mediaType' => 'audio'],
    'audio/mp3'           => ['ext' => 'mp3',  'mediaType' => 'audio'],
    'video/mp4'           => ['ext' => 'mp4',  'mediaType' => 'video'],
    'application/mp4'     => ['ext' => 'mp4',  'mediaType' => 'video'],
    'video/iso.segment'   => ['ext' => 'mp4',  'mediaType' => 'video'],
    'video/quicktime'     => ['ext' => 'mov',  'mediaType' => 'video'],
    'video/webm'          => ['ext' => 'webm', 'mediaType' => 'video'],
    'video/x-m4v'         => ['ext' => 'm4v',  'mediaType' => 'video'],
];

$finfo = class_exists('finfo') ? new finfo(FILEINFO_MIME_TYPE) : null;
$mimeType = $finfo ? strtolower((string)$finfo->file($_FILES['asset']['tmp_name'])) : '';
$browserMime = strtolower((string)($_FILES['asset']['type'] ?? ''));
$originalExt = strtolower(pathinfo($_FILES['asset']['name'], PATHINFO_EXTENSION));

$ext = null;
$mediaType = null;

if (isset($allowedMimes[$mimeType])) {
    $ext = $allowedMimes[$mimeType]['ext'];
    $mediaType = $allowedMimes[$mimeType]['mediaType'];
} elseif (
    in_array($originalExt, ['mp4', 'mov', 'webm', 'm4v'], true) &&
    ($mimeType === 'application/octet-stream' || $mimeType === '' || strpos($mimeType, 'video/') === 0 || strpos($browserMime, 'video/') === 0)
) {
    $ext = $originalExt;
    $mediaType = 'video';
} elseif (
    in_array($originalExt, ['jpg', 'jpeg', 'png', 'webp', 'gif'], true) &&
    ($mimeType === 'application/octet-stream' || $mimeType === '' || strpos($mimeType, 'image/') === 0 || strpos($browserMime, 'image/') === 0)
) {
    $ext = $originalExt === 'jpeg' ? 'jpg' : $originalExt;
    $mediaType = 'image';
}

if (!$ext) {
    sendJson(['success' => false, 'message' => 'Formato no soportado: ' . ($mimeType ?: $originalExt)], 400);
}

$baseDir = getEventosBaseDir();
$mediaDir = $baseDir . DIRECTORY_SEPARATOR . $slug . DIRECTORY_SEPARATOR . 'media';
if (!is_dir($mediaDir)) {
    mkdir($mediaDir, 0755, true);
}

/**
 * Optimiza imágenes estáticas (JPG, PNG, WEBP):
 * - Corrige orientación EXIF (evita fotos verticales giradas desde celular)
 * - Escala proporcionalmente si el lado mayor excede 1920 px
 * - Codifica en formato .webp con calidad 82%
 * Retorna el nombre final del archivo guardado o null si se debe usar fallback directo.
 */
function optimizeAndSaveWebpImage(string $tmpPath, string $sourceExt, string $mediaDir, string $baseId): ?string
{
    if (!extension_loaded('gd') || !function_exists('imagewebp')) {
        return null;
    }

    // Evitar consumir exceso de memoria en imágenes gigantes
    @ini_set('memory_limit', '256M');

    $srcImg = null;
    if ($sourceExt === 'jpg' || $sourceExt === 'jpeg') {
        $srcImg = @imagecreatefromjpeg($tmpPath);
        if ($srcImg && function_exists('exif_read_data')) {
            $exif = @exif_read_data($tmpPath);
            $orientation = (int)($exif['Orientation'] ?? 1);
            if ($orientation === 3) {
                $srcImg = imagerotate($srcImg, 180, 0);
            } elseif ($orientation === 6) {
                $srcImg = imagerotate($srcImg, -90, 0);
            } elseif ($orientation === 8) {
                $srcImg = imagerotate($srcImg, 90, 0);
            }
        }
    } elseif ($sourceExt === 'png') {
        $srcImg = @imagecreatefrompng($tmpPath);
    } elseif ($sourceExt === 'webp') {
        $srcImg = @imagecreatefromwebp($tmpPath);
    }

    if (!$srcImg) {
        return null;
    }

    // Convertir paletas indexadas (PNG-8) a TrueColor para compatibilidad total con WebP
    if (function_exists('imagepalettetotruecolor') && !imageistruecolor($srcImg)) {
        @imagepalettetotruecolor($srcImg);
    }

    $origW = imagesx($srcImg);
    $origH = imagesy($srcImg);
    if ($origW <= 0 || $origH <= 0) {
        imagedestroy($srcImg);
        return null;
    }

    $maxDimension = 1920;
    $targetW = $origW;
    $targetH = $origH;

    if ($origW > $maxDimension || $origH > $maxDimension) {
        if ($origW >= $origH) {
            $targetW = $maxDimension;
            $targetH = (int)round(($origH * $maxDimension) / $origW);
        } else {
            $targetH = $maxDimension;
            $targetW = (int)round(($origW * $maxDimension) / $origH);
        }
    }

    $finalImg = $srcImg;
    if ($targetW !== $origW || $targetH !== $origH) {
        $resized = imagecreatetruecolor($targetW, $targetH);
        imagealphablending($resized, false);
        imagesavealpha($resized, true);
        $transparent = imagecolorallocatealpha($resized, 0, 0, 0, 127);
        imagefilledrectangle($resized, 0, 0, $targetW, $targetH, $transparent);
        imagecopyresampled($resized, $srcImg, 0, 0, 0, 0, $targetW, $targetH, $origW, $origH);
        imagedestroy($srcImg);
        $finalImg = $resized;
    } else {
        imagealphablending($finalImg, false);
        imagesavealpha($finalImg, true);
    }

    $webpFilename = $baseId . '.webp';
    $destination = $mediaDir . DIRECTORY_SEPARATOR . $webpFilename;
    $saved = @imagewebp($finalImg, $destination, 82);
    imagedestroy($finalImg);

    if ($saved && is_file($destination) && filesize($destination) > 0) {
        return $webpFilename;
    }

    return null;
}

$tmpPath = $_FILES['asset']['tmp_name'];
$baseId = str_replace('.', '_', uniqid('asset_', true));

// Intentar optimización automática a WebP para imágenes estáticas (JPG, PNG, WEBP)
if ($mediaType === 'image' && in_array($ext, ['jpg', 'jpeg', 'png', 'webp'], true)) {
    $optimizedFilename = optimizeAndSaveWebpImage($tmpPath, $ext, $mediaDir, $baseId);
    if ($optimizedFilename !== null) {
        sendJson([
            'success'   => true,
            'url'       => '/eventos/' . $slug . '/media/' . $optimizedFilename,
            'mediaType' => 'image',
            'optimized' => true,
        ]);
    }
}

// Fallback directo para audio (MP3), videos (MP4/MOV/WEBM), GIF o entornos sin GD WebP
$filename = $baseId . '.' . $ext;
$destination = $mediaDir . DIRECTORY_SEPARATOR . $filename;

if (move_uploaded_file($tmpPath, $destination)) {
    sendJson([
        'success'   => true,
        'url'       => '/eventos/' . $slug . '/media/' . $filename,
        'mediaType' => $mediaType,
        'optimized' => false,
    ]);
}

sendJson(['success' => false, 'message' => 'Error al guardar el archivo en el servidor'], 500);
