// Wait for the DOM to fully load before running the script
export let token = '';
import {fetchResponse,getResponse} from './api.js';
import { displayUserMessage,displayInitialBotMessage } from './ui.js';
window.addEventListener('DOMContentLoaded', (event) => {
      // Display initial bot message when the page loads
      displayInitialBotMessage();
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

  
});
// Initialize the query variable
export let query = '';

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


    // Fetch the bot's response
    await fetchResponse();
    await getResponse();
}



