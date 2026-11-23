<?php
require_once __DIR__ . '/config.php';
handleCors('GET, OPTIONS');
ensureDemoEventExists();

$slug = sanitizeSlug($_GET['slug'] ?? '');
if (!$slug) {
    sendJson(['success' => false, 'message' => 'Identificador de invitación inválido'], 400);
}

$baseDir = getEventosBaseDir();
$configFile = $baseDir . DIRECTORY_SEPARATOR . $slug . DIRECTORY_SEPARATOR . 'config.json';

if (!file_exists($configFile)) {
    sendJson(['success' => false, 'message' => 'Invitación no encontrada'], 404);
}

$config = json_decode(file_get_contents($configFile), true);
if (!is_array($config)) {
    sendJson(['success' => false, 'message' => 'Error al leer la configuración de la invitación'], 500);
}

sendJson([
    'success' => true,
    'event'   => $config,
]);
