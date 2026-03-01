<?php

header('Content-Type: application/json');
session_start();

$response = array('exito' => false, 'mensaje' => '');

try {
    $conexion = new PDO('mysql:host=localhost;dbname=votaciones;charset=utf8', 'root', '');
    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $usuario = isset($_POST['usuario']) ? trim($_POST['usuario']) : '';
    $password = isset($_POST['password']) ? trim($_POST['password']) : '';
    
    if (empty($usuario) || empty($password)) {
        throw new Exception('Usuario y contraseña son requeridos');
    }
    
    $stmt = $conexion->prepare('SELECT id_admin, usuario_admin, password_admin FROM administrador WHERE usuario_admin = :usuario LIMIT 1');
    $stmt->bindParam(':usuario', $usuario, PDO::PARAM_STR);
    $stmt->execute();
    
    $resultado = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($resultado && password_verify($password, $resultado['password_admin'])) {
        $_SESSION['admin_autenticado'] = true;
        $_SESSION['id_admin'] = $resultado['id_admin'];
        $_SESSION['usuario_admin'] = $resultado['usuario_admin'];
        $_SESSION['tiempo_sesion'] = time();
        
        $response['exito'] = true;
        $response['mensaje'] = 'Autenticación exitosa';
    } else {
        header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
        header('Pragma: no-cache');
        header('Expires: 0');
        
        throw new Exception('Usuario o contraseña incorrectos');
    }
    
} catch (Exception $e) {
    $response['exito'] = false;
    $response['mensaje'] = $e->getMessage();
    session_destroy();
}

echo json_encode($response);
?>