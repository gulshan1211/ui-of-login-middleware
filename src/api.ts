// Base URL for the API
const BASE_URL = 'http://192.168.1.15:5000';

// Types for API responses
type FetchResponseResult = { result?: string; error?: string };
type GetResponseResult = { answer?: string; link?: string; error?: string };
type SendRelevantDataResult = { success?: boolean; error?: string };

/**
 * Sends a user query to the API and returns the response or an error message.
 * 
 * @param query - The user input to send to the API.
 * @param token - The authentication token for the API request.
 * @returns An object containing either the result or an error message.
 */
export async function fetchResponse(query: string, token: string): Promise<FetchResponseResult> {
    const url = new URL('api/send_message', BASE_URL).toString();

    const formData = new FormData();
    formData.append('user_input', query);

    const options: RequestInit = {
        method: 'POST',
        body: formData,
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        }
    };

    try {
        const response = await fetchWithTimeout(url, options, 30000);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json() as { response: string };
        return { result: result.response };

    } catch (error: unknown) {
        console.error('Fetch Response Error:', error);
        return { error: getErrorMessage(error) };
    }
}

/**
 * Retrieves a response from the API based on the user's query and token.
 * 
 * @param query - The query to send to the API.
 * @param token - The authentication token for the API request.
 * @returns An object containing the answer, link, or an error message.
 */
export async function getResponse(query: string, token: string): Promise<GetResponseResult> {
    const url = new URL('api/tfidf_message', BASE_URL).toString();

    const formData = new FormData();
    formData.append('question', query);

    const options: RequestInit = {
        method: 'POST',
        body: formData,
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        }
    };

    try {
        const response = await fetchWithTimeout(url, options, 30000);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json() as { answer: string; link: string };
        return { answer: result.answer, link: result.link };

    } catch (error: unknown) {
        console.error('Get Response Error:', error);
        return { error: getErrorMessage(error) };
    }
}

/**
 * Sends relevant data to the API and returns the success status or an error message.
 * 
 * @param question - The question to send.
 * @param answer - The answer to send.
 * @param link - The link to send.
 * @param token - The authentication token for the API request.
 * @returns An object containing success status or an error message.
 */
export async function sendRelevantData(question: string, answer: string, link: string, token: string): Promise<SendRelevantDataResult> {
    const url = new URL('api/relevant', BASE_URL).toString();

    const data = { question, answer, link };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        await response.json();
        return { success: true };

    } catch (error: unknown) {
        console.error('Send Relevant Data Error:', error);
        return { error: getErrorMessage(error) };
    }
}

/**
 * Fetches a URL with a timeout.
 * 
 * @param url - The URL to fetch.
 * @param options - The request options.
 * @param timeout - The timeout duration in milliseconds.
 * @returns The fetch response.
 */
async function fetchWithTimeout(url: string, options: RequestInit, timeout: number = 30000): Promise<Response> {
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

/**
 * Extracts a meaningful error message from an unknown error type.
 * 
 * @param error - The error object.
 * @returns A string containing the error message.
 */
function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }
    return 'An unknown error occurred.';
}
