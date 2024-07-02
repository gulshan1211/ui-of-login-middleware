//import necessary libraries
import { hideSpinner,displayErrorMessage,displayBotMessage,display_answer_url } from "./ui.js";

// Function to handle messages received from the extension
export function handleMessage(event) {
    const { type, result } = event.data;

    switch (type) {
        case 'fetchResponseResult':
            displayBotMessage(result);
            break;

        case 'getResponseResult':
            display_answer_url(result.answer, result.link);
            break;

        case 'error':
            hideSpinner();
            displayErrorMessage('Unable to get a response from the server. Please try again later.');
            break;

        default:
            console.warn('Unknown message type:', type);
            break;
    }
}