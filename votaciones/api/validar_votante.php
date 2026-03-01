<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require 'db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

try {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['id_votante']) || empty($data['id_votante'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID de votante no proporcionado']);
        exit;
    }

    $id_votante = $data['id_votante'];

    // Usar prepared statement para mayor seguridad
    $query = "SELECT id_votante, nombre, voto_realizado FROM votantes WHERE id_votante = ?";
    $stmt = $conn->prepare($query);
    
    if (!$stmt) {
        throw new Exception("Error en preparar consulta: " . $conn->error);
    }

    $stmt->bind_param("s", $id_votante);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Votante no encontrado']);
        $stmt->close();
        exit;
    }

    $votante = $result->fetch_assoc();
    $stmt->close();

    // Verificar si ya ha votado
    if ($votante['voto_realizado'] == 1) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Este votante ya ha emitido su voto']);
        exit;
    }

    // Votante válido y puede votar
    echo json_encode([
        'success' => true,
        'message' => 'Votante verificado',
        'votante' => [
            'id_votante' => $votante['id_votante'],
            'nombre' => $votante['nombre']
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error del servidor: ' . $e->getMessage()
    ]);
}

$conn->close();
?>
