<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'db.php';

function obtenerTablaAdministrador(mysqli $conn): string {
    $existeAdministrador = $conn->query("SHOW TABLES LIKE 'administrador'");
    if ($existeAdministrador && $existeAdministrador->num_rows > 0) {
        return 'administrador';
    }

    $existeAdminstrador = $conn->query("SHOW TABLES LIKE 'adminstrador'");
    if ($existeAdminstrador && $existeAdminstrador->num_rows > 0) {
        return 'adminstrador';
    }

    throw new Exception('No existe la tabla administrador');
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método no permitido']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Solicitud inválida']);
    exit;
}

$usuario = trim($data['usuario_adminstrador'] ?? $data['usuario_administrador'] ?? $data['usuario_admin'] ?? $data['usuario'] ?? '');
$password = trim($data['password_adminstrador'] ?? $data['password_administrador'] ?? $data['password_admin'] ?? $data['password'] ?? '');
$votantes = $data['votantes'] ?? null;

if ($usuario === '' || $password === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Usuario y contraseña requeridos']);
    exit;
}

if (strlen($usuario) > 100 || strlen($password) > 100 || !preg_match('/^[A-Za-z0-9._@-]{3,100}$/', $usuario)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Credenciales inválidas']);
    exit;
}

if (!is_array($votantes) || count($votantes) === 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'No hay votantes para cargar']);
    exit;
}

if (count($votantes) > 5000) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'El archivo excede el límite de 5000 registros']);
    exit;
}

try {
    $conn = getConnection();
    $tablaAdmin = obtenerTablaAdministrador($conn);

    $stmtAdmin = $conn->prepare("SELECT id_administrador, password_admin FROM {$tablaAdmin} WHERE usuario_admin = ? LIMIT 1");
    if (!$stmtAdmin) {
        throw new Exception('No fue posible validar administrador');
    }

    $stmtAdmin->bind_param('s', $usuario);
    $stmtAdmin->execute();
    $admin = $stmtAdmin->get_result()->fetch_assoc();
    $stmtAdmin->close();

    if (!$admin) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Credenciales inválidas']);
        exit;
    }

    $passwordValida = password_verify($password, $admin['password_admin']) || hash_equals((string)$admin['password_admin'], $password);
    if (!$passwordValida) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Credenciales inválidas']);
        exit;
    }

    $stmtExiste = $conn->prepare('SELECT id_votante FROM votantes WHERE id_votante = ? LIMIT 1');
    $stmtInsert = $conn->prepare('INSERT INTO votantes (id_votante, nombre, voto_realizado) VALUES (?, ?, 0)');
    $stmtUpdate = $conn->prepare('UPDATE votantes SET nombre = ?, voto_realizado = 0 WHERE id_votante = ?');

    if (!$stmtExiste || !$stmtInsert || !$stmtUpdate) {
        throw new Exception('No fue posible preparar consultas de carga');
    }

    $insertados = 0;
    $actualizados = 0;
    $errores = 0;
    $procesados = 0;
    $vistos = [];

    $conn->begin_transaction();

    foreach ($votantes as $fila) {
        if (!is_array($fila)) {
            $errores++;
            continue;
        }

        $codigo = trim((string)($fila['codigo'] ?? $fila['id_votante'] ?? $fila['documento'] ?? $fila['numero_documento'] ?? $fila['cedula'] ?? ''));
        $nombre = trim((string)($fila['nombre'] ?? ''));

        if (preg_match('/^\d+\.0+$/', $codigo)) {
            $codigo = explode('.', $codigo)[0];
        }

        if (
            $codigo === '' ||
            $nombre === '' ||
            !preg_match('/^\d{6,11}$/', $codigo) ||
            strlen($nombre) > 150 ||
            preg_match('/[[:cntrl:]]/u', $nombre)
        ) {
            $errores++;
            continue;
        }

        if (isset($vistos[$codigo])) {
            continue;
        }
        $vistos[$codigo] = true;

        $stmtExiste->bind_param('s', $codigo);
        if (!$stmtExiste->execute()) {
            $errores++;
            continue;
        }

        $existe = $stmtExiste->get_result()->fetch_assoc();

        if ($existe) {
            $stmtUpdate->bind_param('ss', $nombre, $codigo);
            if ($stmtUpdate->execute()) {
                $actualizados++;
                $procesados++;
            } else {
                $errores++;
            }
            continue;
        }

        $stmtInsert->bind_param('ss', $codigo, $nombre);
        if ($stmtInsert->execute()) {
            $insertados++;
            $procesados++;
        } else {
            $errores++;
        }
    }

    $conn->commit();

    $stmtExiste->close();
    $stmtInsert->close();
    $stmtUpdate->close();

    echo json_encode([
        'success' => true,
        'message' => 'Carga finalizada',
        'insertados' => $insertados,
        'actualizados' => $actualizados,
        'errores' => $errores,
        'procesados' => $procesados,
        'total_recibidos' => count($votantes)
    ]);
} catch (Throwable $e) {
    if (isset($conn) && $conn instanceof mysqli) {
        try {
            $conn->rollback();
        } catch (Throwable $rollbackError) {
        }
    }

    error_log('Error en cargar_votantes_excel.php: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'No fue posible cargar los votantes']);
}
