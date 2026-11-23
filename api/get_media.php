<?php
require_once __DIR__ . '/config.php';
handleCors('GET, OPTIONS');

$slug = sanitizeSlug($_GET['slug'] ?? '');
if (!$slug) {
    sendJson(['success' => false, 'message' => 'Evento no especificado'], 400);
}

$baseDir = getEventosBaseDir();
$uploadsDir = $baseDir . DIRECTORY_SEPARATOR . $slug . DIRECTORY_SEPARATOR . 'uploads';
$dataFile = $uploadsDir . DIRECTORY_SEPARATOR . 'album_data.json';

if (!file_exists($dataFile)) {
    sendJson(['success' => true, 'media' => []]);
}

$items = json_decode(file_get_contents($dataFile), true);
if (!is_array($items)) {
    $items = [];
}

$validItems = array_values(array_filter($items, function ($item) use ($uploadsDir) {
    if (empty($item['filename'])) return false;
    return file_exists($uploadsDir . DIRECTORY_SEPARATOR . basename($item['filename']));
}));

usort($validItems, function ($a, $b) {
    return strtotime($b['createdAt'] ?? '1970-01-01') <=> strtotime($a['createdAt'] ?? '1970-01-01');
});

sendJson([
    'success' => true,
    'media'   => $validItems,
]);
