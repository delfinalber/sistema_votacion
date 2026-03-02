<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

$baseUrl = 'http://localhost/sistema_votacion/Votaciones/api';
$conn = new mysqli('localhost', 'root', '', 'votaciones', 3307);
if ($conn->connect_error) {
    echo json_encode(['ok' => false, 'error' => 'DB connect: ' . $conn->connect_error], JSON_PRETTY_PRINT);
    exit(1);
}
$conn->set_charset('utf8mb4');

function postJson($url, $payload) {
    $opts = [
        'http' => [
            'method'  => 'POST',
            'header'  => "Content-Type: application/json\r\n",
            'content' => json_encode($payload),
            'timeout' => 20
        ]
    ];
    $context = stream_context_create($opts);
    $raw = @file_get_contents($url, false, $context);
    $statusCode = 0;
    if (isset($http_response_header[0]) && preg_match('/\s(\d{3})\s/', $http_response_header[0], $m)) {
        $statusCode = (int)$m[1];
    }
    return ['status' => $statusCode, 'raw' => $raw, 'json' => $raw ? json_decode($raw, true) : null];
}

function scalar($conn, $sql) {
    $res = $conn->query($sql);
    if (!$res) return null;
    $row = $res->fetch_row();
    return $row ? $row[0] : null;
}

$report = [
    'ok' => true,
    'steps' => []
];

$personeroId = scalar($conn, "SELECT id_candidato FROM candidatos WHERE cargo='Personero' LIMIT 1");
$contralorId = scalar($conn, "SELECT id_candidato FROM candidatos WHERE cargo='Contralor' LIMIT 1");
$personeroId = $personeroId ? (int)$personeroId : 0;
$contralorId = $contralorId ? (int)$contralorId : 0;

$ts = date('YmdHis');
$votante1 = 'TST_' . $ts . '_A';
$votante2 = 'TST_' . $ts . '_B';

$conn->query("DELETE FROM votos WHERE id_votante IN ('$votante1','$votante2')");
$conn->query("DELETE FROM votantes WHERE id_votante IN ('$votante1','$votante2')");

$conn->query("INSERT INTO votantes (id_votante, nombre, voto_realizado) VALUES ('$votante1', 'TEST E2E A', 0)");
$conn->query("INSERT INTO votantes (id_votante, nombre, voto_realizado) VALUES ('$votante2', 'TEST E2E B', 0)");

$report['steps'][] = ['setup' => ['votante1' => $votante1, 'votante2' => $votante2, 'personeroId' => $personeroId, 'contralorId' => $contralorId]];

$val1 = postJson($baseUrl . '/validar_votante.php', ['id_votante' => $votante1]);
$report['steps'][] = ['validar_votante_1' => $val1['json']];
if (!($val1['json']['success'] ?? false)) $report['ok'] = false;

$vote1 = postJson($baseUrl . '/registrar_votos_completo.php', [
    'id_votante' => $votante1,
    'id_personero' => $personeroId,
    'id_contralor' => $contralorId
]);
$report['steps'][] = ['registrar_voto_1' => $vote1['json']];
if (!($vote1['json']['success'] ?? false)) $report['ok'] = false;

$v1Realizado = (int)scalar($conn, "SELECT voto_realizado FROM votantes WHERE id_votante='$votante1'");
$v1TotalRows = (int)scalar($conn, "SELECT COUNT(*) FROM votos WHERE id_votante='$votante1'");
$v1Personero = (int)scalar($conn, "SELECT COUNT(*) FROM votos v LEFT JOIN candidatos c ON v.id_candidato=c.id_candidato WHERE v.id_votante='$votante1' AND c.cargo='Personero'");
$v1Contralor = (int)scalar($conn, "SELECT COUNT(*) FROM votos v LEFT JOIN candidatos c ON v.id_candidato=c.id_candidato WHERE v.id_votante='$votante1' AND c.cargo='Contralor'");
$v1Blancos = (int)scalar($conn, "SELECT COUNT(*) FROM votos WHERE id_votante='$votante1' AND es_blanco=1");
$report['steps'][] = ['validacion_db_votante_1' => [
    'voto_realizado' => $v1Realizado,
    'filas_en_votos' => $v1TotalRows,
    'filas_personero' => $v1Personero,
    'filas_contralor' => $v1Contralor,
    'filas_blanco' => $v1Blancos
]];
if (!($v1Realizado === 1 && $v1TotalRows === 2 && $v1Personero === 1 && $v1Contralor === 1)) $report['ok'] = false;

$vote1Again = postJson($baseUrl . '/registrar_votos_completo.php', [
    'id_votante' => $votante1,
    'id_personero' => $personeroId,
    'id_contralor' => $contralorId
]);
$v1TotalRowsAfterAgain = (int)scalar($conn, "SELECT COUNT(*) FROM votos WHERE id_votante='$votante1'");
$report['steps'][] = ['doble_voto_bloqueado' => [
    'respuesta' => $vote1Again['json'],
    'filas_en_votos_despues' => $v1TotalRowsAfterAgain
]];
if (($vote1Again['json']['success'] ?? true) !== false || $v1TotalRowsAfterAgain !== 2) $report['ok'] = false;

$val2 = postJson($baseUrl . '/validar_votante.php', ['id_votante' => $votante2]);
$vote2 = postJson($baseUrl . '/registrar_votos_completo.php', [
    'id_votante' => $votante2,
    'id_personero' => 0,
    'id_contralor' => 0
]);
$v2Realizado = (int)scalar($conn, "SELECT voto_realizado FROM votantes WHERE id_votante='$votante2'");
$v2TotalRows = (int)scalar($conn, "SELECT COUNT(*) FROM votos WHERE id_votante='$votante2'");
$v2Blancos = (int)scalar($conn, "SELECT COUNT(*) FROM votos WHERE id_votante='$votante2' AND es_blanco=1");
$report['steps'][] = ['votos_en_blanco' => [
    'validar' => $val2['json'],
    'registrar' => $vote2['json'],
    'voto_realizado' => $v2Realizado,
    'filas_en_votos' => $v2TotalRows,
    'filas_blanco' => $v2Blancos
]];
if (!(($val2['json']['success'] ?? false) && ($vote2['json']['success'] ?? false) && $v2Realizado === 1 && $v2TotalRows === 2 && $v2Blancos === 2)) $report['ok'] = false;

$conn->query("DELETE FROM votos WHERE id_votante IN ('$votante1','$votante2')");
$conn->query("DELETE FROM votantes WHERE id_votante IN ('$votante1','$votante2')");
$report['steps'][] = ['cleanup' => 'ok'];

echo json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
$conn->close();
