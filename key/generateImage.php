<?php
// generateImage.php

// Clave API de OpenAI. Asegúrate de proteger este archivo para no exponer tu clave.
$openai_api_key = 'API-KEY';

// Obtiene la entrada del cuerpo de la solicitud HTTP y decodifica el JSON
$inputData = json_decode(file_get_contents('php://input'), true);

if (!$inputData) {
    echo json_encode(['error' => 'No se recibieron datos.']);
    exit;
}

// Prepara los datos para enviar a la API de OpenAI
$data = [
    'model' => $inputData['model'] ?? 'dall-e-3', // Usa 'dall-e-3' como modelo predeterminado
    'prompt' => $inputData['prompt'],
    'n' => $inputData['n'] ?? 1,
    'size' => $inputData['size'] ?? '1024x1024'
];

// Configura los headers para la solicitud a la API de OpenAI
$headers = [
    'Authorization: Bearer ' . $openai_api_key,
    'Content-Type: application/json'
];

// Inicializa cURL y configura las opciones para la petición a la API de OpenAI
$ch = curl_init('https://api.openai.com/v1/images/generations');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

// Ejecuta la solicitud y obtiene la respuesta
$response = curl_exec($ch);

// Verifica si hubo errores en la petición
if (curl_errno($ch)) {
    echo json_encode(['error' => curl_error($ch)]);
    curl_close($ch);
    exit;
}

// Cierra el manejador de cURL y devuelve la respuesta
curl_close($ch);
echo $response;
?>