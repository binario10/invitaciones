<?php
require_once __DIR__ . '/config.php';
handleCors('GET, OPTIONS');

if (!class_exists('ZipArchive')) {
    sendJson(['success' => false, 'message' => 'La extensión ZipArchive no está habilitada en PHP'], 500);
}

$slug = sanitizeSlug($_GET['slug'] ?? '');
if (!$slug) {
    sendJson(['success' => false, 'message' => 'Evento no especificado'], 400);
}

$baseDir = getEventosBaseDir();
$uploadsDir = $baseDir . DIRECTORY_SEPARATOR . $slug . DIRECTORY_SEPARATOR . 'uploads';
$dataFile = $uploadsDir . DIRECTORY_SEPARATOR . 'album_data.json';

if (!file_exists($dataFile)) {
    sendJson(['success' => false, 'message' => 'Aún no hay archivos en este álbum'], 404);
}

$items = json_decode(file_get_contents($dataFile), true);
if (!is_array($items) || empty($items)) {
    sendJson(['success' => false, 'message' => 'El álbum está vacío'], 404);
}

$tempZip = tempnam(sys_get_temp_dir(), 'album_');
$zip = new ZipArchive();

if ($zip->open($tempZip, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
    sendJson(['success' => false, 'message' => 'No se pudo generar el archivo ZIP'], 500);
}

$addedCount = 0;
foreach ($items as $item) {
    if (empty($item['filename'])) continue;
    $safeName = basename($item['filename']);
    $fullPath = $uploadsDir . DIRECTORY_SEPARATOR . $safeName;
    if (file_exists($fullPath)) {
        $zip->addFile($fullPath, $safeName);
        $addedCount++;
    }
}

$zip->close();

if ($addedCount === 0) {
    @unlink($tempZip);
    sendJson(['success' => false, 'message' => 'No se encontraron archivos físicos'], 404);
}

$downloadName = 'recuerdos-' . $slug . '-' . date('Y-m-d') . '.zip';

header('Content-Type: application/zip');
header('Content-Disposition: attachment; filename="' . $downloadName . '"');
header('Content-Length: ' . filesize($tempZip));
header('Pragma: no-cache');
header('Expires: 0');

readfile($tempZip);
@unlink($tempZip);
exit;
