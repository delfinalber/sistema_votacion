<?php
error_reporting(0); // Silencia warnings
$DBHOST='localhost';$DBUSER='root';$DBPASS='';$DBNAME='votaciones';
$pHost='p:'.$DBHOST;$conn=new mysqli($pHost,$DBUSER,$DBPASS,$DBNAME);
if($conn->connect_errno){$conn=new mysqli($DBHOST,$DBUSER,$DBPASS,$DBNAME);}
$conn->set_charset('utf8mb4');
?>


