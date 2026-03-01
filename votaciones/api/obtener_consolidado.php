<?php
// ======================================
// OBTENER CONSOLIDADO DE VOTOS
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
        throw new Exception("Error de conexión: " . (isset($conn) ? $conn->connect_error : "No conectado"));
    }

    // Obtener votos de PERSONEROS
    $sql_personeros = "SELECT 
                        c.id_candidato,
                        c.nombre,
                        c.numero,
                        c.cargo,
                        COUNT(*) AS total_votos
                      FROM votos v
                      LEFT JOIN candidatos c ON v.id_candidato = c.id_candidato
                      WHERE c.cargo = 'Personero' OR (c.cargo IS NULL AND v.id_candidato IS NULL)
                      GROUP BY v.id_candidato
                      ORDER BY total_votos DESC";

    $result_personeros = $conn->query($sql_personeros);
    
    if (!$result_personeros) {
        throw new Exception("Error en consulta de personeros: " . $conn->error);
    }

    $personeros = [];
    $total_votos_personero = 0;
    
    while ($row = $result_personeros->fetch_assoc()) {
        if ($row['nombre'] !== null) {
            $personeros[] = [
                'id_candidato' => (int)$row['id_candidato'],
                'nombre' => $row['nombre'],
                'numero' => $row['numero'],
                'total_votos' => (int)$row['total_votos']
            ];
            $total_votos_personero += (int)$row['total_votos'];
        }
    }

    // Obtener votos de CONTRALORES
    $sql_contralores = "SELECT 
                         c.id_candidato,
                         c.nombre,
                         c.numero,
                         c.cargo,
                         COUNT(*) AS total_votos
                       FROM votos v
                       LEFT JOIN candidatos c ON v.id_candidato = c.id_candidato
                       WHERE c.cargo = 'Contralor' OR (c.cargo IS NULL AND v.id_candidato IS NULL)
                       GROUP BY v.id_candidato
                       ORDER BY total_votos DESC";

    $result_contralores = $conn->query($sql_contralores);
    
    if (!$result_contralores) {
        throw new Exception("Error en consulta de contralores: " . $conn->error);
    }

    $contralores = [];
    $total_votos_contralor = 0;
    
    while ($row = $result_contralores->fetch_assoc()) {
        if ($row['nombre'] !== null) {
            $contralores[] = [
                'id_candidato' => (int)$row['id_candidato'],
                'nombre' => $row['nombre'],
                'numero' => $row['numero'],
                'total_votos' => (int)$row['total_votos']
            ];
            $total_votos_contralor += (int)$row['total_votos'];
        }
    }

    // Total de votantes registrados
    $stmt = $conn->prepare("SELECT COUNT(*) AS total_registrados FROM votantes");
    $stmt->execute();
    $result_votantes = $stmt->get_result();
    $votantes_data = $result_votantes->fetch_assoc();
    $stmt->close();

    // Total de votos emitidos
    $stmt = $conn->prepare("SELECT COUNT(*) AS total_votaron FROM votantes WHERE voto_realizado = 1");
    $stmt->execute();
    $result_votaron = $stmt->get_result();
    $votaron_data = $result_votaron->fetch_assoc();
    $stmt->close();

    $total_registrados = (int)$votantes_data['total_registrados'];
    $total_votaron = (int)$votaron_data['total_votaron'];

    // Calcular votos en blanco por cargo
    // Como cada votante emite 2 votos (Personero + Contralor)
    $votos_blanco_personero = max(0, $total_votaron - $total_votos_personero);
    $votos_blanco_contralor = max(0, $total_votaron - $total_votos_contralor);

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'personeros' => $personeros,
        'contralores' => $contralores,
        'votos_blanco_personero' => $votos_blanco_personero,
        'votos_blanco_contralor' => $votos_blanco_contralor,
        'total_registrados' => $total_registrados,
        'total_votaron' => $total_votaron
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

