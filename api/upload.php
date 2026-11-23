<?php
require_once __DIR__ . '/config.php';
handleCors('POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJson(['success' => false, 'message' => 'Método no permitido'], 405);
}

$slug = sanitizeSlug($_POST['slug'] ?? $_GET['slug'] ?? '');
if (!$slug) {
    sendJson(['success' => false, 'message' => 'Evento no especificado'], 400);
}

$baseDir = getEventosBaseDir();
$eventDir = $baseDir . DIRECTORY_SEPARATOR . $slug;
if (!is_dir($eventDir)) {
    sendJson(['success' => false, 'message' => 'El evento no existe'], 404);
}

$uploadsDir = $eventDir . DIRECTORY_SEPARATOR . 'uploads';
$dataFile = $uploadsDir . DIRECTORY_SEPARATOR . 'album_data.json';

if (!is_dir($uploadsDir)) {
    mkdir($uploadsDir, 0755, true);
}
if (!file_exists($dataFile)) {
    file_put_contents($dataFile, '[]');
}

if (!isset($_FILES['media'])) {
    sendJson(['success' => false, 'message' => 'No se recibió ningún archivo'], 400);
}

// Soporte amplio de imágenes y múltiples formatos de video (iOS, Android, cámaras)
$allowedMimes = [
    'image/jpeg'                => ['ext' => 'jpg',  'type' => 'image'],
    'image/png'                 => ['ext' => 'png',  'type' => 'image'],
    'image/webp'                => ['ext' => 'webp', 'type' => 'image'],
    'image/gif'                 => ['ext' => 'gif',  'type' => 'image'],
    'video/mp4'                 => ['ext' => 'mp4',  'type' => 'video'],
    'video/quicktime'           => ['ext' => 'mov',  'type' => 'video'],
    'video/webm'                => ['ext' => 'webm', 'type' => 'video'],
    'video/x-msvideo'           => ['ext' => 'avi',  'type' => 'video'],
    'video/avi'                 => ['ext' => 'avi',  'type' => 'video'],
    'video/x-matroska'          => ['ext' => 'mkv',  'type' => 'video'],
    'video/3gpp'                => ['ext' => '3gp',  'type' => 'video'],
    'video/3gpp2'               => ['ext' => '3g2',  'type' => 'video'],
    'video/x-m4v'               => ['ext' => 'm4v',  'type' => 'video'],
    'application/octet-stream'  => null, // Se evalúa por extensión segura abajo
];

$allowedVideoExts = ['mp4', 'mov', 'webm', 'avi', 'mkv', '3gp', 'm4v'];
$allowedImageExts = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

$files = [];
if (is_array($_FILES['media']['name'])) {
    $count = count($_FILES['media']['name']);
    for ($i = 0; $i < $count; $i++) {
        $files[] = [
            'name'     => $_FILES['media']['name'][$i],
            'tmp_name' => $_FILES['media']['tmp_name'][$i],
            'error'    => $_FILES['media']['error'][$i],
        ];
    }
} else {
    $files[] = $_FILES['media'];
}

$finfo = new finfo(FILEINFO_MIME_TYPE);
$uploadedItems = [];
$errors = [];

foreach ($files as $file) {
    if ($file['error'] !== UPLOAD_ERR_OK) {
        $errors[] = 'Error al subir ' . $file['name'] . ' (código ' . $file['error'] . ')';
        continue;
    }

    $mimeType = $finfo->file($file['tmp_name']);
    $originalExt = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $ext = null;
    $mediaType = null;

    if (isset($allowedMimes[$mimeType]) && $allowedMimes[$mimeType] !== null) {
        $ext = $allowedMimes[$mimeType]['ext'];
        $mediaType = $allowedMimes[$mimeType]['type'];
    } elseif ($mimeType === 'application/octet-stream') {
        if (in_array($originalExt, $allowedVideoExts, true)) {
            $ext = $originalExt;
            $mediaType = 'video';
        } elseif (in_array($originalExt, $allowedImageExts, true)) {
            $ext = $originalExt === 'jpeg' ? 'jpg' : $originalExt;
            $mediaType = 'image';
        }
    }

    if (!$ext || !$mediaType) {
        $errors[] = 'Formato no permitido (' . $mimeType . ')';
        continue;
    }

    $uniqueId = uniqid('mem_', true);
    $safeFilename = str_replace('.', '_', $uniqueId) . '.' . $ext;
    $destination = $uploadsDir . DIRECTORY_SEPARATOR . $safeFilename;

    if (move_uploaded_file($file['tmp_name'], $destination)) {
        $uploadedItems[] = [
            'id'        => $uniqueId,
            'filename'  => $safeFilename,
            'url'       => '/eventos/' . $slug . '/uploads/' . $safeFilename,
            'type'      => $mediaType,
            'createdAt' => date('c'),
        ];
    }
}

if (!empty($uploadedItems)) {
    $fp = fopen($dataFile, 'c+');
    if (flock($fp, LOCK_EX)) {
        $rawContent = stream_get_contents($fp);
        $existingData = json_decode($rawContent, true);
        if (!is_array($existingData)) {
            $existingData = [];
        }
        $updatedData = array_merge($uploadedItems, $existingData);
        ftruncate($fp, 0);
        rewind($fp);
        fwrite($fp, json_encode($updatedData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
        fflush($fp);
        flock($fp, LOCK_UN);
    }
    fclose($fp);
}

if (empty($uploadedItems) && !empty($errors)) {
    sendJson(['success' => false, 'message' => implode(' | ', $errors)], 400);
}

sendJson([
    'success'  => true,
    'uploaded' => $uploadedItems,
    'errors'   => $errors,
]);
