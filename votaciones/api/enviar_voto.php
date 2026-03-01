<?php
include 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

$codigoVotante = $data['codigo'];
$votoPersonero = $data['personero']; // ID del candidato a personero
$votoContralor = $data['contralor']; // ID del candidato a contralor

$conn->begin_transaction();

try {
    // Insertar voto para personero
    if ($votoPersonero === 'blanco') {
        // Para voto en blanco, insertamos NULL como id_candidato
        $stmt1 = $conn->prepare("INSERT INTO votos (id_candidato, votante_codigo, cargo) VALUES (NULL, ?, 'personero')");
        $stmt1->bind_param("s", $codigoVotante);
    } else {
        $stmt1 = $conn->prepare("INSERT INTO votos (id_candidato, votante_codigo, cargo) VALUES (?, ?, 'personero')");
        $stmt1->bind_param("is", $votoPersonero, $codigoVotante);
    }
    $stmt1->execute();
    $stmt1->close();

    // Insertar voto para contralor
    if ($votoContralor === 'blanco') {
        // Para voto en blanco, insertamos NULL como id_candidato
        $stmt2 = $conn->prepare("INSERT INTO votos (id_candidato, votante_codigo, cargo) VALUES (NULL, ?, 'contralor')");
        $stmt2->bind_param("s", $codigoVotante);
    } else {
        $stmt2 = $conn->prepare("INSERT INTO votos (id_candidato, votante_codigo, cargo) VALUES (?, ?, 'contralor')");
        $stmt2->bind_param("is", $votoContralor, $codigoVotante);
    }
    $stmt2->execute();
    $stmt2->close();
    
    // Marcar al votante como que ya votó
    $stmt3 = $conn->prepare("UPDATE votantes SET voto_realizado = TRUE WHERE codigo = ?");
    $stmt3->bind_param("s", $codigoVotante);
    $stmt3->execute();
    $stmt3->close();

    $conn->commit();
    echo json_encode(['success' => true]);

} catch (mysqli_sql_exception $exception) {
    $conn->rollback();
    echo json_encode(['success' => false, 'error' => $exception->getMessage()]);
}

$conn->close();
?>