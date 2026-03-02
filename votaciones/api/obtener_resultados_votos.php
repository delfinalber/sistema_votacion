<?php
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
        throw new Exception('Error de conexión a la base de datos');
    }

    $sql = "SELECT
                v.id_candidato AS id,
                COALESCE(c.nombre, 'Votos en blanco') AS nombre,
                COUNT(*) AS total_votos
            FROM votos v
            LEFT JOIN candidatos c ON v.id_candidato = c.id_candidato
            GROUP BY v.id_candidato
            ORDER BY total_votos DESC";

    $result = $conn->query($sql);

    if (!$result) {
        throw new Exception('Error en la consulta: ' . $conn->error);
    }

    $resultados = [];
    while ($row = $result->fetch_assoc()) {
        $resultados[] = [
            'id' => $row['id'] !== null ? (int)$row['id'] : null,
            'nombre' => $row['nombre'],
            'total_votos' => (int)$row['total_votos']
        ];
    }

    echo json_encode([
        'success' => true,
        'resultados' => $resultados,
        'actualizado_en' => date('Y-m-d H:i:s')
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
} finally {
    if (isset($conn)) {
        $conn->close();
    }
}
