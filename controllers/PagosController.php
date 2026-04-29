<?php
// ============================================================
//  Controlador: Pagos
//  GET    /api/pagos       → listar
//  POST   /api/pagos       → crear
//  DELETE /api/pagos/:id   → eliminar
// ============================================================

class PagosController {

    private static array $METODOS = ['efectivo','transferencia','nequi','daviplata','otro'];

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
        SELECT p.id, cl.nombre AS cliente, l.nombre AS lugar,
               p.monto, p.metodo_pago, p.notas, p.creado_en,
               u.nombre AS registrado_por
        FROM pagos p
        JOIN clientes cl ON p.cliente_id = cl.id
        JOIN lugares l ON p.lugar_id = l.id
        JOIN usuarios u ON p.registrado_por = u.id
        ORDER BY p.creado_en DESC
    ");
    ok($stmt->fetchAll());
}

    private static function crear(): void {
        $data          = body();
        $cliente_id    = (int)($data['cliente_id']    ?? 0);
        $lugar_id      = (int)($data['lugar_id']      ?? 0);
        $monto         = (float)($data['monto']       ?? 0);
        $registrado_por= (int)($data['registrado_por']?? 0);
        $cita_id       = isset($data['cita_id']) ? (int)$data['cita_id'] : null;
        $metodo_pago   = $data['metodo_pago'] ?? 'efectivo';
        $notas         = $data['notas'] ?? null;

        if (!$cliente_id || !$lugar_id || $monto <= 0 || !$registrado_por) {
            err('Faltan campos: cliente_id, lugar_id, monto, registrado_por');
        }

        if (!in_array($metodo_pago, self::$METODOS, true)) {
            $metodo_pago = 'efectivo';
        }

        $pdo  = getDB();
        $stmt = $pdo->prepare("
            INSERT INTO pagos
              (cliente_id, cita_id, lugar_id, monto, metodo_pago, registrado_por, notas)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$cliente_id, $cita_id, $lugar_id, $monto,
                        $metodo_pago, $registrado_por, $notas]);
        ok(['id' => (int)$pdo->lastInsertId()]);
    }

    private static function eliminar(int $id): void {
        $pdo  = getDB();
        $stmt = $pdo->prepare("DELETE FROM pagos WHERE id = ?");
        $stmt->execute([$id]);
        if ($stmt->rowCount() === 0) err('Pago no encontrado', 404);
        ok();
    }
}