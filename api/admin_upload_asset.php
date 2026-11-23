<?php
require_once __DIR__ . '/config.php';
handleCors('POST, OPTIONS');
requireAdminAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJson(['success' => false, 'message' => 'Método no permitido'], 405);
}

$slug = sanitizeSlug($_POST['slug'] ?? '');
if (!$slug) {
    sendJson(['success' => false, 'message' => 'Primero define un identificador (slug) válido para el evento'], 400);
}

if (!isset($_FILES['asset']) || $_FILES['asset']['error'] !== UPLOAD_ERR_OK) {
    sendJson(['success' => false, 'message' => 'No se recibió ningún archivo válido'], 400);
}

$allowedMimes = [
    'image/jpeg' => 'jpg',
    'image/png'  => 'png',
    'image/webp' => 'webp',
    'audio/mpeg' => 'mp3',
    'audio/mp3'  => 'mp3',
];

$finfo = new finfo(FILEINFO_MIME_TYPE);
$mimeType = $finfo->file($_FILES['asset']['tmp_name']);

if (!isset($allowedMimes[$mimeType])) {
    sendJson(['success' => false, 'message' => 'Formato no soportado: ' . $mimeType], 400);
}

$baseDir = getEventosBaseDir();
$mediaDir = $baseDir . DIRECTORY_SEPARATOR . $slug . DIRECTORY_SEPARATOR . 'media';
if (!is_dir($mediaDir)) {
    mkdir($mediaDir, 0755, true);
}

$ext = $allowedMimes[$mimeType];
$filename = str_replace('.', '_', uniqid('asset_', true)) . '.' . $ext;
$destination = $mediaDir . DIRECTORY_SEPARATOR . $filename;

if (move_uploaded_file($_FILES['asset']['tmp_name'], $destination)) {
    sendJson([
        'success' => true,
        'url'     => '/eventos/' . $slug . '/media/' . $filename,
    ]);
}

sendJson(['success' => false, 'message' => 'Error al guardar el archivo en el servidor'], 500);
