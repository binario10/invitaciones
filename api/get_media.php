<?php
require_once __DIR__ . '/config.php';
handleCors('GET, OPTIONS');

$slug = sanitizeSlug($_GET['slug'] ?? '');
if (!$slug) {
    sendJson(['success' => false, 'message' => 'Evento no especificado'], 400);
}

$baseDir = getEventosBaseDir();
$uploadsDir = $baseDir . DIRECTORY_SEPARATOR . $slug . DIRECTORY_SEPARATOR . 'uploads';
$thumbsDir  = $uploadsDir . DIRECTORY_SEPARATOR . 'thumbs';
$dataFile   = $uploadsDir . DIRECTORY_SEPARATOR . 'album_data.json';

if (!file_exists($dataFile)) {
    sendJson(['success' => true, 'media' => []]);
}

$items = json_decode(file_get_contents($dataFile), true);
if (!is_array($items)) {
    $items = [];
}

$validItems = [];
foreach ($items as $item) {
    if (empty($item['filename'])) continue;
    $safeFilename = basename($item['filename']);
    if (!file_exists($uploadsDir . DIRECTORY_SEPARATOR . $safeFilename)) {
        continue;
    }

    $originalUrl = $item['url'] ?? ('/eventos/' . $slug . '/uploads/' . $safeFilename);
    $item['url'] = $originalUrl;

    $resolvedThumbUrl = null;
    if (!empty($item['thumbFilename'])) {
        $safeThumb = basename($item['thumbFilename']);
        if (file_exists($thumbsDir . DIRECTORY_SEPARATOR . $safeThumb)) {
            $resolvedThumbUrl = '/eventos/' . $slug . '/uploads/thumbs/' . $safeThumb;
        }
    } else {
        $baseName = pathinfo($safeFilename, PATHINFO_FILENAME);
        $candidateThumb = $baseName . '.webp';
        if (file_exists($thumbsDir . DIRECTORY_SEPARATOR . $candidateThumb)) {
            $resolvedThumbUrl = '/eventos/' . $slug . '/uploads/thumbs/' . $candidateThumb;
        }
    }

    $item['thumbUrl'] = $resolvedThumbUrl ?: $originalUrl;
    $validItems[] = $item;
}

usort($validItems, function ($a, $b) {
    return strtotime($b['createdAt'] ?? '1970-01-01') <=> strtotime($a['createdAt'] ?? '1970-01-01');
});

sendJson([
    'success' => true,
    'media'   => $validItems,
]);
