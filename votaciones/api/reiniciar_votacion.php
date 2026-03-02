<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método no permitido']);
    exit;
}

require_once 'db.php';

function obtenerTablaAdministrador(mysqli $conn): string {
    $existeAdministrador = $conn->query("SHOW TABLES LIKE 'administrador'");
    if ($existeAdministrador && $existeAdministrador->num_rows > 0) {
        return 'administrador';
    }

    $existeAdminstrador = $conn->query("SHOW TABLES LIKE 'adminstrador'");
    if ($existeAdminstrador && $existeAdminstrador->num_rows > 0) {
        return 'adminstrador';
    }

    throw new Exception('No existe la tabla administrador');
}

try {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!is_array($data)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Solicitud inválida']);
        exit;
    }

    $usuario = trim($data['usuario_adminstrador'] ?? $data['usuario_administrador'] ?? $data['usuario_admin'] ?? $data['usuario'] ?? '');
    $password = trim($data['password_adminstrador'] ?? $data['password_administrador'] ?? $data['password_admin'] ?? $data['password'] ?? '');

    if ($usuario === '' || $password === '') {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Credenciales de administrador requeridas']);
        exit;
    }

    if (strlen($usuario) > 100 || strlen($password) > 100) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Credenciales inválidas']);
        exit;
    }

    if (!preg_match('/^[A-Za-z0-9._@-]{3,100}$/', $usuario)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Credenciales inválidas']);
        exit;
    }

    $conn = getConnection();

    $tablaAdmin = obtenerTablaAdministrador($conn);

    $stmt = $conn->prepare("SELECT id_administrador, password_admin FROM {$tablaAdmin} WHERE usuario_admin = ? LIMIT 1");
    if (!$stmt) {
        throw new Exception('No se pudo preparar la validación de administrador');
    }

    $stmt->bind_param('s', $usuario);
    $stmt->execute();
    $result = $stmt->get_result();
    $admin = $result->fetch_assoc();
    $stmt->close();

    if (!$admin) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Credenciales inválidas']);
        exit;
    }

    $passwordValida = password_verify($password, $admin['password_admin']) || hash_equals((string)$admin['password_admin'], $password);
    if (!$passwordValida) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Credenciales inválidas']);
        exit;
    }

    $conn->begin_transaction();

    if (!$conn->query("DELETE FROM votos")) {
        throw new Exception('Error al borrar votos: ' . $conn->error);
    }

    if (!$conn->query("UPDATE votantes SET voto_realizado = 0")) {
        throw new Exception('Error al resetear votantes: ' . $conn->error);
    }

    $conn->commit();
    echo json_encode(['success' => true, 'message' => 'Votación reiniciada correctamente']);
} catch (Exception $e) {
    if (isset($conn) && $conn instanceof mysqli) {
        $conn->rollback();
    }
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'No fue posible reiniciar la votación']);
} finally {
    if (isset($conn) && $conn instanceof mysqli) {
        $conn->close();
    }
}
?>