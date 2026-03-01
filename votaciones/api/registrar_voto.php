<?php
// ======================================
// REGISTRAR VOTO
// ======================================
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$input = file_get_contents("php://input");
$datos = json_decode($input, true);

if (!isset($datos['id_votante']) || !isset($datos['id_candidato'])) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Datos incompletos'
    ]);
    exit();
}

require_once 'db.php';

try {
    $id_votante = trim($datos['id_votante']);
    $id_candidato = intval($datos['id_candidato']);

    if (empty($id_votante)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'ID votante requerido'
        ]);
        exit();
    }

    // Verificar que el votante existe en tabla votantes
    $stmt = $conn->prepare("SELECT id_votante, voto_realizado FROM votantes WHERE id_votante = ?");
    $stmt->bind_param("s", $id_votante);
    $stmt->execute();
    $result = $stmt->get_result();
    $votante = $result->fetch_assoc();
    $stmt->close();

    if (!$votante) {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'Votante no registrado en el sistema'
        ]);
        exit();
    }

    // Verificar si ya votó
    if ($votante['voto_realizado'] == 1) {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'Este votante ya ha emitido su voto'
        ]);
        exit();
    }

    // Registrar el voto
    $es_blanco = ($id_candidato === 0 || $id_candidato === NULL) ? 1 : 0;
    
    $stmt = $conn->prepare("INSERT INTO votos (id_candidato, id_votante, es_blanco, valor_voto, fecha_voto) VALUES (?, ?, ?, 1, NOW())");
    
    if (!$stmt) {
        throw new Exception("Error en prepared statement: " . $conn->error);
    }

    $candidato_insert = ($es_blanco == 1) ? NULL : $id_candidato;
    $stmt->bind_param("isi", $candidato_insert, $id_votante, $es_blanco);

    if (!$stmt->execute()) {
        throw new Exception("Error al registrar voto: " . $stmt->error);
    }

    $stmt->close();

    // Actualizar voto_realizado en tabla votantes
    $stmt = $conn->prepare("UPDATE votantes SET voto_realizado = 1 WHERE id_votante = ?");
    $stmt->bind_param("s", $id_votante);
    $stmt->execute();
    $stmt->close();

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Voto registrado correctamente'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error del servidor: ' . $e->getMessage()
    ]);
} finally {
    if (isset($conn)) {
        $conn->close();
    }
}
?>
