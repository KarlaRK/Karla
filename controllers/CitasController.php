<?php
// ============================================================
//  Controlador: Citas
//  GET    /api/citas              → listar
//  POST   /api/citas              → crear
//  PATCH  /api/citas/:id/estado   → cambiar estado
//  DELETE /api/citas/:id          → eliminar
// ============================================================

class CitasController {

    private static array $ESTADOS = ['pendiente','confirmada','completada','cancelada'];

    public static function handle(string $method, ?int $id, ?string $sub): void {
        if ($method === 'PATCH' && $sub === 'estado' && $id) {
            self::cambiarEstado($id);
            return;
        }
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
        SELECT c.id, cl.nombre AS cliente, s.nombre AS servicio,
               l.nombre AS lugar, c.fecha, c.hora, c.estado, c.notas
        FROM citas c
        JOIN clientes cl ON c.cliente_id = cl.id
        JOIN servicios s ON c.servicio_id = s.id
        JOIN lugares l ON c.lugar_id = l.id
        ORDER BY c.fecha DESC, c.hora DESC
    ");
    ok($stmt->fetchAll());
}


    private static function crear(): void {
        $data = body();
        $cliente_id  = (int)($data['cliente_id']  ?? 0);
        $servicio_id = (int)($data['servicio_id'] ?? 0);
        $lugar_id    = (int)($data['lugar_id']    ?? 0);
        $fecha       = $data['fecha'] ?? '';
        $hora        = $data['hora']  ?? '';
        $notas       = $data['notas'] ?? null;

        if (!$cliente_id || !$servicio_id || !$lugar_id || !$fecha || !$hora) {
            err('Faltan campos: cliente_id, servicio_id, lugar_id, fecha, hora');
        }

        $pdo  = getDB();
        $stmt = $pdo->prepare("
            INSERT INTO citas (cliente_id, servicio_id, lugar_id, fecha, hora, notas)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$cliente_id, $servicio_id, $lugar_id, $fecha, $hora, $notas]);
        ok(['id' => (int)$pdo->lastInsertId()]);
    }

    private static function cambiarEstado(int $id): void {
        $data   = body();
        $estado = $data['estado'] ?? '';

        if (!in_array($estado, self::$ESTADOS, true)) {
            err('Estado inválido. Valores: ' . implode(', ', self::$ESTADOS));
        }

        $pdo  = getDB();
        $stmt = $pdo->prepare("UPDATE citas SET estado = ? WHERE id = ?");
        $stmt->execute([$estado, $id]);
        if ($stmt->rowCount() === 0) err('Cita no encontrada', 404);
        ok();
    }

    private static function eliminar(int $id): void {
        $pdo  = getDB();
        $stmt = $pdo->prepare("DELETE FROM citas WHERE id = ?");
        $stmt->execute([$id]);
        if ($stmt->rowCount() === 0) err('Cita no encontrada', 404);
        ok();
    }
}