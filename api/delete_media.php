<?php
require_once __DIR__ . '/config.php';
handleCors('POST, DELETE, OPTIONS');
requireAdminAuth();

$input = json_decode(file_get_contents('php://input'), true);
$slug = sanitizeSlug($_GET['slug'] ?? $input['slug'] ?? '');
$filename = basename((string)($_GET['filename'] ?? $input['filename'] ?? ''));

if (!$slug || $filename === '') {
    sendJson(['success' => false, 'message' => 'Parámetros inválidos'], 400);
}

$baseDir = getEventosBaseDir();
$uploadsDir = $baseDir . DIRECTORY_SEPARATOR . $slug . DIRECTORY_SEPARATOR . 'uploads';
$dataFile = $uploadsDir . DIRECTORY_SEPARATOR . 'album_data.json';
$filePath = $uploadsDir . DIRECTORY_SEPARATOR . $filename;

if (file_exists($filePath) && is_file($filePath)) {
    @unlink($filePath);
}

if (file_exists($dataFile)) {
    $fp = fopen($dataFile, 'c+');
    if (flock($fp, LOCK_EX)) {
        $raw = stream_get_contents($fp);
        $items = json_decode($raw, true);
        if (!is_array($items)) {
            $items = [];
        }
        $filtered = array_values(array_filter($items, function ($item) use ($filename) {
            return basename((string)($item['filename'] ?? '')) !== $filename;
        }));
        ftruncate($fp, 0);
        rewind($fp);
        fwrite($fp, json_encode($filtered, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
        fflush($fp);
        flock($fp, LOCK_UN);
    }
    fclose($fp);
}

sendJson([
    'success' => true,
    'message' => 'Archivo eliminado del álbum',
]);
