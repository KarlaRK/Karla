<?php
require_once __DIR__ . '/../config/db.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

function ok($data = null): void {
    echo json_encode(['ok' => true, 'data' => $data]);
    exit;
}

function err(string $msg, int $code = 400): void {
    http_response_code($code);
    echo json_encode(['ok' => false, 'error' => $msg]);
    exit;
}

function body(): array {
    return json_decode(file_get_contents('php://input'), true) ?? [];
}

// Leer la ruta y limpiarla
$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri    = str_replace(['\\', '//'], ['/', '/'], $uri);
$uri    = trim($uri, '/');

// Quitar el prefijo del proyecto, ej: "karla/api/clientes" → "clientes"
$uri    = preg_replace('#^[^/]+/api/?#', '', $uri);   // quita "karla/api/"
$uri    = preg_replace('#^api/?#', '', $uri);          // quita "api/" si quedó

$parts    = explode('/', $uri);
$resource = $parts[0] ?? '';
$id       = isset($parts[1]) && is_numeric($parts[1]) ? (int)$parts[1] : null;
$sub      = $parts[2] ?? null;

$method = $_SERVER['REQUEST_METHOD'];

require_once __DIR__ . '/../controllers/ClientesController.php';
require_once __DIR__ . '/../controllers/CitasController.php';
require_once __DIR__ . '/../controllers/PagosController.php';
require_once __DIR__ . '/../controllers/InventarioController.php';
require_once __DIR__ . '/../controllers/ReportesController.php';
require_once __DIR__ . '/../controllers/CatalogosController.php';
require_once __DIR__ . '/../controllers/LoginController.php';

switch ($resource) {
    case 'clientes':   ClientesController::handle($method, $id);         break;
    case 'citas':      CitasController::handle($method, $id, $sub);      break;
    case 'pagos':      PagosController::handle($method, $id);            break;
    case 'inventario': InventarioController::handle($method, $id);       break;
    case 'reportes':   ReportesController::handle($method);              break;
    case 'lugares':    CatalogosController::lugares($method);            break;
    case 'servicios':  CatalogosController::servicios($method);          break;
    case 'materiales': CatalogosController::materiales($method);         break;
    case 'login':      LoginController::handle($method);                 break;
    default:           err('Ruta no encontrada: ' . $resource, 404);
}