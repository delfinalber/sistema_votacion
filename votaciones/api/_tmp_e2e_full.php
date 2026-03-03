<?php
header('Content-Type: application/json; charset=utf-8');
date_default_timezone_set('America/Bogota');

function callGet(string $url): array {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 20,
    ]);
    $raw = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err = curl_error($ch);
    curl_close($ch);

    return [
        'url' => $url,
        'status' => $status,
        'raw' => $raw,
        'json' => is_string($raw) ? json_decode($raw, true) : null,
        'error' => $err ?: null,
    ];
}

function callPostJson(string $url, array $payload): array {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
        CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE),
        CURLOPT_TIMEOUT => 20,
    ]);
    $raw = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err = curl_error($ch);
    curl_close($ch);

    return [
        'url' => $url,
        'payload' => $payload,
        'status' => $status,
        'raw' => $raw,
        'json' => is_string($raw) ? json_decode($raw, true) : null,
        'error' => $err ?: null,
    ];
}

function passFail(bool $condition): string {
    return $condition ? 'PASS' : 'FAIL';
}

$baseUrl = 'http://localhost/sistema_votacion/votaciones/api';
$db = new mysqli('localhost', 'root', '', 'votaciones', 3307);
$db->set_charset('utf8mb4');

$testRunId = 'TST_FULL_' . date('YmdHis') . '_' . random_int(100, 999);
$testId = (string) random_int(1000000000, 9999999999);
$mesaUser = 'E2E_' . $testRunId;

$report = [
    'meta' => [
        'test_id' => $testId,
        'test_run_id' => $testRunId,
        'timestamp' => date('Y-m-d H:i:s'),
        'base_url' => $baseUrl,
    ],
    'steps' => [],
    'cleanup' => [],
    'summary' => [
        'passed' => 0,
        'failed' => 0,
    ],
];

if ($db->connect_error) {
    http_response_code(500);
    echo json_encode([
        'fatal' => 'No se pudo conectar a DB',
        'error' => $db->connect_error,
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $step = callPostJson($baseUrl . '/validar_admin.php', [
        'usuario_adminstrador' => 'rosa123',
        'password_adminstrador' => 'rosa123',
    ]);
    $ok = $step['status'] === 200 && !empty($step['json']['success']);
    $report['steps'][] = ['name' => 'validar_admin', 'result' => passFail($ok), 'detail' => $step];

    $step = callPostJson($baseUrl . '/validar_sesion.php', [
        'usuario' => '123',
        'password' => '123',
    ]);
    $ok = in_array($step['status'], [200, 401], true) && is_array($step['json']) && array_key_exists('success', $step['json']);
    $report['steps'][] = ['name' => 'validar_sesion_respuesta_json', 'result' => passFail($ok), 'detail' => $step];

    $step = callPostJson($baseUrl . '/cargar_votantes_excel.php', [
        'usuario_adminstrador' => 'rosa123',
        'password_adminstrador' => 'rosa123',
        'votantes' => [
            ['documento' => $testId, 'nombre' => 'E2E VOTANTE ' . $testRunId],
        ],
    ]);
    $ok = $step['status'] === 200 && !empty($step['json']['success']);
    $report['steps'][] = ['name' => 'cargar_votantes_excel', 'result' => passFail($ok), 'detail' => $step];

    $step = callGet($baseUrl . '/get_votantes.php?t=' . time());
    $inList = false;
    if (!empty($step['json']['success']) && is_array($step['json']['votantes'])) {
        foreach ($step['json']['votantes'] as $v) {
            if ((string)($v['id_votante'] ?? '') === (string)$testId) {
                $inList = true;
                break;
            }
        }
    }
    $ok = $step['status'] === 200 && $inList;
    $report['steps'][] = ['name' => 'get_votantes_incluye_test', 'result' => passFail($ok), 'detail' => $step];

    $step = callPostJson($baseUrl . '/validar_votante.php', ['id_votante' => $testId]);
    $ok = $step['status'] === 200 && !empty($step['json']['success']);
    $report['steps'][] = ['name' => 'validar_votante', 'result' => passFail($ok), 'detail' => $step];

    $step = callPostJson($baseUrl . '/registrar_votos_completo.php', [
        'id_votante' => $testId,
        'id_personero' => 0,
        'id_contralor' => 0,
    ]);
    $ok = $step['status'] === 200 && !empty($step['json']['success']);
    $report['steps'][] = ['name' => 'registrar_votos_completo_primero', 'result' => passFail($ok), 'detail' => $step];

    $step = callPostJson($baseUrl . '/registrar_votos_completo.php', [
        'id_votante' => $testId,
        'id_personero' => 0,
        'id_contralor' => 0,
    ]);
    $ok = $step['status'] >= 400 || (is_array($step['json']) && empty($step['json']['success']));
    $report['steps'][] = ['name' => 'registrar_votos_completo_bloquea_duplicado', 'result' => passFail($ok), 'detail' => $step];

    $step = callGet($baseUrl . '/obtener_resultados_votos.php?t=' . time());
    $ok = $step['status'] === 200 && !empty($step['json']['success']) && is_array($step['json']['resultados']);
    $report['steps'][] = ['name' => 'obtener_resultados_votos', 'result' => passFail($ok), 'detail' => $step];

    $step = callGet($baseUrl . '/obtener_consolidado.php?t=' . time());
    $ok = $step['status'] === 200 && !empty($step['json']['success']) && isset($step['json']['personeros']) && isset($step['json']['contralores']);
    $report['steps'][] = ['name' => 'obtener_consolidado', 'result' => passFail($ok), 'detail' => $step];

    $step = callPostJson($baseUrl . '/registrar_mesa.php', [
        'accion' => 'ingreso',
        'usuario_sesion' => $mesaUser,
    ]);
    $ok = $step['status'] === 200 && !empty($step['json']['success']);
    $report['steps'][] = ['name' => 'registrar_mesa_ingreso', 'result' => passFail($ok), 'detail' => $step];

    $step = callPostJson($baseUrl . '/registrar_mesa.php', [
        'accion' => 'registro',
        'usuario_sesion' => $mesaUser,
        'profesor_nombre' => 'PROF E2E',
        'profesor_materia' => 'SISTEMAS',
        'puesto_votacion' => 'PUESTO E2E',
        'profesor_telefono' => '3000000000',
        'jurado_nombre' => 'JURADO E2E',
        'jurado_grado' => '11-A',
    ]);
    $ok = $step['status'] === 200 && !empty($step['json']['success']);
    $report['steps'][] = ['name' => 'registrar_mesa_registro', 'result' => passFail($ok), 'detail' => $step];

    $step = callGet($baseUrl . '/obtener_registro_mesa.php?t=' . time());
    $foundMesa = false;
    if (!empty($step['json']['success']) && is_array($step['json']['registros'])) {
        foreach ($step['json']['registros'] as $r) {
            if (($r['usuario_sesion'] ?? '') === $mesaUser) {
                $foundMesa = true;
                break;
            }
        }
    }
    $ok = $step['status'] === 200 && $foundMesa;
    $report['steps'][] = ['name' => 'obtener_registro_mesa_incluye_test', 'result' => passFail($ok), 'detail' => $step];

} finally {
    $deleteVotes = $db->query("DELETE FROM votos WHERE id_votante='" . $db->real_escape_string($testId) . "'");
    $report['cleanup'][] = ['delete_votos' => $deleteVotes ? true : false];

    $resetVoter = $db->query("UPDATE votantes SET voto_realizado=0 WHERE id_votante='" . $db->real_escape_string($testId) . "'");
    $report['cleanup'][] = ['reset_voto_realizado' => $resetVoter ? true : false];

    $deleteVoter = $db->query("DELETE FROM votantes WHERE id_votante='" . $db->real_escape_string($testId) . "'");
    $report['cleanup'][] = ['delete_votante' => $deleteVoter ? true : false];

    $deleteMesa = $db->query("DELETE FROM registro_mesa WHERE usuario_sesion='" . $db->real_escape_string($mesaUser) . "'");
    $report['cleanup'][] = ['delete_registro_mesa' => $deleteMesa ? true : false];

    $db->close();
}

foreach ($report['steps'] as $s) {
    if (($s['result'] ?? '') === 'PASS') $report['summary']['passed']++;
    else $report['summary']['failed']++;
}

echo json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
