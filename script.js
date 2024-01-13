
        document.addEventListener('DOMContentLoaded', (event) => {
            hideLoader();
        });

        let isImageAnalysis = false;

        function showLoader(message) {
            document.getElementById('loaderMessage').textContent = message;
            document.getElementById('loader').style.display = 'flex';
        }

        function hideLoader() {
            document.getElementById('loader').style.display = 'none';
        }

        const OPENAI_API_KEY = ' ';
        let conversationHistory = [];

        async function getGPTResponse(userMessage) {
    showLoader("Generating Text...");
    
    // Cambia la URL para apuntar a tu script PHP
    const apiUrl = "/key/servidores.php";

    conversationHistory.push(`Usuario: ${userMessage}`);

    let prompt = "Virtual Assistant: respond coherently and helpfully to the following questions or comments.\n";
    prompt += conversationHistory.join("\n") + `\nUsuario: ${userMessage}\nAsistente virtual:`;

    try {
        const response = await axios.post(apiUrl, {
            model: "gpt-3.5-turbo", // Especifica el modelo GPT-4
            messages: [{ "role": "system", "content": prompt }],
            max_tokens: 400
        });

        if (response.status !== 200) {
            throw new Error(`API response error: ${response.statusText}`);
        }

        const result = response.data;
        if (result.choices && result.choices[0] && result.choices[0].message) {
            let botResponse = result.choices[0].message.content.trim();
            conversationHistory.push(`Asistente virtual: ${botResponse}`);

            const imageDisplayArea = document.getElementById('imageDisplayArea');
    imageDisplayArea.innerHTML = ''; // Limpia el área de imagen

    const responseArea = document.getElementById('responseArea');
    responseArea.innerText = ''; // Limpia el área de respuesta de texto
    responseArea.innerText = botResponse;
        } else {
            throw new Error("Unexpected API response format");
        }
    } catch (error) {
        console.error('Error generando texto:', error);
        // Puedes manejar el error aquí si es necesario
    } finally {
        hideLoader(); // Asegurarse de que el loader se oculta al final
    }
}


async function handleGenerateImage() {
    const imagesGenerated = parseInt(localStorage.getItem('imagesGenerated')) || 0;

    if (imagesGenerated >= 2) {
        alert('You can only generate 2 images for testing.');
        hideLoader();
        return;
    }

    showLoader("Generating Image...");
    const userMessage = document.getElementById('userInput').value;
    const fullBodyPrompt = `Generate an image based on the following text: "${userMessage}"`;

    try {
        const response = await axios.post(
            '/key/generateImage.php',  // Apunta al script PHP en lugar de la API de OpenAI directamente
            {
                model: "dall-e-3",
                prompt: fullBodyPrompt,
                n: 1,
                size: '1024x1024'
            }
        );

        const data = response.data;
        if (data && data.data && data.data[0] && data.data[0].url) {
            const imageUrl = data.data[0].url;
            const imageElement = document.createElement('img');
            imageElement.src = imageUrl;
            imageElement.alt = 'Imagen generada';
            imageElement.style.cursor = 'pointer';
            imageElement.onclick = function () {
                window.open(imageUrl, '_blank');
            };

            const responseArea = document.getElementById('responseArea');
    responseArea.innerText = ''; // Limpia el área de respuesta de texto

    const imageDisplayArea = document.getElementById('imageDisplayArea');
    imageDisplayArea.innerHTML = ''; // Limpia el área de imagen

            imageDisplayArea.appendChild(imageElement);

            localStorage.setItem('imagesGenerated', imagesGenerated + 1);
        } else {
            throw new Error("No image URL returned");
        }
    } catch (error) {
        console.error('Error generating image', error);
        document.getElementById('imageDisplayArea').innerText = "Error generating image";
    } finally {
        hideLoader();
    }
}


async function getAPIKeyFromPHP() {
    const secretToken = 'secretToken';  // Usa un token secreto aquí

    try {
        const response = await axios.post('/key/getAPIKey.php', { secretToken });
        return response.data.apiKey;
    } catch (error) {
        console.error('rror obtaining the API key', error);
        return null;
    }
}


async function analyzeImage(base64Image) {
    showLoader("Analyzing Image..");

    const openAI_API_Key = await getAPIKeyFromPHP();
    if (!openAI_API_Key) {
        console.error('No se pudo obtener la clave API.');
        document.getElementById('imageDisplayArea').innerText = "Error al obtener la clave API.";
        hideLoader();
        return;
    }

    const headers = {
        'Authorization': `Bearer ${openAI_API_Key}`,
        'Content-Type': 'application/json',
    };

    const body = {
        model: "gpt-4-vision-preview",
        max_tokens: 250,
        messages: [
            {
                role: "system",
                content: "Analyze the Image"
            },
            {
                role: "user",
                content: [
                    {
                        type: "image_url",
                        image_url: {
                            "url": `data:image/jpeg;base64,${base64Image}`
                        }
                    }
                ]
            }
        ]
    };

    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', body, { headers });
        const content = response.data.choices[0].message.content;

        const responseArea = document.getElementById('responseArea');
    responseArea.innerText = ''; // Limpia el área de respuesta de texto

    const imageDisplayArea = document.getElementById('imageDisplayArea');
    imageDisplayArea.innerText = ''; // Limpia el área de imagen

        imageDisplayArea.innerText = content;
        conversationHistory.push(`Image Analysis: ${content}`);

        const copyIcon = document.createElement('i');
        copyIcon.className = 'fas fa-copy';
        copyIcon.style.cursor = 'pointer';
        copyIcon.style.marginLeft = '10px';
        copyIcon.onclick = function () {
            navigator.clipboard.writeText(content);
            alert('Response copied to clipboard.');
        };

        imageDisplayArea.appendChild(copyIcon);

        isImageAnalysis = true;
    } catch (error) {
        console.error('Error haciendo la solicitud de análisis:', error);
        document.getElementById('imageDisplayArea').innerText = "Error analyzing the image.";
    } finally {
        hideLoader();
    }
}

document.getElementById('sendMessage').addEventListener('click', async () => {
    const userMessage = document.getElementById('userInput').value;
    await getGPTResponse(userMessage);

    // Después de enviar el mensaje, restablece el valor del textarea al placeholder
    document.getElementById('userInput').value = '';
});

        document.getElementById('generateImage').addEventListener('click', async () => {
            await handleGenerateImage();
        });

document.addEventListener('DOMContentLoaded', (event) => {
    hideLoader();

    // Agregamos un event listener para el cambio en el input de imagen
    document.getElementById('imageInput').addEventListener('change', () => {
        const analyzeButtonContainer = document.getElementById('analyzeButtonContainer');
        if (document.getElementById('imageInput').files.length > 0) {
            analyzeButtonContainer.style.display = 'block';
        } else {
            analyzeButtonContainer.style.display = 'none';
        }
    });
});

document.getElementById('analyzeImage').addEventListener('click', async () => {
    const imageInput = document.getElementById('imageInput');
    if (imageInput.files.length > 0) {
        const file = imageInput.files[0];
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64Image = reader.result.split(',')[1];
            await analyzeImage(base64Image);
        };
        reader.readAsDataURL(file);
    }
});
