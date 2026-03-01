<?php
include 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

$id_votante = $data['codigo'] ?? $data['id_votante'];
$nombre = $data['nombre'];

if (!$id_votante || !$nombre) {
    echo json_encode(['success' => false, 'error' => 'Faltan campos requeridos']);
    exit;
}

$stmt = $conn->prepare("INSERT INTO votantes (id_votante, nombre) VALUES (?, ?)");
$stmt->bind_param("ss", $id_votante, $nombre);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Votante agregado correctamente']);
} else {
    echo json_encode(['success' => false, 'error' => $stmt->error]);
}

$stmt->close();
$conn->close();
?>