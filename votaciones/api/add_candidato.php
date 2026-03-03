<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

include 'db.php';

// Recibir datos del formulario
$cargo = $_POST['cargo'] ?? null;
$nombre = $_POST['nombre'] ?? null;
$numero = $_POST['numero'] ?? null;
$foto = null;

// Validar campos requeridos
if (!$cargo || !$nombre || !$numero) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Faltan datos requeridos']);
    exit;
}

// Procesar la imagen si existe
if (isset($_FILES['foto']) && $_FILES['foto']['error'] !== UPLOAD_ERR_NO_FILE) {
    if ($_FILES['foto']['error'] === UPLOAD_ERR_OK) {
        // Validar tipo de archivo
        $allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        $file_type = mime_content_type($_FILES['foto']['tmp_name']);
        
        if (!in_array($file_type, $allowed_types)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Tipo de archivo no permitido. Use JPG, PNG, GIF o WEBP']);
            exit;
        }
        
        // Crear carpeta Img si no existe
        $img_dir = '../Img/';
        if (!is_dir($img_dir)) {
            mkdir($img_dir, 0755, true);
        }
        
        // Generar nombre único para la imagen
        $file_ext = pathinfo($_FILES['foto']['name'], PATHINFO_EXTENSION);
        $file_name = 'candidato_' . time() . '_' . uniqid() . '.' . $file_ext;
        $file_path = $img_dir . $file_name;
        
        // Guardar archivo
        if (move_uploaded_file($_FILES['foto']['tmp_name'], $file_path)) {
            // Guardar ruta relativa para la base de datos
            $foto = 'votaciones/Img/' . $file_name;
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Error al guardar la imagen']);
            exit;
        }
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Error en la subida del archivo']);
        exit;
    }
}

// Insertar candidato en la base de datos
$stmt = $conn->prepare("INSERT INTO candidatos (cargo, nombre, numero, foto) VALUES (?, ?, ?, ?)");

if (!$stmt) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error en la consulta: ' . $conn->error]);
    exit;
}

$stmt->bind_param("ssss", $cargo, $nombre, $numero, $foto);

if ($stmt->execute()) {
    $new_id = $conn->insert_id;
    $new_candidato = [
        'id_candidato' => $new_id,
        'cargo' => $cargo,
        'nombre' => $nombre,
        'numero' => $numero,
        'foto' => $foto
    ];
    http_response_code(200);
    echo json_encode(['success' => true, 'data' => $new_candidato]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error al insertar: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
?>