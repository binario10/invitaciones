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

$filename = str_replace('.', '_', uniqid('asset_', true)) . '.' . $ext;
$destination = $mediaDir . DIRECTORY_SEPARATOR . $filename;

if (move_uploaded_file($_FILES['asset']['tmp_name'], $destination)) {
    sendJson([
        'success'   => true,
        'url'       => '/eventos/' . $slug . '/media/' . $filename,
        'mediaType' => $mediaType,
    ]);
}

sendJson(['success' => false, 'message' => 'Error al guardar el archivo en el servidor'], 500);
