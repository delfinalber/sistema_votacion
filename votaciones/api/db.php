<?php
error_reporting(0); // Silencia warnings

if (!function_exists('getConnection')) {
	function getConnection(): mysqli {
		static $connection = null;

		if ($connection instanceof mysqli) {
			return $connection;
		}

		$DBHOST = 'localhost';
		$DBUSER = 'root';
		$DBPASS = '';
		$DBNAME = 'votaciones';

		$pHost = 'p:' . $DBHOST;
		$connection = @new mysqli($pHost, $DBUSER, $DBPASS, $DBNAME);

		if ($connection->connect_errno) {
			$connection = @new mysqli($DBHOST, $DBUSER, $DBPASS, $DBNAME);
		}

		if ($connection->connect_errno) {
			throw new Exception('No fue posible conectar a la base de datos');
		}

		$connection->set_charset('utf8mb4');

		return $connection;
	}
}

// Compatibilidad con APIs que aún usan la variable $conn directamente.
$conn = getConnection();
?>


