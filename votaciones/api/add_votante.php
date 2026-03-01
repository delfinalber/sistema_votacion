<?php
include 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

$codigo = $data['codigo'];
$nombre = $data['nombre'];

$stmt = $conn->prepare("INSERT INTO votantes (codigo, nombre) VALUES (?, ?)");
$stmt->bind_param("ss", $codigo, $nombre);

if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'error' => $stmt->error]);
}

$stmt->close();
$conn->close();
?>