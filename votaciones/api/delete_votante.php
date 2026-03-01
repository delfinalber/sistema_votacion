<?php
include 'db.php';
$data = json_decode(file_get_contents('php://input'), true);
$codigo = $data['codigo'];

// Preparamos para eliminar de la tabla votantes (esto eliminará votos en cascada si está configurado)
$stmt = $conn->prepare("DELETE FROM votantes WHERE codigo = ?");
$stmt->bind_param("s", $codigo);

if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'error' => $stmt->error]);
}
$stmt->close();
$conn->close();
?>