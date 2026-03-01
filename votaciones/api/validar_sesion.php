<?php
// ======================================
// VALIDACIÓN SEGURA DE SESIÓN
// ======================================
// Evitar inyección SQL usando prepared statements
// y validar credenciales contra la BD

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

// Obtener datos POST
$datos = json_decode(file_get_contents("php://input"), true);

// Validar que los datos existan
if (!isset($datos['usuario']) || !isset($datos['password'])) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Usuario y contraseña requeridos'
    ]);
    exit();
}

// Obtener conexión
require_once 'db.php';
$conn = getConnection();

// Variables para prepared statement
$usuario = trim($datos['usuario']);
$password = trim($datos['password']);

// Validar que no estén vacíos
if (empty($usuario) || empty($password)) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Credenciales inválidas'
    ]);
    exit();
}

// ======================================
// PREPARED STATEMENT PARA EVITAR INYECCIÓN SQL
// ======================================
$stmt = $conn->prepare("SELECT id_usuario, nombre FROM usuario WHERE usuario = ? AND paasword = ?");

if (!$stmt) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error en la consulta'
    ]);
    exit();
}

// Vincular parámetros (s = string, i = integer)
// En este caso usuario es integer, así que usamos i
if (is_numeric($usuario)) {
    $stmt->bind_param("is", intval($usuario), $password);
} else {
    $stmt->bind_param("ss", $usuario, $password);
}

// Ejecutar la consulta
if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error al ejecutar la consulta'
    ]);
    exit();
}

// Obtener resultados
$result = $stmt->get_result();
$user = $result->fetch_assoc();

$stmt->close();

// Verificar si el usuario existe
if ($user) {
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Autenticación exitosa',
        'usuario_id' => $user['id_usuario'],
        'usuario_nombre' => $user['nombre']
    ]);
} else {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Usuario o contraseña incorrectos'
    ]);
}

$conn->close();
?>
