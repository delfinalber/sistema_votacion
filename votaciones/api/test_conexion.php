<?php
// Archivo de prueba para verificar la conexión a la base de datos
include 'db.php';

header('Content-Type: application/json; charset=utf-8');

try {
    // Verificar la conexión
    if ($conn->connect_error) {
        throw new Exception("Error de conexión: " . $conn->connect_error);
    }
    
    // Verificar que la base de datos existe
    $result = $conn->query("SELECT DATABASE()");
    $row = $result->fetch_row();
    
    $response = [
        'success' => true,
        'database' => $row[0],
        'host' => $conn->host_info,
        'server_info' => $conn->server_info,
        'charset' => $conn->character_set_name()
    ];
    
    // Verificar que las tablas existen
    $tables = ['candidatos', 'votantes', 'votos'];
    $existing_tables = [];
    
    foreach ($tables as $table) {
        $result = $conn->query("SHOW TABLES LIKE '$table'");
        if ($result->num_rows > 0) {
            $existing_tables[] = $table;
        }
    }
    
    $response['tables'] = $existing_tables;
    
    // Contar registros en cada tabla
    $counts = [];
    foreach ($existing_tables as $table) {
        $result = $conn->query("SELECT COUNT(*) as total FROM $table");
        $row = $result->fetch_assoc();
        $counts[$table] = $row['total'];
    }
    $response['counts'] = $counts;
    
    echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    $response = [
        'success' => false,
        'error' => $e->getMessage()
    ];
    echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
}

$conn->close();
?>
