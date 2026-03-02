<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');

require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método no permitido']);
    exit;
}

$payload = json_decode(file_get_contents('php://input'), true);
if (!is_array($payload)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'JSON inválido']);
    exit;
}

$accion = trim((string)($payload['accion'] ?? 'ingreso'));
$usuarioSesion = trim((string)($payload['usuario_sesion'] ?? ''));

$profesorNombre = trim((string)($payload['profesor_nombre'] ?? ''));
$profesorMateria = trim((string)($payload['profesor_materia'] ?? ''));
$puestoVotacion = trim((string)($payload['puesto_votacion'] ?? ''));
$profesorTelefono = trim((string)($payload['profesor_telefono'] ?? ''));
$juradoNombre = trim((string)($payload['jurado_nombre'] ?? ''));
$juradoGrado = trim((string)($payload['jurado_grado'] ?? ''));

if (!in_array($accion, ['ingreso', 'registro'], true)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Acción inválida']);
    exit;
}

$campos = [
    'usuario_sesion' => $usuarioSesion,
    'profesor_nombre' => $profesorNombre,
    'profesor_materia' => $profesorMateria,
    'puesto_votacion' => $puestoVotacion,
    'profesor_telefono' => $profesorTelefono,
    'jurado_nombre' => $juradoNombre,
    'jurado_grado' => $juradoGrado,
];

foreach ($campos as $nombreCampo => $valorCampo) {
    if (strlen($valorCampo) > 150) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => "Valor inválido en {$nombreCampo}"]);
        exit;
    }
    if (preg_match('/[[:cntrl:]]/u', $valorCampo)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => "Caracteres inválidos en {$nombreCampo}"]);
        exit;
    }
}

if ($accion === 'registro') {
    if ($profesorNombre === '' || $profesorMateria === '' || $puestoVotacion === '' || $profesorTelefono === '' || $juradoNombre === '' || $juradoGrado === '') {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Faltan datos del registro de mesa']);
        exit;
    }
}

try {
    $conn = getConnection();

    $verificarTabla = $conn->query("SHOW TABLES LIKE 'registro_mesa'");
    if (!$verificarTabla || $verificarTabla->num_rows === 0) {
        $sqlCrearTabla = "
            CREATE TABLE registro_mesa (
                id_registro INT AUTO_INCREMENT PRIMARY KEY,
                accion VARCHAR(20) NOT NULL,
                usuario_sesion VARCHAR(150) DEFAULT NULL,
                profesor_nombre VARCHAR(150) DEFAULT NULL,
                profesor_materia VARCHAR(150) DEFAULT NULL,
                puesto_votacion VARCHAR(150) DEFAULT NULL,
                profesor_telefono VARCHAR(150) DEFAULT NULL,
                jurado_nombre VARCHAR(150) DEFAULT NULL,
                jurado_grado VARCHAR(150) DEFAULT NULL,
                fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_fecha_registro (fecha_registro),
                INDEX idx_accion (accion)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
        ";

        if (!$conn->query($sqlCrearTabla)) {
            throw new Exception('No fue posible preparar tabla registro_mesa');
        }
    }

    $resultadoColumnas = $conn->query('SHOW COLUMNS FROM registro_mesa');
    if (!$resultadoColumnas) {
        throw new Exception('No fue posible validar estructura de registro_mesa');
    }

    $columnas = [];
    while ($columna = $resultadoColumnas->fetch_assoc()) {
        $columnas[] = $columna['Field'];
    }

    $esquemaLegado = in_array('nombre_profe', $columnas, true) && in_array('nombre_estudiante', $columnas, true);

    if ($esquemaLegado) {
        $telefonoNumerico = preg_replace('/\D+/', '', $profesorTelefono);
        if ($telefonoNumerico === '') {
            $telefonoNumerico = '0';
        }

        if ($accion === 'ingreso') {
            $nombreProfe = substr('INGRESO ' . ($usuarioSesion !== '' ? $usuarioSesion : 'SIN_USUARIO'), 0, 100);
            $materiaProfe = 'INGRESO';
            $puestoLegacy = 'N/A';
            $telefonoLegacy = 0;
            $nombreEstudiante = 'N/A';
            $gradoEstudiante = 'N/A';
        } else {
            $nombreProfe = substr($profesorNombre, 0, 100);
            $materiaProfe = substr($profesorMateria, 0, 100);
            $puestoLegacy = substr($puestoVotacion, 0, 10);
            $telefonoLegacy = (int)substr($telefonoNumerico, 0, 12);
            $nombreEstudiante = substr($juradoNombre, 0, 100);
            $gradoEstudiante = substr($juradoGrado, 0, 10);
        }

        $stmt = $conn->prepare(
            'INSERT INTO registro_mesa (nombre_profe, materia_profe, puesto_votacion, telefono_profe, nombre_estudiante, grado_estudiante) VALUES (?, ?, ?, ?, ?, ?)'
        );

        if (!$stmt) {
            throw new Exception('No fue posible registrar la mesa');
        }

        $stmt->bind_param(
            'sssiss',
            $nombreProfe,
            $materiaProfe,
            $puestoLegacy,
            $telefonoLegacy,
            $nombreEstudiante,
            $gradoEstudiante
        );
    } else {
        $stmt = $conn->prepare(
            'INSERT INTO registro_mesa (accion, usuario_sesion, profesor_nombre, profesor_materia, puesto_votacion, profesor_telefono, jurado_nombre, jurado_grado) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        );

        if (!$stmt) {
            throw new Exception('No fue posible registrar la mesa');
        }

        $stmt->bind_param(
            'ssssssss',
            $accion,
            $usuarioSesion,
            $profesorNombre,
            $profesorMateria,
            $puestoVotacion,
            $profesorTelefono,
            $juradoNombre,
            $juradoGrado
        );
    }

    if (!$stmt->execute()) {
        throw new Exception('No fue posible guardar el registro de mesa');
    }

    $idRegistro = (int)$stmt->insert_id;
    $stmt->close();

    echo json_encode([
        'success' => true,
        'message' => 'Registro de mesa guardado correctamente',
        'id_registro' => $idRegistro,
        'accion' => $accion
    ]);
} catch (Throwable $e) {
    error_log('Error en registrar_mesa.php: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'No fue posible guardar el registro de mesa']);
}
