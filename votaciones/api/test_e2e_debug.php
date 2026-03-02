<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

$baseUrl = 'http://localhost/sistema_votacion/Votaciones/api';
$conn = new mysqli('localhost', 'root', '', 'votaciones', 3307);
$conn->set_charset('utf8mb4');

function postJson($url, $payload) {
    $opts = [
        'http' => [
            'method'  => 'POST',
            'header'  => "Content-Type: application/json\r\n",
            'content' => json_encode($payload),
            'timeout' => 20,
            'ignore_errors' => true
        ]
    ];
    $context = stream_context_create($opts);
    $raw = @file_get_contents($url, false, $context);
    $statusCode = 0;
    if (isset($http_response_header[0]) && preg_match('/\s(\d{3})\s/', $http_response_header[0], $m)) {
        $statusCode = (int)$m[1];
    }
    return [
        'url' => $url,
        'payload' => $payload,
        'status' => $statusCode,
        'raw' => $raw,
        'json' => $raw ? json_decode($raw, true) : null,
        'php_error' => error_get_last()
    ];
}

$id = 'TST_DBG_' . date('YmdHis');
$conn->query("INSERT INTO votantes (id_votante, nombre, voto_realizado) VALUES ('$id', 'DEBUG', 0)");

$resp = postJson($baseUrl . '/registrar_votos_completo.php', [
    'id_votante' => $id,
    'id_personero' => 0,
    'id_contralor' => 0
]);

$result = [
    'id' => $id,
    'resp' => $resp,
    'db_voto_realizado' => $conn->query("SELECT voto_realizado FROM votantes WHERE id_votante='$id'")->fetch_row()[0] ?? null,
    'db_votos_rows' => $conn->query("SELECT COUNT(*) FROM votos WHERE id_votante='$id'")->fetch_row()[0] ?? null
];

echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

$conn->query("DELETE FROM votos WHERE id_votante='$id'");
$conn->query("DELETE FROM votantes WHERE id_votante='$id'");
$conn->close();
