<?php
include 'db.php';
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método no permitido']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Solicitud inválida']);
    exit;
}

$id_votante = trim((string)($data['codigo'] ?? $data['id_votante'] ?? ''));
$nombre = trim((string)($data['nombre'] ?? ''));

if (!$id_votante || !$nombre) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Faltan campos requeridos']);
    exit;
}

if (!preg_match('/^\d{6,11}$/', $id_votante)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'El documento debe tener entre 6 y 11 dígitos']);
    exit;
}

if (strlen($nombre) > 150 || preg_match('/[[:cntrl:]]/u', $nombre)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Datos inválidos']);
    exit;
}

$stmt = $conn->prepare("INSERT INTO votantes (id_votante, nombre, voto_realizado) VALUES (?, ?, 0) ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), voto_realizado = 0");

if (!$stmt) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error al preparar consulta']);
    exit;
}

$stmt->bind_param("ss", $id_votante, $nombre);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Votante agregado correctamente']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'No fue posible guardar el votante']);
}

$stmt->close();
$conn->close();
?>