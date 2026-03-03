<?php
// ======================================
// CONFIGURACIÓN DE LA BASE DE DATOS
// ======================================
define('DBHOST', 'localhost');
define('DBUSER', 'root');
define('DBPASS', '');
define('DBNAME', 'votaciones');
define('DBCHARSET', 'utf8mb4');
define('DBPORT', 3307);

// ======================================
// CREAR LA CONEXIÓN
// ======================================
$conn = new mysqli(DBHOST, DBUSER, DBPASS, DBNAME, DBPORT);

// ======================================
// VERIFICAR LA CONEXIÓN
// ======================================
if ($conn->connect_error) {
	throw new Exception('Error de conexión a la base de datos: ' . $conn->connect_error);
}

// ======================================
// ESTABLECER CODIFICACIÓN UTF-8
// ======================================
$conn->set_charset(DBCHARSET);

// ======================================
// FUNCIÓN PARA OBTENER LA CONEXIÓN
// ======================================
function getConnection() {
	global $conn;
	return $conn;
}
?>


