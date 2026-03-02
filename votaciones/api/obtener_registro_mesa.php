<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');

require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método no permitido']);
    exit;
}

try {
    $conn = getConnection();

    $tablaExiste = $conn->query("SHOW TABLES LIKE 'registro_mesa'");
    if (!$tablaExiste || $tablaExiste->num_rows === 0) {
        echo json_encode([
            'success' => true,
            'message' => 'No existe la tabla registro_mesa',
            'total' => 0,
            'registros' => []
        ]);
        exit;
    }

    $columnasResult = $conn->query('SHOW COLUMNS FROM registro_mesa');
    if (!$columnasResult) {
        throw new Exception('No fue posible obtener columnas de registro_mesa');
    }

    $columnas = [];
    while ($col = $columnasResult->fetch_assoc()) {
        $columnas[] = $col['Field'];
    }

    $esquemaLegado = in_array('nombre_profe', $columnas, true) && in_array('nombre_estudiante', $columnas, true);

    if ($esquemaLegado) {
        $sql = "
            SELECT
                id_registro_mesa,
                nombre_profe,
                materia_profe,
                puesto_votacion,
                telefono_profe,
                nombre_estudiante,
                grado_estudiante,
                fecha
            FROM registro_mesa
            ORDER BY id_registro_mesa DESC
        ";

        $result = $conn->query($sql);
        if (!$result) {
            throw new Exception('No fue posible consultar registro_mesa');
        }

        $registros = [];
        while ($row = $result->fetch_assoc()) {
            $accion = 'registro';
            if (
                isset($row['materia_profe'], $row['nombre_profe']) &&
                strtoupper((string)$row['materia_profe']) === 'INGRESO' &&
                stripos((string)$row['nombre_profe'], 'INGRESO') === 0
            ) {
                $accion = 'ingreso';
            }

            $registros[] = [
                'id' => (int)$row['id_registro_mesa'],
                'accion' => $accion,
                'usuario_sesion' => $accion === 'ingreso' ? trim(str_ireplace('INGRESO', '', (string)$row['nombre_profe'])) : '',
                'profesor_nombre' => (string)$row['nombre_profe'],
                'profesor_materia' => (string)$row['materia_profe'],
                'puesto_votacion' => (string)$row['puesto_votacion'],
                'profesor_telefono' => (string)$row['telefono_profe'],
                'jurado_nombre' => (string)$row['nombre_estudiante'],
                'jurado_grado' => (string)$row['grado_estudiante'],
                'fecha_registro' => (string)$row['fecha']
            ];
        }

        echo json_encode([
            'success' => true,
            'message' => 'Registros de mesa obtenidos correctamente',
            'total' => count($registros),
            'registros' => $registros
        ]);
        exit;
    }

    $sql = "
        SELECT
            id_registro,
            accion,
            usuario_sesion,
            profesor_nombre,
            profesor_materia,
            puesto_votacion,
            profesor_telefono,
            jurado_nombre,
            jurado_grado,
            fecha_registro
        FROM registro_mesa
        ORDER BY id_registro DESC
    ";

    $result = $conn->query($sql);
    if (!$result) {
        throw new Exception('No fue posible consultar registro_mesa');
    }

    $registros = [];
    while ($row = $result->fetch_assoc()) {
        $registros[] = [
            'id' => (int)$row['id_registro'],
            'accion' => (string)$row['accion'],
            'usuario_sesion' => (string)$row['usuario_sesion'],
            'profesor_nombre' => (string)$row['profesor_nombre'],
            'profesor_materia' => (string)$row['profesor_materia'],
            'puesto_votacion' => (string)$row['puesto_votacion'],
            'profesor_telefono' => (string)$row['profesor_telefono'],
            'jurado_nombre' => (string)$row['jurado_nombre'],
            'jurado_grado' => (string)$row['jurado_grado'],
            'fecha_registro' => (string)$row['fecha_registro']
        ];
    }

    echo json_encode([
        'success' => true,
        'message' => 'Registros de mesa obtenidos correctamente',
        'total' => count($registros),
        'registros' => $registros
    ]);
} catch (Throwable $e) {
    error_log('Error en obtener_registro_mesa.php: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'No fue posible obtener el registro de mesa']);
}
