<?php
// ======================================
// VALIDAR CREDENCIALES DE ADMINISTRADOR
// ======================================
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('X-Content-Type-Options: nosniff');

require_once 'db.php';

ini_set('session.use_strict_mode', '1');
ini_set('session.cookie_httponly', '1');
if (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') {
    ini_set('session.cookie_secure', '1');
}
session_start();

function obtenerTablaAdministrador(mysqli $conn): string {
    $existeAdministrador = $conn->query("SHOW TABLES LIKE 'administrador'");
    if ($existeAdministrador && $existeAdministrador->num_rows > 0) {
        return 'administrador';
    }

    throw new Exception('No existe la tabla requerida: administrador');
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $maxIdleSeconds = 1800;
    $lastActivity = (int)($_SESSION['admin_last_activity'] ?? 0);

    if (!empty($_SESSION['admin_authenticated']) && $_SESSION['admin_authenticated'] === true) {
        if ($lastActivity > 0 && (time() - $lastActivity) > $maxIdleSeconds) {
            session_unset();
            session_destroy();
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'Sesión expirada']);
            exit;
        }

        $_SESSION['admin_last_activity'] = time();

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Sesión activa',
            'id_usuario' => $_SESSION['admin_id'] ?? null,
            'usuario' => $_SESSION['admin_user'] ?? null,
            'nombre' => $_SESSION['admin_name'] ?? null
        ]);
        exit;
    }

    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Sesión no autenticada']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método no permitido']);
    exit;
}

// Obtener datos JSON del cuerpo
$data = json_decode(file_get_contents('php://input'), true);

if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Solicitud inválida']);
    exit;
}

if (
    !isset($data['usuario']) &&
    !isset($data['usuario_adminstrador']) &&
    !isset($data['usuario_administrador']) &&
    !isset($data['usuario_admin'])
) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Usuario administrador requerido']);
    exit;
}

if (
    !isset($data['password']) &&
    !isset($data['password_adminstrador']) &&
    !isset($data['password_administrador']) &&
    !isset($data['password_admin'])
) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Password administrador requerido']);
    exit;
}

$usuario = trim($data['usuario_adminstrador'] ?? $data['usuario_administrador'] ?? $data['usuario_admin'] ?? $data['usuario'] ?? '');
$password = trim($data['password_adminstrador'] ?? $data['password_administrador'] ?? $data['password_admin'] ?? $data['password'] ?? '');

if (empty($usuario) || empty($password)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Usuario y contraseña no pueden estar vacíos']);
    exit;
}

if (strlen($usuario) > 100 || strlen($password) > 100) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Credenciales inválidas']);
    exit;
}

if (!preg_match('/^[A-Za-z0-9._@-]{3,100}$/', $usuario)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Usuario inválido']);
    exit;
}

try {
    $conn = getConnection();
    
    $tablaAdmin = obtenerTablaAdministrador($conn);

    // Buscar usuario en la tabla administrador
    $stmt = $conn->prepare("SELECT id_administrador, usuario_admin, password_admin, nombre FROM {$tablaAdmin} WHERE usuario_admin = ? LIMIT 1");
    if (!$stmt) {
        throw new Exception('Error en la consulta: ' . $conn->error);
    }
    
    $stmt->bind_param('s', $usuario);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $row = $result->fetch_assoc();
    $stmt->close();

    if (!$row) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Usuario o contraseña incorrectos']);
        exit;
    }

    // Verificar contraseña en la tabla de administradores
    $passwordValida = password_verify($password, $row['password_admin']) || hash_equals((string)$row['password_admin'], $password);
    
    if (!$passwordValida) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Usuario o contraseña incorrectos']);
        exit;
    }

    session_regenerate_id(true);
    $_SESSION['admin_authenticated'] = true;
    $_SESSION['admin_id'] = (string)$row['id_administrador'];
    $_SESSION['admin_user'] = (string)$row['usuario_admin'];
    $_SESSION['admin_name'] = (string)($row['nombre'] ?? '');
    $_SESSION['admin_last_activity'] = time();
    
    // Credenciales válidas
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Acceso concedido',
        'id_usuario' => $row['id_administrador'],
        'usuario' => $row['usuario_admin'],
        'nombre' => $row['nombre']
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    error_log('Error en validar_admin.php: ' . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'Error en el servidor']);
}
?>
