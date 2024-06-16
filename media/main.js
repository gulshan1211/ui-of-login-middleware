// Wait for the DOM to fully load before running the script
let token = '';

window.addEventListener('DOMContentLoaded', (event) => {
    // Attach event listeners to the submit button and the input field
    document.getElementById('Submit').addEventListener('click', Help);
    document.getElementById('userInput').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            Help();
        }
    });

    // Acquire VS Code API
    const vscode = acquireVsCodeApi();

    // Listen for messages from the extension to get the token
    window.addEventListener('message', event => {
        const message = event.data;
        token = message.value;
        console.log(message.value);
    });

    // Display initial bot message when the page loads
    displayInitialBotMessage();
});
// Initialize the query variable
let query = '';

// Function to handle user input and send it to the bot
async function Help() {
    const inputField = document.getElementById('userInput');
    const message = inputField.value.trim();
    query = message;

    if (message === "") return;

    // Display the user's message in the chat window
    displayUserMessage(message);

    // Clear the input field
    inputField.value = "";

    // Show spinner
    showSpinner();

    // Fetch the bot's response
    await fetchResponse();
    await getResponse();
}

// Function to fetch the bot's response from the API with a timeout
async function fetchResponse() {
    const url = `http://127.0.0.1:5000/api/send_message`;

    // Create FormData object to send user input
    const formData = new FormData();
    formData.append('user_input', query);

    const options = {
        method: 'POST',
        body: formData,
        headers: {
            
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        }
    };

    try {
        const response = await fetchWithTimeout(url, options, 30000);

        // Log the response status to the console
        console.log(`Response Status: ${response.status}`);

        // Check for HTTP errors
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        const data = result.response;

        // Display the bot's response in the chat window
        displayBotMessage(data);

    } catch (error) {
        // Log the error to the console
        console.error('Error:', error);

        // Display an error message to the user
        displayErrorMessage('Unable to get a response from the server. Please try again later.');
    } finally {
        // Hide spinner
        hideSpinner();
    }
}


//function for cosine similarity api 
async function getResponse() {
    const url = `http://127.0.0.1:5000/api/tfidf_message`;

    // Create FormData object to send user input
    const formData = new FormData();
    formData.append('question', query);

    const options = {
        method: 'POST',
        body: formData,
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        }
    };

    try {
        const response = await fetchWithTimeout(url, options, 30000);

        // Log the response status to the console
        console.log(`Response Status: ${response.status}`);

        // Check for HTTP errors
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        const answer = result.answer;
        const link = result.link ;
        // Display the bot's response in the chat window
        // Display the bot's response with the answer and link
        display_answer_url(answer, link);
        

    } catch (error) {
        // Log the error to the console
        console.error('Error:', error);

        // Display an error message to the user
        displayErrorMessage('Unable to get a response from the server. Please try again later.');
    } finally {
        // Hide spinner
        hideSpinner();
    }
}




// Utility function to fetch with a timeout
async function fetchWithTimeout(url, options, timeout = 30000) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            reject(new Error('Request timed out'));
        }, timeout);

        fetch(url, options).then(
            response => {
                clearTimeout(timer);
                resolve(response);
            },
            err => {
                clearTimeout(timer);
                reject(err);
            }
        );
    });
}

// Function to display initial bot message
function displayInitialBotMessage() {
    const chatWindow = document.getElementById('display');
    const initialBotMessageDiv = document.createElement('div');
    initialBotMessageDiv.id = 'initialBotMessage';
    initialBotMessageDiv.classList.add('message', 'bot-message');
    initialBotMessageDiv.innerHTML = `<strong>Bot:</strong><br>Hi, I am here to rescue`;
    chatWindow.appendChild(initialBotMessageDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Function to display the user's message
function displayUserMessage(message) {
    const chatWindow = document.getElementById('display');
    const userMessageDiv = document.createElement('div');
    userMessageDiv.classList.add('message', 'user-message');
    userMessageDiv.innerHTML = `<strong>Me:</strong><br>${message}`;
    chatWindow.prepend(userMessageDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Function to display the bot's response
function displayBotMessage(data) {
    const chatWindow = document.getElementById('display');
    const botMessageDiv = document.createElement('div');
    botMessageDiv.classList.add('message', 'bot-message');
    botMessageDiv.innerHTML = `<strong>Bot:</strong><br>${data}<br><button class="relevant-button">Relevant</button>`;
    chatWindow.prepend(botMessageDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Function to display an error message
function displayErrorMessage(errorMsg) {
    const chatWindow = document.getElementById('display');
    const errorMessageDiv = document.createElement('div');
    errorMessageDiv.classList.add('message', 'error-message');
    errorMessageDiv.innerHTML = `<strong>Error:</strong><br>${errorMsg}`;
    chatWindow.prepend(errorMessageDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

//display link and answer
function display_answer_url(answer, link = '') {
    const chatWindow = document.getElementById('display');
    const botMessageDiv = document.createElement('div');
    botMessageDiv.classList.add('message', 'bot-message');
    let messageContent = `<strong>Bot:</strong><br>${answer}`;
    if (link) {
        messageContent += `<br><a href="${link}" target="_blank">Read more</a><br><button class="relevant-button">Relevant</button>`;
    }
    botMessageDiv.innerHTML = messageContent;
    chatWindow.prepend(botMessageDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;

    // Add event listener for the relevant button
    const relevantButton = botMessageDiv.querySelector('.relevant-button');
    if (relevantButton) {
        relevantButton.addEventListener('click', () => sendRelevantData(query, answer, link));
    }
}

// Function to send relevant data
async function sendRelevantData(question, answer, link) {
    const data = { question, answer, link };

    try {
        const response = await fetch('http://127.0.0.1:5000/api/relevant', {  // Replace with your API endpoint
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        console.log('Success:', result);
    } catch (error) {
        console.error('Error:', error);
    }
}

// Function to show spinner
function showSpinner() {
    const chatWindow = document.getElementById('display');
    const spinnerDiv = document.createElement('div');
    spinnerDiv.id = 'spinner';
    spinnerDiv.classList.add('spinner');
    spinnerDiv.innerHTML = `<div class="loader"></div>`;
    chatWindow.prepend(spinnerDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Function to hide spinner
function hideSpinner() {
    const spinnerDiv = document.getElementById('spinner');
    if (spinnerDiv) {
        spinnerDiv.remove();
    }
}
