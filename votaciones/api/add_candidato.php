<?php
include 'db.php';
$data = json_decode(file_get_contents('php://input'), true);
$cargo = $data['cargo'];
$nombre = $data['nombre'];
$numero = $data['numero'];

$stmt = $conn->prepare("INSERT INTO candidatos (cargo, nombre, numero) VALUES (?, ?, ?)");
$stmt->bind_param("sss", $cargo, $nombre, $numero);

if ($stmt->execute()) {
    $new_id = $conn->insert_id;
    $new_candidato = [
        'id' => $new_id,
        'cargo' => $cargo,
        'nombre' => $nombre,
        'numero' => $numero,
        'foto' => null
    ];
    echo json_encode(['success' => true, 'data' => $new_candidato]);
} else {
    echo json_encode(['success' => false, 'error' => $stmt->error]);
}
$stmt->close();
$conn->close();
?>