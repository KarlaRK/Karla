<?php
// ============================================================
//  SK Glamour Nails — Conexión a la base de datos (PDO)
//  Archivo: config/db.php
// ============================================================

define('DB_HOST', 'sql109.infinityfree.com');
define('DB_NAME', 'if0_41790334_sk_glamour_nails');
define('DB_USER', 'if0_41790334');           // ← cambia por tu usuario
define('DB_PASS', 'mxot1ZgAYxr');    // ← cambia por tu contraseña
define('DB_CHAR', 'utf8mb4');

function getDB(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHAR;
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            http_response_code(500);
            die(json_encode(['ok' => false, 'error' => 'Error de conexión: ' . $e->getMessage()]));
        }
    }
    return $pdo;
}