<?php
// generateImage.php

// OpenAI API key. Make sure you protect this file so you don't expose your key.
$openai_api_key = 'API-KEY';


// Get the input from the HTTP request body and decode the JSON
$inputData = json_decode(file_get_contents('php://input'), true);

if (!$inputData) {
    echo json_encode(['error' => 'No se recibieron datos.']);
    exit;
}

// Prepare data to send to the OpenAI API
$data = [
    'model' => $inputData['model'] ?? 'dall-e-3', // Usa 'dall-e-3' como modelo predeterminado
    'prompt' => $inputData['prompt'],
    'n' => $inputData['n'] ?? 1,
    'size' => $inputData['size'] ?? '1024x1024'
];

// Configure the headers for the request to the OpenAI API
$headers = [
    'Authorization: Bearer ' . $openai_api_key,
    'Content-Type: application/json'
];

// Initialize cURL and configure the options for the OpenAI API request
$ch = curl_init('https://api.openai.com/v1/images/generations');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

// Execute the request and get the response
$response = curl_exec($ch);

// Check if there were errors in the request
if (curl_errno($ch)) {
    echo json_encode(['error' => curl_error($ch)]);
    curl_close($ch);
    exit;
}

// Close the cURL handler and return the response
curl_close($ch);
echo $response;
?>
