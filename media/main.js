// Import necessary modules and functions
import { fetchResponseFromExtension, getResponseFromExtension } from './call.js';
import { displayUserMessage, displayInitialBotMessage} from './ui.js';
import { handleMessage } from './eventlistners.js';

// Acquire VS Code API
export const vscode = acquireVsCodeApi();
export let query = '';

// Wait for the DOM to fully load before running the script
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

     // Handle messages from the extension
     window.addEventListener('message', handleMessage);

});


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
    await fetchResponseFromExtension();
    await getResponseFromExtension();

}



