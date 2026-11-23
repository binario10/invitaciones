<?php
require_once __DIR__ . '/config.php';
handleCors('GET, POST, DELETE, OPTIONS');
requireAdminAuth();
ensureDemoEventExists();

$baseDir = getEventosBaseDir();
$method = $_SERVER['REQUEST_METHOD'];

function deleteDirectoryRecursive($dir) {
    if (!is_dir($dir)) return;
    $items = scandir($dir);
    foreach ($items as $item) {
        if ($item === '.' || $item === '..') continue;
        $path = $dir . DIRECTORY_SEPARATOR . $item;
        if (is_dir($path)) {
            deleteDirectoryRecursive($path);
        } else {
            @unlink($path);
        }
    }
    @rmdir($dir);
}

if ($method === 'GET') {
    $slugParam = $_GET['slug'] ?? null;
    if ($slugParam) {
        $slug = sanitizeSlug($slugParam);
        if (!$slug) {
            sendJson(['success' => false, 'message' => 'Slug inválido'], 400);
        }
        $configFile = $baseDir . DIRECTORY_SEPARATOR . $slug . DIRECTORY_SEPARATOR . 'config.json';
        if (!file_exists($configFile)) {
            sendJson(['success' => false, 'message' => 'Evento no encontrado'], 404);
        }
        $config = json_decode(file_get_contents($configFile), true);
        sendJson(['success' => true, 'event' => $config]);
    }

    $events = [];
    $dirs = scandir($baseDir);
    foreach ($dirs as $entry) {
        if ($entry === '.' || $entry === '..') continue;
        $eventDir = $baseDir . DIRECTORY_SEPARATOR . $entry;
        $configFile = $eventDir . DIRECTORY_SEPARATOR . 'config.json';
        if (is_dir($eventDir) && file_exists($configFile)) {
            $cfg = json_decode(file_get_contents($configFile), true);
            $albumFile = $eventDir . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'album_data.json';
            $mediaCount = 0;
            if (file_exists($albumFile)) {
                $albumItems = json_decode(file_get_contents($albumFile), true);
                if (is_array($albumItems)) {
                    $mediaCount = count($albumItems);
                }
            }
            $events[] = [
                'slug'          => $entry,
                'eventType'     => $cfg['eventType'] ?? 'wedding',
                'pageTitle'     => $cfg['pageTitle'] ?? $entry,
                'primaryName'   => $cfg['hero']['primaryName'] ?? $entry,
                'secondaryName' => $cfg['hero']['secondaryName'] ?? '',
                'dateDisplay'   => $cfg['hero']['dateDisplay'] ?? '',
                'heroImage'     => $cfg['hero']['heroImage'] ?? '',
                'mediaCount'    => $mediaCount,
                'updatedAt'     => $cfg['updatedAt'] ?? '',
            ];
        }
    }

    usort($events, function ($a, $b) {
        return strtotime($b['updatedAt'] ?? '1970-01-01') <=> strtotime($a['updatedAt'] ?? '1970-01-01');
    });

    sendJson(['success' => true, 'events' => $events]);
}

if ($method === 'POST') {
    $payload = json_decode(file_get_contents('php://input'), true);
    if (!is_array($payload)) {
        sendJson(['success' => false, 'message' => 'JSON inválido'], 400);
    }

    $slug = sanitizeSlug($payload['slug'] ?? '');
    if (!$slug) {
        sendJson([
            'success' => false,
            'message' => 'El identificador (URL slug) es inválido o está reservado (usa solo letras minúsculas, números y guiones).',
        ], 400);
    }

    $eventDir = $baseDir . DIRECTORY_SEPARATOR . $slug;
    $mediaDir = $eventDir . DIRECTORY_SEPARATOR . 'media';
    $uploadsDir = $eventDir . DIRECTORY_SEPARATOR . 'uploads';

    if (!is_dir($eventDir)) mkdir($eventDir, 0755, true);
    if (!is_dir($mediaDir)) mkdir($mediaDir, 0755, true);
    if (!is_dir($uploadsDir)) mkdir($uploadsDir, 0755, true);

    $albumDataFile = $uploadsDir . DIRECTORY_SEPARATOR . 'album_data.json';
    if (!file_exists($albumDataFile)) {
        file_put_contents($albumDataFile, '[]');
    }

    $payload['slug'] = $slug;
    $payload['updatedAt'] = date('c');

    $configFile = $eventDir . DIRECTORY_SEPARATOR . 'config.json';
    file_put_contents(
        $configFile,
        json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
        LOCK_EX
    );

    sendJson([
        'success' => true,
        'slug'    => $slug,
        'message' => 'Invitación guardada correctamente',
    ]);
}

if ($method === 'DELETE') {
    $slug = sanitizeSlug($_GET['slug'] ?? '');
    if (!$slug) {
        sendJson(['success' => false, 'message' => 'Slug inválido'], 400);
    }

    $eventDir = $baseDir . DIRECTORY_SEPARATOR . $slug;
    if (!is_dir($eventDir)) {
        sendJson(['success' => false, 'message' => 'El evento no existe'], 404);
    }

    deleteDirectoryRecursive($eventDir);
    sendJson(['success' => true, 'message' => 'Evento eliminado correctamente']);
}

sendJson(['success' => false, 'message' => 'Método no soportado'], 405);
