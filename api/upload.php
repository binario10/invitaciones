<?php
require_once __DIR__ . '/config.php';
handleCors('POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJson(['success' => false, 'message' => 'Método no permitido'], 405);
}

// Detectar si el archivo excedió post_max_size (PHP deja $_POST y $_FILES completamente vacíos)
$contentLength = (int)($_SERVER['CONTENT_LENGTH'] ?? 0);
if ($contentLength > 0 && empty($_POST) && empty($_FILES)) {
    $maxPost = ini_get('post_max_size') ?: 'límite del servidor';
    sendJson([
        'success' => false,
        'message' => "El video excede el límite máximo de subida configurado en PHP (post_max_size: {$maxPost}).",
    ], 413);
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

// Compatibilidad tanto con 'media[]' como con 'files[]'
$rawFiles = $_FILES['media'] ?? $_FILES['files'] ?? null;
if (!$rawFiles) {
    sendJson(['success' => false, 'message' => 'No se recibió ningún archivo en la petición.'], 400);
}

// Soporte amplio de imágenes y múltiples contenedores/MIME de video (iOS, Android, cámaras)
$allowedMimes = [
    'image/jpeg'                => ['ext' => 'jpg',  'type' => 'image'],
    'image/png'                 => ['ext' => 'png',  'type' => 'image'],
    'image/webp'                => ['ext' => 'webp', 'type' => 'image'],
    'image/gif'                 => ['ext' => 'gif',  'type' => 'image'],
    'video/mp4'                 => ['ext' => 'mp4',  'type' => 'video'],
    'application/mp4'           => ['ext' => 'mp4',  'type' => 'video'],
    'video/iso.segment'         => ['ext' => 'mp4',  'type' => 'video'],
    'video/quicktime'           => ['ext' => 'mov',  'type' => 'video'],
    'video/webm'                => ['ext' => 'webm', 'type' => 'video'],
    'video/x-msvideo'           => ['ext' => 'avi',  'type' => 'video'],
    'video/avi'                 => ['ext' => 'avi',  'type' => 'video'],
    'video/x-matroska'          => ['ext' => 'mkv',  'type' => 'video'],
    'video/3gpp'                => ['ext' => '3gp',  'type' => 'video'],
    'video/3gpp2'               => ['ext' => '3g2',  'type' => 'video'],
    'video/x-m4v'               => ['ext' => 'm4v',  'type' => 'video'],
];

$allowedVideoExts = ['mp4', 'mov', 'webm', 'avi', 'mkv', '3gp', '3g2', 'm4v'];
$allowedImageExts = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

$files = [];
if (is_array($rawFiles['name'])) {
    $count = count($rawFiles['name']);
    for ($i = 0; $i < $count; $i++) {
        $files[] = [
            'name'     => $rawFiles['name'][$i],
            'type'     => $rawFiles['type'][$i] ?? '',
            'tmp_name' => $rawFiles['tmp_name'][$i],
            'error'    => $rawFiles['error'][$i],
        ];
    }
} else {
    $files[] = $rawFiles;
}

$uploadErrorMessages = [
    UPLOAD_ERR_INI_SIZE   => 'El archivo excede el límite upload_max_filesize (' . ini_get('upload_max_filesize') . ') del servidor.',
    UPLOAD_ERR_FORM_SIZE  => 'El archivo excede el tamaño máximo permitido por el formulario.',
    UPLOAD_ERR_PARTIAL    => 'El archivo se subió de forma incompleta. Intenta de nuevo.',
    UPLOAD_ERR_NO_FILE    => 'No se seleccionó ningún archivo.',
    UPLOAD_ERR_NO_TMP_DIR => 'Falta la carpeta temporal en el servidor PHP.',
    UPLOAD_ERR_CANT_WRITE => 'El servidor no tiene permisos para escribir el archivo en disco.',
    UPLOAD_ERR_EXTENSION  => 'Una extensión de PHP detuvo la subida del archivo.',
];

$finfo = class_exists('finfo') ? new finfo(FILEINFO_MIME_TYPE) : null;
$uploadedItems = [];
$errors = [];

foreach ($files as $file) {
    if ($file['error'] !== UPLOAD_ERR_OK) {
        $reason = $uploadErrorMessages[$file['error']] ?? ('Error de subida código ' . $file['error']);
        $errors[] = $file['name'] . ': ' . $reason;
        continue;
    }

    $detectedMime = $finfo ? strtolower((string)$finfo->file($file['tmp_name'])) : '';
    $browserMime  = strtolower((string)($file['type'] ?? ''));
    $originalExt  = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

    $ext = null;
    $mediaType = null;

    if (isset($allowedMimes[$detectedMime])) {
        $ext = $allowedMimes[$detectedMime]['ext'];
        $mediaType = $allowedMimes[$detectedMime]['type'];
    } elseif (
        in_array($originalExt, $allowedVideoExts, true) &&
        (
            $detectedMime === 'application/octet-stream' ||
            $detectedMime === '' ||
            strpos($detectedMime, 'video/') === 0 ||
            strpos($browserMime, 'video/') === 0
        )
    ) {
        $ext = $originalExt;
        $mediaType = 'video';
    } elseif (
        in_array($originalExt, $allowedImageExts, true) &&
        (
            $detectedMime === 'application/octet-stream' ||
            $detectedMime === '' ||
            strpos($detectedMime, 'image/') === 0 ||
            strpos($browserMime, 'image/') === 0
        )
    ) {
        $ext = $originalExt === 'jpeg' ? 'jpg' : $originalExt;
        $mediaType = 'image';
    }

    if (!$ext || !$mediaType) {
        $errors[] = "Formato no permitido para {$file['name']} (detectado: {$detectedMime}, ext: .{$originalExt})";
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
    } else {
        $errors[] = "No se pudo guardar {$file['name']} en el directorio del evento.";
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
