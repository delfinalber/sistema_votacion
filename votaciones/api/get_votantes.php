<?php
// ======================================
// API: OBTENER LISTA DE VOTANTES
// ======================================
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');

require_once 'db.php';

// ======================================
// CONSULTAR VOTANTES
// ======================================
try {
    $sql = "
        SELECT 
            id_votante,
            nombre,
            voto_realizado
        FROM votantes
        ORDER BY nombre ASC
    ";

    $result = $conn->query($sql);

    if (!$result) {
        throw new Exception("Error en la consulta: " . $conn->error);
    }

    $votantes = array();
    while ($row = $result->fetch_assoc()) {
        $votantes[] = $row;
    }

    echo json_encode(array(
        'success' => true,
        'message' => 'Votantes obtenidos correctamente',
        'total' => count($votantes),
        'votantes' => $votantes
    ));

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array(
        'success' => false,
        'message' => $e->getMessage()
    ));
}

$conn->close();
?>
