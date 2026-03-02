<?php
// ======================================
// VALIDAR CREDENCIALES DE ADMINISTRADOR
// ======================================
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método no permitido']);
    exit;
}

// Obtener datos JSON del cuerpo
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['usuario']) || !isset($data['password'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Usuario y contraseña requeridos']);
    exit;
}

$usuario = trim($data['usuario']);
$password = trim($data['password']);

if (empty($usuario) || empty($password)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Usuario y contraseña no pueden estar vacíos']);
    exit;
}

try {
    $conn = getConnection();
    
    // Buscar usuario en la tabla
    $stmt = $conn->prepare("SELECT id_usuario, usuario, password, nombre FROM usuario WHERE usuario = ?");
    if (!$stmt) {
        throw new Exception('Error en la consulta: ' . $conn->error);
    }
    
    $stmt->bind_param('s', $usuario);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Usuario o contraseña incorrectos']);
        $stmt->close();
        exit;
    }
    
    $row = $result->fetch_assoc();
    $stmt->close();
    
    // Verificar contraseña
    // Primero intenta con password_verify (si está encriptada con password_hash)
    // Si no funciona, compara directamente
    $passwordValida = password_verify($password, $row['password']) || $password === $row['password'];
    
    if (!$passwordValida) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Usuario o contraseña incorrectos']);
        exit;
    }
    
    // Credenciales válidas
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Acceso concedido',
        'id_usuario' => $row['id_usuario'],
        'usuario' => $row['usuario'],
        'nombre' => $row['nombre']
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    error_log('Error en validar_admin.php: ' . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'Error en el servidor']);
}
?>
