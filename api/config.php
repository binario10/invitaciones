<?php
// =========================================================================
// CONFIGURACIÓN DE SEGURIDAD DEL PANEL ADMINISTRATIVO
// =========================================================================
// Contraseña por defecto: Admin2026!
// Para generar un nuevo hash en terminal:
// php -r "echo password_hash('TuNuevaClave', PASSWORD_DEFAULT) . PHP_EOL;"
define('ADMIN_PASSWORD_HASH', '$2y$12$4tVjoUowjUnzlveqPldHkeZriKOMcwf2Bq5tygeDd5gwADHPMnoVe');
define('ADMIN_TOKEN_SECRET', 'cambia_esta_clave_secreta_uberreyes_invite_2026_x9a7');
define('ADMIN_TOKEN_TTL', 86400); // 24 horas en segundos

function sendJson($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function handleCors($methods = 'GET, POST, DELETE, OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: ' . $methods);
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
}

function sanitizeSlug($rawSlug) {
    $slug = strtolower(trim((string)$rawSlug));
    $slug = preg_replace('/[^a-z0-9\-]/', '-', $slug);
    $slug = preg_replace('/-+/', '-', $slug);
    $slug = trim($slug, '-');
    $reserved = ['admin', 'api', 'eventos', 'assets', 'album'];
    if ($slug === '' || strlen($slug) < 2 || strlen($slug) > 60 || in_array($slug, $reserved, true)) {
        return null;
    }
    return $slug;
}

function getEventosBaseDir() {
    $dir = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'eventos';
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    return $dir;
}

function generateAdminToken() {
    $payload = base64_encode(json_encode([
        'role' => 'admin',
        'exp'  => time() + ADMIN_TOKEN_TTL,
    ]));
    $sig = hash_hmac('sha256', $payload, ADMIN_TOKEN_SECRET);
    return $payload . '.' . $sig;
}

function verifyAdminToken($token) {
    if (!$token || strpos($token, '.') === false) {
        return false;
    }
    list($payload, $sig) = explode('.', $token, 2);
    $expectedSig = hash_hmac('sha256', $payload, ADMIN_TOKEN_SECRET);
    if (!hash_equals($expectedSig, $sig)) {
        return false;
    }
    $data = json_decode(base64_decode($payload), true);
    if (!is_array($data) || ($data['exp'] ?? 0) < time()) {
        return false;
    }
    return true;
}

function requireAdminAuth() {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        $token = trim($matches[1]);
        if (verifyAdminToken($token)) {
            return true;
        }
    }
    sendJson(['success' => false, 'message' => 'No autorizado. Inicia sesión nuevamente.'], 401);
}

// Crea automáticamente un evento demo ('karina-brayan') si aún no existe
function ensureDemoEventExists() {
    $baseDir = getEventosBaseDir();
    $demoDir = $baseDir . DIRECTORY_SEPARATOR . 'karina-brayan';
    $configFile = $demoDir . DIRECTORY_SEPARATOR . 'config.json';

    if (file_exists($configFile)) {
        return;
    }

    mkdir($demoDir, 0755, true);
    mkdir($demoDir . DIRECTORY_SEPARATOR . 'media', 0755, true);
    mkdir($demoDir . DIRECTORY_SEPARATOR . 'uploads', 0755, true);

    $demoConfig = [
        'slug' => 'karina-brayan',
        'eventType' => 'wedding',
        'pageTitle' => 'Karina & Brayan | Nuestra Boda',
        'theme' => [
            '--bg-primary' => '#faf8f5',
            '--bg-secondary' => '#f2ede4',
            '--accent-primary' => '#8c7a6b',
            '--accent-dark' => '#6e5e51',
        ],
        'welcome' => [
            'initials' => 'K & B',
            'message' => 'Estás invitado a celebrar nuestra boda',
        ],
        'hero' => [
            'tag' => '¡Nos Casamos!',
            'primaryName' => 'Karina',
            'connector' => '&',
            'secondaryName' => 'Brayan',
            'dateISO' => '2026-12-19T17:00:00',
            'dateDisplay' => '19 . DICIEMBRE . 2026',
            'heroImage' => 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80',
            'musicUrl' => 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        ],
        'quote' => [
            'enabled' => true,
            'text' => '“Andábamos sin buscarnos, pero sabiendo que andábamos para encontrarnos.”',
            'author' => 'Julio Cortázar',
        ],
        'familySection' => [
            'enabled' => true,
            'subtitle' => 'Con la bendición de nuestros padres',
            'groups' => [
                [
                    'id' => 'grp_1',
                    'enabled' => true,
                    'role' => 'Padres de la Novia',
                    'members' => ['Sr. Roberto Méndez', 'Sra. Elena Morales'],
                ],
                [
                    'id' => 'grp_2',
                    'enabled' => true,
                    'role' => 'Padres del Novio',
                    'members' => ['Sr. Carlos Ramírez', 'Sra. Patricia Soto'],
                ],
            ],
        ],
        'events' => [
            [
                'id' => 'ceremony',
                'enabled' => true,
                'icon' => 'church',
                'type' => 'Ceremonia Religiosa',
                'time' => '17:00 HRS',
                'venue' => 'Parroquia de San José',
                'address' => 'Av. Constitución 245, Centro Histórico',
                'mapUrl' => 'https://maps.google.com',
            ],
            [
                'id' => 'reception',
                'enabled' => true,
                'icon' => 'wine',
                'type' => 'Recepción',
                'time' => '19:30 HRS',
                'venue' => 'Hacienda Los Laureles',
                'address' => 'Camino Real a la Montaña Km 4.5',
                'mapUrl' => 'https://maps.google.com',
            ],
        ],
        'dressCode' => [
            'enabled' => true,
            'title' => 'Formal / Etiqueta Rigurosa',
            'description' => 'Mujeres: Vestido largo. Hombres: Traje formal y corbata. Agradecemos reservar el color blanco y tonos beige exclusivamente para la novia.',
        ],
        'gifts' => [
            'enabled' => true,
            'subtitle' => 'Lluvia de Sobres & Tienda',
            'message' => 'Su presencia es nuestro mejor regalo, pero si desean tener un detalle con nosotros, ponemos a su disposición las siguientes opciones:',
            'bank' => [
                'enabled' => true,
                'bankName' => 'BBVA Bancomer',
                'holder' => 'Karina Méndez Morales',
                'clabe' => '012 320 01584920384 9',
            ],
            'storeRegistry' => [
                'enabled' => true,
                'storeName' => 'Liverpool',
                'eventNumber' => '51489203',
                'url' => 'https://mesaderegalos.liverpool.com.mx/',
            ],
        ],
        'gallery' => [
            'enabled' => true,
            'subtitle' => 'Nuestros Momentos',
            'title' => 'Galería',
            'photos' => [
                [
                    'id' => 1,
                    'url' => 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
                    'alt' => 'Sesión preboda',
                ],
                [
                    'id' => 2,
                    'url' => 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=80',
                    'alt' => 'Detalle de anillo',
                ],
                [
                    'id' => 3,
                    'url' => 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=800&q=80',
                    'alt' => 'Pareja al atardecer',
                ],
            ],
        ],
        'album' => [
            'enabled' => true,
            'sectionSubtitle' => 'Recuerdos Compartidos',
            'sectionTitle' => 'Álbum de Invitados',
            'sectionDescription' => 'Escanea el código QR o da clic en el botón para compartir tus fotografías y videos del evento.',
            'buttonText' => 'Subir y Ver Fotos',
            'avatarImage' => 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
            'pageHeading' => 'Karina y Brayan',
            'pageSubtitle' => 'Cada fotografía guarda una emoción. Comparte tu recuerdo y sé parte de este gran momento.',
        ],
        'rsvp' => [
            'deadlineText' => 'Por favor confírmanos tu asistencia antes del 1 de Diciembre de 2026.',
            'whatsappPhone' => '5215555555555',
            'whatsappIntro' => '¡Hola Karina y Brayan! Confirmo mi asistencia a su boda.',
        ],
        'footer' => [
            'monogram' => 'K & B',
            'closingText' => '¡Te esperamos!',
        ],
        'updatedAt' => date('c'),
    ];

    file_put_contents($configFile, json_encode($demoConfig, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
    file_put_contents($demoDir . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'album_data.json', '[]');
}
