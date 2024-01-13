<?php
// getAPIKey.php

$openai_api_key = 'API-KEY';
$knownSecretToken = 'secretToken'; // El mismo token secreto que en tu JavaScript

$inputData = json_decode(file_get_contents('php://input'), true);

if (isset($inputData['secretToken']) && $inputData['secretToken'] === $knownSecretToken) {
    header('Content-Type: application/json');
    echo json_encode(['apiKey' => $openai_api_key]);
} else {
    header("HTTP/1.1 403 Forbidden");
    exit;
}
?>
