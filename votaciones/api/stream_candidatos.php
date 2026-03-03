<?php
header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');
header('Connection: keep-alive');
header('X-Accel-Buffering: no');

@ini_set('output_buffering', 'off');
@ini_set('zlib.output_compression', 0);

if (function_exists('apache_setenv')) {
    @apache_setenv('no-gzip', '1');
}

while (ob_get_level() > 0) {
    ob_end_flush();
}

$versionFile = __DIR__ . '/_candidatos_version.txt';

if (!file_exists($versionFile)) {
    @file_put_contents($versionFile, (string) time(), LOCK_EX);
}

$ultimoValor = trim((string) @file_get_contents($versionFile));
if ($ultimoValor === '') {
    $ultimoValor = (string) time();
}

echo "retry: 3000\n\n";
echo "event: candidatos_updated\n";
echo 'data: {"ts":' . json_encode($ultimoValor) . "}\n\n";
@flush();

$inicio = time();
$duracionMaxima = 50;

while (true) {
    if (connection_aborted()) {
        break;
    }

    clearstatcache(true, $versionFile);
    $valorActual = trim((string) @file_get_contents($versionFile));

    if ($valorActual !== '' && $valorActual !== $ultimoValor) {
        $ultimoValor = $valorActual;
        echo "event: candidatos_updated\n";
        echo 'data: {"ts":' . json_encode($valorActual) . "}\n\n";
        @flush();
    } else {
        echo ": keep-alive\n\n";
        @flush();
    }

    if ((time() - $inicio) >= $duracionMaxima) {
        break;
    }

    sleep(1);
}

exit;
?>