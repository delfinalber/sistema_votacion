<?php
include 'db.php';
$data = json_decode(file_get_contents('php://input'), true);
$id_votante = $data['id_votante'];

if (!$id_votante) {
    echo json_encode(['success' => false, 'error' => 'ID de votante requerido']);
    exit;
}

// Preparamos para eliminar de la tabla votantes (esto eliminará votos en cascada si está configurado)
$stmt = $conn->prepare("DELETE FROM votantes WHERE id_votante = ?");
$stmt->bind_param("s", $id_votante);

if ($stmt->execute()) {
    @file_put_contents(__DIR__ . '/_votantes_version.txt', (string) time(), LOCK_EX);
    echo json_encode(['success' => true, 'message' => 'Votante eliminado correctamente']);
} else {
    echo json_encode(['success' => false, 'error' => $stmt->error]);
}
$stmt->close();
$conn->close();
?>