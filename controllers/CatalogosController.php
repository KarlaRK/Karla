<?php
class CatalogosController {

    public static function lugares(string $method): void {
        if ($method !== 'GET') err('Método no permitido', 405);
        $pdo = getDB();
        ok($pdo->query("SELECT * FROM lugares ORDER BY nombre")->fetchAll());
    }

    public static function servicios(string $method): void {
        if ($method !== 'GET') err('Método no permitido', 405);
        $pdo = getDB();
        ok($pdo->query("SELECT * FROM servicios WHERE activo = 1 ORDER BY nombre")->fetchAll());
    }

    public static function materiales(string $method): void {
        if ($method !== 'GET') err('Método no permitido', 405);
        $pdo = getDB();
        ok($pdo->query("SELECT * FROM materiales WHERE activo = 1 ORDER BY nombre")->fetchAll());
    }
}