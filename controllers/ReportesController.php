<?php
class ReportesController {

    public static function handle(string $method): void {
    if ($method !== 'GET') err('Método no permitido', 405);
    $pdo = getDB();

    $summary = $pdo->query("
        SELECT
          (SELECT COUNT(*) FROM clientes) AS total_clientes,
          (SELECT COUNT(*) FROM citas) AS total_citas,
          (SELECT COUNT(*) FROM citas WHERE estado = 'pendiente') AS citas_pendientes,
          (SELECT COALESCE(SUM(monto),0) FROM pagos) AS ingresos_totales,
          (SELECT COUNT(*) FROM inventario WHERE estado = 'Agotado') AS items_agotados
    ")->fetch();

    $porLugar = $pdo->query("
        SELECT l.nombre AS lugar, COALESCE(SUM(p.monto), 0) AS total
        FROM lugares l
        LEFT JOIN pagos p ON p.lugar_id = l.id
        GROUP BY l.id, l.nombre
    ")->fetchAll();

    $porServicio = $pdo->query("
        SELECT s.nombre AS servicio, COUNT(c.id) AS total
        FROM servicios s
        LEFT JOIN citas c ON c.servicio_id = s.id
        GROUP BY s.id, s.nombre
    ")->fetchAll();

    $ultimasCitas = $pdo->query("
        SELECT c.id, cl.nombre AS cliente, s.nombre AS servicio,
               l.nombre AS lugar, c.fecha, c.hora, c.estado
        FROM citas c
        JOIN clientes cl ON c.cliente_id = cl.id
        JOIN servicios s ON c.servicio_id = s.id
        JOIN lugares l ON c.lugar_id = l.id
        ORDER BY c.fecha DESC, c.hora DESC
        LIMIT 5
    ")->fetchAll();

    ok(compact('summary', 'porLugar', 'porServicio', 'ultimasCitas'));
}
}