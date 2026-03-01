<?php
include 'db.php';

// Reinicia la tabla de votos
$sql_truncate = "TRUNCATE TABLE votos";

if ($conn->query($sql_truncate) === TRUE) {
    // Resetea la columna voto_realizado en la tabla de votantes
    $sql_update = "UPDATE votantes SET voto_realizado = FALSE";
    if ($conn->query($sql_update) === TRUE) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Error al actualizar votantes: ' . $conn->error]);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Error al reiniciar votos: ' . $conn->error]);
}

$conn->close();
?>