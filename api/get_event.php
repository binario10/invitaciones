<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/demo_seeds.php';
handleCors('GET, OPTIONS');

$slug = sanitizeSlug($_GET['slug'] ?? '');
if (!$slug) {
    sendJson(['success' => false, 'message' => 'Slug de evento inválido'], 400);
}

ensureApatzinganDemoSeeded($slug);

$baseDir = getEventosBaseDir();
$configFile = $baseDir . DIRECTORY_SEPARATOR . $slug . DIRECTORY_SEPARATOR . 'config.json';

if (!is_file($configFile)) {
    sendJson(['success' => false, 'message' => 'Invitación no encontrada'], 404);
}

$raw = file_get_contents($configFile);
$data = json_decode((string)$raw, true);

if (!is_array($data)) {
    sendJson(['success' => false, 'message' => 'Error al leer configuración del evento'], 500);
}

sendJson([
    'success' => true,
    'event'   => $data,
]);
