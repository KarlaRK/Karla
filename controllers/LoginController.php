<?php
class LoginController {

    public static function handle(string $method): void {
        if ($method !== 'POST') err('Método no permitido', 405);

        $data    = body();
        $usuario = trim($data['usuario'] ?? '');
        $clave   = $data['clave'] ?? '';

        if (!$usuario || !$clave) err('Faltan credenciales', 401);

        $pdo  = getDB();
        $stmt = $pdo->prepare(
            "SELECT * FROM usuarios WHERE usuario = ? AND activo = 1 LIMIT 1"
        );
        $stmt->execute([$usuario]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($clave, $user['clave_hash'])) {
            err('Usuario o contraseña incorrectos', 401);
        }

        ok([
            'id'     => (int)$user['id'],
            'nombre' => $user['nombre'],
            'rol'    => $user['rol'],
        ]);
    }
}