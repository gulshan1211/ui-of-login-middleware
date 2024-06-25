import { sendRelevantData } from "./api.js";
// Function to display initial bot message
export function displayInitialBotMessage() {
    const chatWindow = document.getElementById('display');
    const initialBotMessageDiv = document.createElement('div');
    initialBotMessageDiv.id = 'initialBotMessage';
    initialBotMessageDiv.classList.add('message', 'bot-message');
    initialBotMessageDiv.innerHTML = `<strong>Bot:</strong><br>Hi, I am here to rescue`;
    chatWindow.appendChild(initialBotMessageDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Function to display the user's message
export function displayUserMessage(message) {
    const chatWindow = document.getElementById('display');
    const userMessageDiv = document.createElement('div');
    userMessageDiv.classList.add('message', 'user-message');
    userMessageDiv.innerHTML = `<strong>Me:</strong><br>${message}`;
    chatWindow.prepend(userMessageDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Function to display the bot's response
export function displayBotMessage(data) {
    const chatWindow = document.getElementById('display');
    const botMessageDiv = document.createElement('div');
    botMessageDiv.classList.add('message', 'bot-message');
    botMessageDiv.innerHTML = `<strong>Bot:</strong><br>${data}<br><button class="relevant-button">Relevant</button>`;
    chatWindow.prepend(botMessageDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Function to display an error message
export function displayErrorMessage(errorMsg) {
    const chatWindow = document.getElementById('display');
    const errorMessageDiv = document.createElement('div');
    errorMessageDiv.classList.add('message', 'error-message');
    errorMessageDiv.innerHTML = `<strong>Error:</strong><br>${errorMsg}`;
    chatWindow.prepend(errorMessageDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Function to display link and answer
export function display_answer_url(answer, link = '') {
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
        relevantButton.addEventListener('click', (event) => showPopupMessage(event, 'Thank you for your feedback!'));
    }
}

// Function to show spinner
export function showSpinner() {
    const chatWindow = document.getElementById('display');
    const spinnerDiv = document.createElement('div');
    spinnerDiv.id = 'spinner';
    spinnerDiv.classList.add('spinner');
    spinnerDiv.innerHTML = `<div class="loader"></div>`;
    chatWindow.prepend(spinnerDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Function to hide spinner
export function hideSpinner() {
    const spinnerDiv = document.getElementById('spinner');
    if (spinnerDiv) {
        spinnerDiv.remove();
    }
}

// Function to show popup message
export function showPopupMessage(event, message) {
    let popup = document.createElement('div');
    popup.classList.add('popup-message');
    popup.textContent = message;

    document.body.appendChild(popup);

    let buttonRect = event.target.getBoundingClientRect();
    popup.style.top = `${buttonRect.bottom + window.scrollY + 10}px`;
    popup.style.left = `${buttonRect.left + window.scrollX}px`;

    popup.style.visibility = 'visible';

    setTimeout(() => {
        popup.style.visibility = 'hidden';
        document.body.removeChild(popup);
    }, 3000);
}
