<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/demo_seeds.php';
handleCors('GET, POST, DELETE, OPTIONS');
requireAdminAuth();

ensureAllApatzinganDemosSeeded();
$baseDir = getEventosBaseDir();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $slug = sanitizeSlug($_GET['slug'] ?? '');
    if ($slug) {
        $cfgFile = $baseDir . DIRECTORY_SEPARATOR . $slug . DIRECTORY_SEPARATOR . 'config.json';
        if (!is_file($cfgFile)) {
            sendJson(['success' => false, 'message' => 'Evento no encontrado'], 404);
        }
        $data = json_decode((string)file_get_contents($cfgFile), true);
        sendJson(['success' => true, 'event' => $data]);
    }

    $events = [];
    if (is_dir($baseDir)) {
        $dirs = scandir($baseDir);
        foreach ($dirs as $entry) {
            if ($entry === '.' || $entry === '..') {
                continue;
            }
            $eventPath = $baseDir . DIRECTORY_SEPARATOR . $entry;
            $cfgFile = $eventPath . DIRECTORY_SEPARATOR . 'config.json';
            if (is_dir($eventPath) && is_file($cfgFile)) {
                $cfg = json_decode((string)file_get_contents($cfgFile), true);
                if (is_array($cfg)) {
                    $mediaDir = $eventPath . DIRECTORY_SEPARATOR . 'media';
                    $mediaCount = 0;
                    if (is_dir($mediaDir)) {
                        $files = scandir($mediaDir);
                        foreach ($files as $f) {
                            if ($f !== '.' && $f !== '..' && is_file($mediaDir . DIRECTORY_SEPARATOR . $f)) {
                                $mediaCount++;
                            }
                        }
                    }
                    $events[] = [
                        'slug'        => $cfg['slug'] ?? $entry,
                        'eventType'   => $cfg['eventType'] ?? 'custom',
                        'pageTitle'   => $cfg['pageTitle'] ?? $entry,
                        'dateDisplay' => $cfg['hero']['dateDisplay'] ?? '',
                        'heroImage'   => $cfg['hero']['heroImage'] ?? '',
                        'mediaCount'  => $mediaCount,
                    ];
                }
            }
        }
    }

    sendJson(['success' => true, 'events' => $events]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $raw = file_get_contents('php://input');
    $payload = json_decode((string)$raw, true);
    if (!is_array($payload)) {
        sendJson(['success' => false, 'message' => 'JSON inválido'], 400);
    }

    $slug = sanitizeSlug($payload['slug'] ?? '');
    if (!$slug) {
        sendJson(['success' => false, 'message' => 'El identificador (slug) de la URL es obligatorio'], 400);
    }
    $payload['slug'] = $slug;

    $eventDir = $baseDir . DIRECTORY_SEPARATOR . $slug;
    if (!is_dir($eventDir . DIRECTORY_SEPARATOR . 'media')) {
        mkdir($eventDir . DIRECTORY_SEPARATOR . 'media', 0755, true);
    }

    $cfgFile = $eventDir . DIRECTORY_SEPARATOR . 'config.json';
    $encoded = json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if (file_put_contents($cfgFile, $encoded) === false) {
        sendJson(['success' => false, 'message' => 'No se pudo guardar la invitación'], 500);
    }

    sendJson(['success' => true, 'slug' => $slug]);
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $slug = sanitizeSlug($_GET['slug'] ?? '');
    if (!$slug) {
        sendJson(['success' => false, 'message' => 'Slug inválido'], 400);
    }

    $eventDir = $baseDir . DIRECTORY_SEPARATOR . $slug;
    if (!is_dir($eventDir)) {
        sendJson(['success' => false, 'message' => 'Evento no encontrado'], 404);
    }

    $deleteRecursive = function (string $dir) use (&$deleteRecursive): void {
        foreach (scandir($dir) as $item) {
            if ($item === '.' || $item === '..') {
                continue;
            }
            $path = $dir . DIRECTORY_SEPARATOR . $item;
            if (is_dir($path)) {
                $deleteRecursive($path);
            } else {
                @unlink($path);
            }
        }
        @rmdir($dir);
    };

    $deleteRecursive($eventDir);
    sendJson(['success' => true]);
}

sendJson(['success' => false, 'message' => 'Método no permitido'], 405);
