<?php
// ============================================================
//  Controlador: Inventario
//  GET    /api/inventario       → listar
//  POST   /api/inventario       → crear
//  PATCH  /api/inventario/:id   → actualizar cantidad/estado
//  DELETE /api/inventario/:id   → eliminar
// ============================================================

class InventarioController {

    private static array $ESTADOS = ['Disponible','En uso','Agotado','Por reponer'];

    public static function handle(string $method, ?int $id): void {
        match($method) {
            'GET'    => self::listar(),
            'POST'   => self::crear(),
            'PATCH'  => $id ? self::actualizar($id) : err('ID requerido'),
            'DELETE' => $id ? self::eliminar($id)   : err('ID requerido'),
            default  => err('Método no permitido', 405),
        };
    }

    private static function listar(): void {
        $pdo  = getDB();
        $stmt = $pdo->query("SELECT * FROM inventario ORDER BY producto");
        ok($stmt->fetchAll());
    }

    private static function crear(): void {
        $data        = body();
        $producto    = trim($data['producto']    ?? '');
        $cantidad    = (int)($data['cantidad']   ?? 0);
        $propietario = trim($data['propietario'] ?? '');
        $estado      = $data['estado'] ?? '';
        $notas       = $data['notas']  ?? null;

        if (!$producto || !$propietario || !$estado) {
            err('Faltan campos: producto, propietario, estado');
        }
        if (!in_array($estado, self::$ESTADOS, true)) {
            err('Estado inválido. Valores: ' . implode(', ', self::$ESTADOS));
        }

        $pdo  = getDB();
        $stmt = $pdo->prepare("
            INSERT INTO inventario (producto, cantidad, propietario, estado, notas)
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->execute([$producto, $cantidad, $propietario, $estado, $notas]);
        ok(['id' => (int)$pdo->lastInsertId()]);
    }

    private static function actualizar(int $id): void {
        $data     = body();
        $campos   = [];
        $valores  = [];

        if (isset($data['cantidad'])) {
            $campos[]  = 'cantidad = ?';
            $valores[] = (int)$data['cantidad'];
        }
        if (isset($data['estado'])) {
            if (!in_array($data['estado'], self::$ESTADOS, true)) {
                err('Estado inválido');
            }
            $campos[]  = 'estado = ?';
            $valores[] = $data['estado'];
        }
        if (isset($data['notas'])) {
            $campos[]  = 'notas = ?';
            $valores[] = $data['notas'];
        }

        if (empty($campos)) err('Nada que actualizar');

        $valores[] = $id;
        $pdo  = getDB();
        $stmt = $pdo->prepare(
            "UPDATE inventario SET " . implode(', ', $campos) . " WHERE id = ?"
        );
        $stmt->execute($valores);
        if ($stmt->rowCount() === 0) err('Item no encontrado', 404);
        ok();
    }

    private static function eliminar(int $id): void {
        $pdo  = getDB();
        $stmt = $pdo->prepare("DELETE FROM inventario WHERE id = ?");
        $stmt->execute([$id]);
        if ($stmt->rowCount() === 0) err('Item no encontrado', 404);
        ok();
    }
}