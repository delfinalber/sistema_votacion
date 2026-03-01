<?php
// ======================================
// VALIDACIÓN SEGURA DE SESIÓN
// ======================================
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');

// Manejar preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Obtener datos POST
$input = file_get_contents("php://input");
$datos = json_decode($input, true);

// Validaciones iniciales
if (!isset($datos['usuario']) || !isset($datos['password'])) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Usuario y contraseña requeridos',
        'debug' => 'Datos recibidos: ' . $input
    ]);
    exit();
}

// Obtener conexión a la BD
require_once 'db.php';

try {
    // Verificar que la conexión existe
    if (!isset($conn) || $conn->connect_error) {
        throw new Exception("Error de conexión: " . (isset($conn) ? $conn->connect_error : "Conexión no inicializada"));
    }

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

    // Query con el nombre correcto del campo (paasword con dos 'a')
    $sql = "SELECT id_usuario, nombre FROM usuario WHERE usuario = ? AND paasword = ?";
    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        throw new Exception("Error en prepared statement: " . $conn->error);
    }

    // Determinar tipo de datos
    if (is_numeric($usuario)) {
        $usuario_int = intval($usuario);
        $stmt->bind_param("is", $usuario_int, $password);
    } else {
        $stmt->bind_param("ss", $usuario, $password);
    }

    // Ejecutar consulta
    if (!$stmt->execute()) {
        throw new Exception("Error al ejecutar: " . $stmt->error);
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

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error del servidor: ' . $e->getMessage()
    ]);
}
?>
