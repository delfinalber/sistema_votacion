<?php
// Script para diagnosticar problemas con los votos
include 'db.php';

header('Content-Type: text/html; charset=utf-8');

echo "<h2>Diagnóstico de Votos</h2>";

// Verificar estructura de la tabla votos
echo "<h3>1. Estructura de la tabla votos:</h3>";
$result = $conn->query("DESCRIBE votos");
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

// Ver todos los votos
echo "<h3>2. Todos los votos registrados:</h3>";
$result = $conn->query("SELECT * FROM votos ORDER BY cargo, id_candidato");
echo "<table border='1' cellpadding='5'>";
echo "<tr><th>ID</th><th>ID Candidato</th><th>Votante Código</th><th>Cargo</th></tr>";
while($row = $result->fetch_assoc()) {
    echo "<tr>";
    echo "<td>" . $row['id'] . "</td>";
    echo "<td>" . ($row['id_candidato'] ? $row['id_candidato'] : 'NULL (voto en blanco)') . "</td>";
    echo "<td>" . htmlspecialchars($row['votante_codigo']) . "</td>";
    echo "<td>" . htmlspecialchars($row['cargo']) . "</td>";
    echo "</tr>";
}
echo "</table>";

// Contar votos por cargo
echo "<h3>3. Conteo de votos por cargo:</h3>";
$result = $conn->query("SELECT cargo, COUNT(*) as total FROM votos GROUP BY cargo");
echo "<table border='1' cellpadding='5'>";
echo "<tr><th>Cargo</th><th>Total Votos</th></tr>";
while($row = $result->fetch_assoc()) {
    echo "<tr>";
    echo "<td>" . htmlspecialchars($row['cargo']) . "</td>";
    echo "<td>" . $row['total'] . "</td>";
    echo "</tr>";
}
echo "</table>";

// Ver votos de personero con detalles
echo "<h3>4. Votos de Personero:</h3>";
$result = $conn->query("
    SELECT v.id, v.id_candidato, c.nombre as candidato_nombre, COUNT(*) as total
    FROM votos v
    LEFT JOIN candidatos c ON v.id_candidato = c.id
    WHERE v.cargo = 'personero'
    GROUP BY v.id_candidato
");
if ($result) {
    echo "<table border='1' cellpadding='5'>";
    echo "<tr><th>ID Candidato</th><th>Nombre Candidato</th><th>Total Votos</th></tr>";
    while($row = $result->fetch_assoc()) {
        echo "<tr>";
        echo "<td>" . ($row['id_candidato'] ? $row['id_candidato'] : 'NULL') . "</td>";
        echo "<td>" . htmlspecialchars($row['candidato_nombre'] ?: 'Voto en Blanco') . "</td>";
        echo "<td>" . $row['total'] . "</td>";
        echo "</tr>";
    }
    echo "</table>";
} else {
    echo "<p>Error: " . $conn->error . "</p>";
}

// Ver votos de contralor con detalles
echo "<h3>5. Votos de Contralor:</h3>";
$result = $conn->query("
    SELECT v.id, v.id_candidato, c.nombre as candidato_nombre, COUNT(*) as total
    FROM votos v
    LEFT JOIN candidatos c ON v.id_candidato = c.id
    WHERE v.cargo = 'contralor'
    GROUP BY v.id_candidato
");
if ($result) {
    echo "<table border='1' cellpadding='5'>";
    echo "<tr><th>ID Candidato</th><th>Nombre Candidato</th><th>Total Votos</th></tr>";
    while($row = $result->fetch_assoc()) {
        echo "<tr>";
        echo "<td>" . ($row['id_candidato'] ? $row['id_candidato'] : 'NULL') . "</td>";
        echo "<td>" . htmlspecialchars($row['candidato_nombre'] ?: 'Voto en Blanco') . "</td>";
        echo "<td>" . $row['total'] . "</td>";
        echo "</tr>";
    }
    echo "</table>";
} else {
    echo "<p>Error: " . $conn->error . "</p>";
}

// Ver candidatos
echo "<h3>6. Candidatos Registrados:</h3>";
$result = $conn->query("SELECT * FROM candidatos");
echo "<table border='1' cellpadding='5'>";
echo "<tr><th>ID</th><th>Nombre</th><th>Número</th><th>Cargo</th></tr>";
while($row = $result->fetch_assoc()) {
    echo "<tr>";
    echo "<td>" . $row['id'] . "</td>";
    echo "<td>" . htmlspecialchars($row['nombre']) . "</td>";
    echo "<td>" . htmlspecialchars($row['numero']) . "</td>";
    echo "<td>" . htmlspecialchars($row['cargo']) . "</td>";
    echo "</tr>";
}
echo "</table>";

$conn->close();
?>
