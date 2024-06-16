// Acquire the VS Code API to communicate with the extension
const vscode = acquireVsCodeApi();

// Wait for the DOM to fully load before running the script
window.addEventListener('DOMContentLoaded', (event) => {
    // Attach event listener to the storeSecret button
    document.getElementById('storeSecret').addEventListener('click', handleStoreSecret);
});

// Function to handle storing the API key
function handleStoreSecret() {
    const userInput = document.getElementById('userInput').value.trim();

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
