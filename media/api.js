import { token , query } from './main.js';
import { display_answer_url,displayBotMessage,displayErrorMessage,showSpinner,hideSpinner } from './ui.js';

//Function to fetch the bot's response from the API with a timeout
export async function fetchResponse() {
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

    try {showSpinner();
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
export async function getResponse() {
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

// Function to send relevant data
export async function sendRelevantData(question, answer, link) {
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