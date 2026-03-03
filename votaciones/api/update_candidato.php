<?php
include 'db.php';
$data = json_decode(file_get_contents('php://input'), true);
$id = $data['id'];
$campo = $data['campo']; // nombre, numero, o foto
$valor = $data['valor'];

// Validar que el campo sea uno de los permitidos para evitar inyección SQL
$allowed_fields = ['nombre', 'numero', 'foto'];
if (!in_array($campo, $allowed_fields)) {
    echo json_encode(['success' => false, 'error' => 'Campo no válido']);
    exit;
}

// Construir la consulta de manera segura
switch($campo) {
    case 'nombre':
        $stmt = $conn->prepare("UPDATE candidatos SET nombre = ? WHERE id = ?");
        break;
    case 'numero':
        $stmt = $conn->prepare("UPDATE candidatos SET numero = ? WHERE id = ?");
        break;
    case 'foto':
        $stmt = $conn->prepare("UPDATE candidatos SET foto = ? WHERE id = ?");
        break;
    default:
        echo json_encode(['success' => false, 'error' => 'Campo no válido']);
        exit;
}

$stmt->bind_param("si", $valor, $id);

if ($stmt->execute()) {
    @file_put_contents(__DIR__ . '/_candidatos_version.txt', (string) microtime(true), LOCK_EX);
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'error' => $stmt->error]);
}
$stmt->close();
$conn->close();
?>