import * as vscode from "vscode";
import * as http from 'http';
import { getLoginPageHtml, getMainPageHtml } from "./htmlGenerator";

/**
 * Check if a stored secret exists and load the appropriate page.
 * 
 * @param webviewView - The webview view to update with HTML content.
 * @param extensionUri - The URI of the extension for resolving local resources.
 * @param secretStorage - The storage for managing secrets.
 */
export async function checkAuthAndLoadPage(webviewView: vscode.WebviewView, extensionUri: vscode.Uri, secretStorage: vscode.SecretStorage) {
    // Retrieve the stored secret
    const secret = await secretStorage.get("MySecret");

    // If a secret is found, authenticate it; otherwise, show the login page
    if (secret) {
        checkAuth(secret, webviewView, extensionUri, secretStorage);
    } else {
        webviewView.webview.html = getLoginPageHtml(webviewView.webview, extensionUri);
    }
}

/**
 * Authenticate the stored secret and load the main page or show the login page based on the result.
 * 
 * @param secret - The stored secret to be used for authentication.
 * @param webviewView - The webview view to update with HTML content.
 * @param extensionUri - The URI of the extension for resolving local resources.
 * @param secretStorage - The storage for managing secrets.
 */
export async function checkAuth(secret: string, webviewView: vscode.WebviewView, extensionUri: vscode.Uri, secretStorage: vscode.SecretStorage) {
    // Set up the HTTP request options for authentication
    const options: http.RequestOptions = {
        hostname: '192.168.1.15',  // Use the IP address instead of 'localhost'
        port: 5000,
        path: '/api/testing',
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${secret}`
        }
    };

    // Create the HTTP request
    const req = http.request(options, (res) => {
        clearTimeout(timeoutId); // Clear the timeout once a response is received

        // Check the response status code
        if (res.statusCode === 200) {
            vscode.window.showInformationMessage('Authentication successful!');
            webviewView.webview.html = getMainPageHtml(webviewView.webview, extensionUri);
            webviewView.webview.postMessage({ type: 'sendMessageToUI', value: secret });
        } else {
            vscode.window.showErrorMessage('Authentication failed! Clearing data...');
            clearStoredSecret(secretStorage); // Clear the stored secret
            webviewView.webview.html = getLoginPageHtml(webviewView.webview, extensionUri);
        }
    });

    // Handle request errors
    req.on('error', (error) => {
        clearTimeout(timeoutId); // Clear the timeout if an error occurs
        vscode.window.showErrorMessage(`Problem with request: ${error.message}`);
        webviewView.webview.html = getLoginPageHtml(webviewView.webview, extensionUri);
    });

    // Set up a timeout to abort the request if it takes longer than 6 seconds
    const timeoutId = setTimeout(() => {
        req.destroy(new Error('Request timed out'));
    }, 6000); // 6 seconds

    // End the request
    req.end();
}

/**
 * Clear the stored secret in case of authentication failure.
 * 
 * @param secretStorage - The storage for managing secrets.
 */
export async function clearStoredSecret(secretStorage: vscode.SecretStorage) {
    await secretStorage.delete("MySecret");
    vscode.window.showInformationMessage('Stored secret cleared due to authentication failure.');
}
