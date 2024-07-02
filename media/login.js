// Import the VS Code API from the main module
import { vscode } from "./main.js";

// Wait for the DOM to fully load before running the script
window.addEventListener('DOMContentLoaded', () => {
    // Attach event listener to the "storeSecret" button
    document.getElementById('storeSecret').addEventListener('click', handleStoreSecret);
});

/** 
 * Handles the storing of the API key.
 * Sends the API key to the extension if it's not empty.
 * Displays an error message if the API key is empty.
 */
function handleStoreSecret() {
    const userInput = document.getElementById('logininput').value.trim();

    if (userInput) {
        // Send the API key to the extension to store it
        vscode.postMessage({
            type: 'storeSecret',
            value: userInput
        });
    } else {
        // Send an error message to the extension if the API key is empty
        vscode.postMessage({
            type: 'showError',
            value: 'API Key cannot be empty'
        });
    }
}

