<?php
// ======================================
// REGISTRAR AMBOS VOTOS EN UNA TRANSACCIÓN
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

if (!isset($datos['id_votante']) || !isset($datos['id_personero']) || !isset($datos['id_contralor'])) {
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
    $id_personero = intval($datos['id_personero']);
    $id_contralor = intval($datos['id_contralor']);

    if (empty($id_votante)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'ID votante requerido'
        ]);
        exit();
    }

    // Iniciar transacción
    $conn->begin_transaction();

    // Verificar que el votante existe en tabla votantes
    $stmt = $conn->prepare("SELECT id_votante, voto_realizado FROM votantes WHERE id_votante = ? FOR UPDATE");
    $stmt->bind_param("s", $id_votante);
    $stmt->execute();
    $result = $stmt->get_result();
    $votante = $result->fetch_assoc();
    $stmt->close();

    if (!$votante) {
        $conn->rollback();
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'Votante no registrado en el sistema'
        ]);
        exit();
    }

    // Verificar si ya votó
    if ($votante['voto_realizado'] == 1) {
        $conn->rollback();
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'Este votante ya ha emitido su voto'
        ]);
        exit();
    }

    // Registrar voto de Personero
    $es_blanco_personero = ($id_personero === 0 || $id_personero === null) ? 1 : 0;
    $candidato_personero = ($es_blanco_personero == 1) ? null : $id_personero;
    
    $stmt = $conn->prepare("INSERT INTO votos (id_candidato, id_votante, es_blanco, valor_voto, fecha_voto) VALUES (?, ?, ?, 1, NOW())");
    $stmt->bind_param("isi", $candidato_personero, $id_votante, $es_blanco_personero);
    
    if (!$stmt->execute()) {
        throw new Exception("Error al registrar voto de personero: " . $stmt->error);
    }
    $stmt->close();

    // Registrar voto de Contralor
    $es_blanco_contralor = ($id_contralor === 0 || $id_contralor === null) ? 1 : 0;
    $candidato_contralor = ($es_blanco_contralor == 1) ? null : $id_contralor;
    
    $stmt = $conn->prepare("INSERT INTO votos (id_candidato, id_votante, es_blanco, valor_voto, fecha_voto) VALUES (?, ?, ?, 1, NOW())");
    $stmt->bind_param("isi", $candidato_contralor, $id_votante, $es_blanco_contralor);
    
    if (!$stmt->execute()) {
        throw new Exception("Error al registrar voto de contralor: " . $stmt->error);
    }
    $stmt->close();

    // Actualizar voto_realizado en tabla votantes
    $stmt = $conn->prepare("UPDATE votantes SET voto_realizado = 1 WHERE id_votante = ?");
    $stmt->bind_param("s", $id_votante);
    
    if (!$stmt->execute()) {
        throw new Exception("Error al actualizar votante: " . $stmt->error);
    }
    $stmt->close();

    // Confirmar transacción
    $conn->commit();

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Voto registrado correctamente',
        'votante' => $id_votante
    ]);

} catch (Exception $e) {
    $conn->rollback();
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error del servidor: ' . $e->getMessage()
    ]);
}

$conn->close();
?>
