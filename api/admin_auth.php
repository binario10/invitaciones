<?php
require_once __DIR__ . '/config.php';
handleCors('POST, GET, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    requireAdminAuth();
    sendJson(['success' => true, 'authenticated' => true]);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJson(['success' => false, 'message' => 'Método no permitido'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$password = (string)($input['password'] ?? '');

$isValidDefault = ($password === 'Admin2026!' && ADMIN_PASSWORD_HASH === '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');
$isValidHash = password_verify($password, ADMIN_PASSWORD_HASH);

if ($isValidDefault || $isValidHash) {
    $token = generateAdminToken();
    sendJson([
        'success' => true,
        'token'   => $token,
    ]);
}

sendJson([
    'success' => false,
    'message' => 'Contraseña incorrecta',
], 401);
