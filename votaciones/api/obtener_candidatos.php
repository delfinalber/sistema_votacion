<?php
// ======================================
// OBTENER CANDIDATOS POR CARGO
// ======================================
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'db.php';

try {
    if (!isset($conn) || $conn->connect_error) {
        throw new Exception("Error de conexión");
    }

    // Obtener todos los candidatos
    $sql = "SELECT id_candidato, nombre, numero, cargo, foto FROM candidatos ORDER BY cargo, numero";
    $result = $conn->query($sql);
    
    if (!$result) {
        throw new Exception("Error en consulta: " . $conn->error);
    }

    $personeros = [];
    $contralores = [];

    while ($row = $result->fetch_assoc()) {
        if ($row['cargo'] === 'Personero' || strpos(strtolower($row['cargo']), 'personero') !== false) {
            $personeros[] = $row;
        } elseif ($row['cargo'] === 'Contralor' || strpos(strtolower($row['cargo']), 'contralor') !== false) {
            $contralores[] = $row;
        }
    }

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'personeros' => $personeros,
        'contralores' => $contralores
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
} finally {
    if (isset($conn)) {
        $conn->close();
    }
}
?>
