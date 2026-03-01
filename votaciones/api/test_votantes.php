<?php
// Script de prueba para verificar los votantes
include 'db.php';

header('Content-Type: text/html; charset=utf-8');

echo "<h2>Prueba de Conexión y Datos de Votantes</h2>";

// Verificar conexión
if ($conn->connect_error) {
    die("Error de conexión: " . $conn->connect_error);
}
echo "<p style='color: green;'>✓ Conexión exitosa a la base de datos 'votaciones'</p>";

// Verificar que la tabla votantes existe
$result = $conn->query("SHOW TABLES LIKE 'votantes'");
if ($result->num_rows === 0) {
    die("<p style='color: red;'>✗ La tabla 'votantes' no existe</p>");
}
echo "<p style='color: green;'>✓ La tabla 'votantes' existe</p>";

// Obtener la estructura de la tabla
echo "<h3>Estructura de la tabla votantes:</h3>";
$result = $conn->query("DESCRIBE votantes");
echo "<table border='1' cellpadding='5'>";
echo "<tr><th>Campo</th><th>Tipo</th><th>Null</th><th>Key</th><th>Default</th><th>Extra</th></tr>";
while($row = $result->fetch_assoc()) {
    echo "<tr>";
    echo "<td>" . $row['Field'] . "</td>";
    echo "<td>" . $row['Type'] . "</td>";
    echo "<td>" . $row['Null'] . "</td>";
    echo "<td>" . $row['Key'] . "</td>";
    echo "<td>" . $row['Default'] . "</td>";
    echo "<td>" . $row['Extra'] . "</td>";
    echo "</tr>";
}
echo "</table>";

// Contar total de votantes
$result = $conn->query("SELECT COUNT(*) as total FROM votantes");
$row = $result->fetch_assoc();
echo "<h3>Total de votantes: " . $row['total'] . "</h3>";

// Mostrar todos los votantes
echo "<h3>Lista de votantes:</h3>";
$result = $conn->query("SELECT * FROM votantes LIMIT 20");
if ($result->num_rows === 0) {
    echo "<p style='color: orange;'>⚠ No hay votantes en la tabla</p>";
} else {
    echo "<table border='1' cellpadding='5'>";
    echo "<tr><th>Código</th><th>Nombre</th><th>Voto Realizado</th></tr>";
    while($row = $result->fetch_assoc()) {
        echo "<tr>";
        echo "<td>" . htmlspecialchars($row['codigo']) . "</td>";
        echo "<td>" . htmlspecialchars($row['nombre']) . "</td>";
        echo "<td>" . (isset($row['voto_realizado']) ? ($row['voto_realizado'] ? 'Sí' : 'No') : 'N/A') . "</td>";
        echo "</tr>";
    }
    echo "</table>";
    
    if ($row['total'] > 20) {
        echo "<p>... y " . ($row['total'] - 20) . " más</p>";
    }
}

// Probar la consulta que usa get_data.php
echo "<h3>Datos formateados (como los devuelve get_data.php):</h3>";
$resultVotantes = $conn->query("SELECT codigo, nombre FROM votantes");
$votantes = [];
while($row = $resultVotantes->fetch_assoc()) {
    $votantes[$row['codigo']] = ['nombre' => $row['nombre']];
}

echo "<pre>";
print_r($votantes);
echo "</pre>";

$conn->close();
?>
