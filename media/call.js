// Import necessary functions and variables
import { query, vscode } from './main.js';
import { displayErrorMessage, showSpinner, hideSpinner } from './ui.js';

/**
 * Sends a message to the extension to fetch a response.
 * Displays a spinner while waiting for the response.
 */
export async function fetchResponseFromExtension() {
    showSpinner(); // Show spinner to indicate loading
    try {
        await vscode.postMessage({
            type: 'fetchResponse',
            query: query,
        });
    } catch (error) {
        console.error('Error fetching response:', error);
        displayErrorMessage('Failed to fetch response. Please try again.');
    } finally {
        hideSpinner(); // Hide spinner after processing
    }
}

/**
 * Sends a message to the extension to get a response with additional details.
 * Displays a spinner while waiting for the response.
 */
export async function getResponseFromExtension() {
    showSpinner(); // Show spinner to indicate loading
    try {
        await vscode.postMessage({
            type: 'getResponse',
            query: query,
        });
    } catch (error) {
        console.error('Error getting response:', error);
        displayErrorMessage('Failed to get response. Please try again.');
    } finally {
        hideSpinner(); // Hide spinner after processing
    }
}

/**
 * Sends relevant data to the extension.
 * 
 * @param {string} question - The user's question.
 * @param {string} answer - The bot's answer.
 * @param {string} link - Optional link for additional information.
 */
export async function sendRelevantDataToExtension(question, answer, link) {
    try {
        await vscode.postMessage({
            type: 'sendRelevantData',
            question: question,
            answer: answer,
            link: link,
        });
    } catch (error) {
        console.error('Error sending relevant data:', error);
        displayErrorMessage('Failed to send data. Please try again.');
    }
}
