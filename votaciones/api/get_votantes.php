<?php
// ======================================
// API: OBTENER LISTA DE VOTANTES
// ======================================
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');

require_once 'db.php';

ini_set('session.use_strict_mode', '1');
ini_set('session.cookie_httponly', '1');
if (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') {
    ini_set('session.cookie_secure', '1');
}
session_start();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(array(
        'success' => false,
        'message' => 'Método no permitido'
    ));
    exit;
}

// ======================================
// CONSULTAR VOTANTES
// ======================================
try {
    if (empty($_SESSION['admin_authenticated']) || $_SESSION['admin_authenticated'] !== true) {
        http_response_code(401);
        echo json_encode(array(
            'success' => false,
            'message' => 'Sesión de administrador requerida'
        ));
        exit;
    }

    $maxIdleSeconds = 1800;
    $lastActivity = (int)($_SESSION['admin_last_activity'] ?? 0);
    if ($lastActivity > 0 && (time() - $lastActivity) > $maxIdleSeconds) {
        session_unset();
        session_destroy();
        http_response_code(401);
        echo json_encode(array(
            'success' => false,
            'message' => 'Sesión expirada, inicie sesión nuevamente'
        ));
        exit;
    }

    $_SESSION['admin_last_activity'] = time();

    $filtroIdVotante = trim((string)($_GET['id_votante'] ?? ''));
    $usarFiltroId = $filtroIdVotante !== '';

    if ($usarFiltroId && !preg_match('/^\d{1,11}$/', $filtroIdVotante)) {
        http_response_code(400);
        echo json_encode(array(
            'success' => false,
            'message' => 'El filtro de id_votante es inválido'
        ));
        exit;
    }

    $sql = "
        SELECT 
            id_votante,
            nombre,
            voto_realizado
        FROM votantes
        WHERE voto_realizado = 0
    ";

    if ($usarFiltroId) {
        $sql .= " AND id_votante LIKE ?";
    }

    $sql .= " ORDER BY nombre ASC LIMIT 200";

    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception("Error preparando consulta: " . $conn->error);
    }

    if ($usarFiltroId) {
        $filtroLike = $filtroIdVotante . '%';
        $stmt->bind_param('s', $filtroLike);
    }

    if (!$stmt->execute()) {
        throw new Exception("Error ejecutando consulta: " . $stmt->error);
    }

    $result = $stmt->get_result();

    $votantes = array();
    while ($row = $result->fetch_assoc()) {
        $votantes[] = $row;
    }

    $stmt->close();

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
