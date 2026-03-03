<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

include 'db.php';

$data = json_decode(file_get_contents('php://input'), true);
$id_candidato = $data['id_candidato'] ?? null;

if (!$id_candidato) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'ID de candidato requerido']);
    exit;
}

// Iniciar transacción para eliminar registros relacionados
$conn->begin_transaction();

try {
    // Primero eliminar votos relacionados a este candidato
    $stmt_votos = $conn->prepare("DELETE FROM votos WHERE id_candidato = ?");
    $stmt_votos->bind_param("i", $id_candidato);
    $stmt_votos->execute();
    $stmt_votos->close();

    // Luego eliminar el candidato
    $stmt = $conn->prepare("DELETE FROM candidatos WHERE id_candidato = ?");
    $stmt->bind_param("i", $id_candidato);
    
    if ($stmt->execute()) {
        $conn->commit();
        http_response_code(200);
        @file_put_contents(__DIR__ . '/_candidatos_version.txt', (string) microtime(true), LOCK_EX);
        echo json_encode(['success' => true, 'message' => 'Candidato y sus votos eliminados correctamente']);
    } else {
        $conn->rollback();
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Error al eliminar: ' . $stmt->error]);
    }
    $stmt->close();
} catch (Exception $e) {
    $conn->rollback();
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error en la transacción: ' . $e->getMessage()]);
}

$conn->close();
?>
