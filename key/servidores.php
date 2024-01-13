<?php
// servidores.php

// OpenAI API key. Make sure you protect this file so you don't expose your key.
$openai_api_key = 'API-KEY';

// Get the input from the HTTP request body and decode the JSON
$inputData = json_decode(file_get_contents('php://input'), true);

if (!$inputData) {
    echo json_encode(['error' => 'No se recibieron datos.']);
    exit;
}

$data = [
    'model' => $inputData['model'],
    'messages' => $inputData['messages'],
    'max_tokens' => $inputData['max_tokens']
];

$headers = [
    'Authorization: Bearer ' . $openai_api_key,
    'Content-Type: application/json'
];

$ch = curl_init('https://api.openai.com/v1/chat/completions');

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

$response = curl_exec($ch);

if (curl_errno($ch)) {
    echo json_encode(['error' => curl_error($ch)]);
    curl_close($ch);
    exit;
}

curl_close($ch);
echo $response;
?>
