<?php
// ============================================================
//  Controlador: Clientes
//  GET    /api/clientes       → listar
//  POST   /api/clientes       → crear
//  DELETE /api/clientes/:id   → eliminar
// ============================================================

class ClientesController {

    public static function handle(string $method, ?int $id): void {
        match($method) {
            'GET'    => self::listar(),
            'POST'   => self::crear(),
            'DELETE' => $id ? self::eliminar($id) : err('ID requerido'),
            default  => err('Método no permitido', 405),
        };
    }

    private static function listar(): void {
        $pdo  = getDB();
        $stmt = $pdo->query("
            SELECT c.id, c.nombre, c.telefono, c.notas, c.creado_en,
                   l.nombre AS lugar
            FROM clientes c
            JOIN lugares l ON c.lugar_id = l.id
            ORDER BY c.nombre
        ");
        ok($stmt->fetchAll());
    }

    private static function crear(): void {
        $data = body();
        $nombre   = trim($data['nombre']   ?? '');
        $telefono = trim($data['telefono'] ?? '');
        $lugar_id = (int)($data['lugar_id'] ?? 0);
        $notas    = $data['notas'] ?? null;

        if (!$nombre || !$telefono || !$lugar_id) {
            err('Faltan campos obligatorios: nombre, telefono, lugar_id');
        }

        $pdo  = getDB();
        $stmt = $pdo->prepare("
            INSERT INTO clientes (nombre, telefono, lugar_id, notas)
            VALUES (?, ?, ?, ?)
        ");
        $stmt->execute([$nombre, $telefono, $lugar_id, $notas]);
        ok(['id' => (int)$pdo->lastInsertId()]);
    }

    private static function eliminar(int $id): void {
        $pdo  = getDB();
        $stmt = $pdo->prepare("DELETE FROM clientes WHERE id = ?");
        $stmt->execute([$id]);
        if ($stmt->rowCount() === 0) err('Cliente no encontrado', 404);
        ok();
    }
}