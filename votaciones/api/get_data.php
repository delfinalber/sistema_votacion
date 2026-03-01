<?php
include 'db.php';

header('Content-Type: application/json; charset=utf-8');

$response = [
    'votantes' => [],
    'candidatos' => ['personero' => [], 'contralor' => []],
    'votantesQueVotaron' => [],
    'votos' => ['personero' => [], 'contralor' => []]
];

try {
    // Obtener Votantes
    $resultVotantes = $conn->query("SELECT codigo, nombre FROM votantes");
    if ($resultVotantes === FALSE) {
        throw new Exception("Error al consultar votantes: " . $conn->error);
    }
    while($row = $resultVotantes->fetch_assoc()) {
        $response['votantes'][$row['codigo']] = ['nombre' => $row['nombre']];
    }

    // Obtener Votantes que ya votaron
    $resultVotaron = $conn->query("SELECT codigo FROM votantes WHERE voto_realizado = TRUE");
    if ($resultVotaron === FALSE) {
        throw new Exception("Error al consultar votantes que votaron: " . $conn->error);
    }
    while($row = $resultVotaron->fetch_assoc()) {
        $response['votantesQueVotaron'][] = $row['codigo'];
    }

    // Obtener Candidatos
    $resultCandidatos = $conn->query("SELECT * FROM candidatos");
    if ($resultCandidatos === FALSE) {
        throw new Exception("Error al consultar candidatos: " . $conn->error);
    }
    while($row = $resultCandidatos->fetch_assoc()) {
        if ($row['cargo'] == 'personero') {
            $response['candidatos']['personero'][] = $row;
        } else {
            $response['candidatos']['contralor'][] = $row;
        }
    }

    // Obtener conteos de votos para Personero
    $resultVotosPersonero = $conn->query("
        SELECT v.id_candidato, COUNT(*) as total_votos 
        FROM votos v
        INNER JOIN candidatos c ON v.id_candidato = c.id
        WHERE c.cargo = 'personero' 
        GROUP BY v.id_candidato
    ");
    if ($resultVotosPersonero === FALSE) {
        throw new Exception("Error al consultar votos personero: " . $conn->error);
    }
    while($row = $resultVotosPersonero->fetch_assoc()) {
        $response['votos']['personero'][$row['id_candidato']] = (int)$row['total_votos'];
    }

    // Obtener conteos de votos en blanco para Personero
    $resultVotosBlancoPersonero = $conn->query("
        SELECT COUNT(*) as total_votos 
        FROM votos 
        WHERE cargo = 'personero' AND id_candidato IS NULL
    ");
    if ($resultVotosBlancoPersonero === FALSE) {
        throw new Exception("Error al consultar votos en blanco personero: " . $conn->error);
    }
    $row = $resultVotosBlancoPersonero->fetch_assoc();
    $response['votos']['personero']['blanco'] = (int)$row['total_votos'];

    // Obtener conteos de votos para Contralor
    $resultVotosContralor = $conn->query("
        SELECT v.id_candidato, COUNT(*) as total_votos 
        FROM votos v
        INNER JOIN candidatos c ON v.id_candidato = c.id
        WHERE c.cargo = 'contralor' 
        GROUP BY v.id_candidato
    ");
    if ($resultVotosContralor === FALSE) {
        throw new Exception("Error al consultar votos contralor: " . $conn->error);
    }
    while($row = $resultVotosContralor->fetch_assoc()) {
        $response['votos']['contralor'][$row['id_candidato']] = (int)$row['total_votos'];
    }

    // Obtener conteos de votos en blanco para Contralor
    $resultVotosBlancoContralor = $conn->query("
        SELECT COUNT(*) as total_votos 
        FROM votos 
        WHERE cargo = 'contralor' AND id_candidato IS NULL
    ");
    if ($resultVotosBlancoContralor === FALSE) {
        throw new Exception("Error al consultar votos en blanco contralor: " . $conn->error);
    }
    $row = $resultVotosBlancoContralor->fetch_assoc();
    $response['votos']['contralor']['blanco'] = (int)$row['total_votos'];

    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    $response['error'] = $e->getMessage();
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
}

$conn->close();
?>