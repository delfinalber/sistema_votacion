<?php
// ======================================
// CONFIGURACIÓN DE LA BASE DE DATOS
// ======================================
define('DBHOST', 'localhost');
define('DBUSER', 'root');
define('DBPASS', '');  // ¡Cambia esto!
define('DBNAME', 'votaciones');
define('DBCHARSET', 'utf8mb4');
define('DBPORT', 3307);  // Puerto estándar MySQL/MariaDB

// ======================================
// CREAR LA CONEXIÓN
// ======================================
// Si DBPORT está definido, usa ese puerto, si no usa el predeterminado
if (defined('DBPORT')) {
    $conn = new mysqli(DBHOST, DBUSER, DBPASS, DBNAME, DBPORT);
} else {
    $conn = new mysqli(DBHOST, DBUSER, DBPASS, DBNAME);
}

// ======================================
// VERIFICAR LA CONEXIÓN
// ======================================
if ($conn->connect_error) {
    die("Error de conexión: " . $conn->connect_error);
}

// ======================================
// ESTABLECER CODIFICACIÓN UTF-8
// ======================================
$conn->set_charset('utf8mb4');

// ======================================
// FUNCIÓN PARA OBTENER LA CONEXIÓN
// ======================================
function getConnection() {
    global $conn;
    return $conn;
}
?>
