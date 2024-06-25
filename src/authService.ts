import * as vscode from "vscode";
import * as http from 'http';
import { getLoginPageHtml, getMainPageHtml } from "./htmlGenerator";

/**
 * Verify the stored secret and load the main page or show the login page.
 */

export async function checkAuthAndLoadPage(webviewView: vscode.WebviewView, extensionUri: vscode.Uri, secretStorage: vscode.SecretStorage) {
    const secret = await secretStorage.get("MySecret");
    if (secret) {
        checkAuth(secret, webviewView, extensionUri, secretStorage);
    } else {
        webviewView.webview.html = getLoginPageHtml(webviewView.webview, extensionUri);
    }
}

/**
 * Verify the stored secret and load the main page or show the login page.
 */
export async function checkAuth(secret: string, webviewView: vscode.WebviewView, extensionUri: vscode.Uri, secretStorage: vscode.SecretStorage) {
    const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/testing',
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${secret}`
        }
    };

    const req = http.request(options, (res) => {
        clearTimeout(timeoutId); // Clear the timeout once we get a response
        if (res.statusCode === 200) {
            vscode.window.showInformationMessage('Authentication successful!');
            webviewView.webview.html = getMainPageHtml(webviewView.webview, extensionUri);
            webviewView.webview.postMessage({ type: 'sendMessageToUI', value: secret });
        } else {
            vscode.window.showErrorMessage('Authentication failed! Clearing data...');
            clearStoredSecret(secretStorage);
            webviewView.webview.html = getLoginPageHtml(webviewView.webview, extensionUri);
        }
    });

    req.on('error', (error) => {
        clearTimeout(timeoutId); // Clear the timeout if an error occurs
        
            vscode.window.showErrorMessage(`Problem with request: ${error.message}`);
       
        webviewView.webview.html = getLoginPageHtml(webviewView.webview, extensionUri);
    });

    // Set up a timeout to abort the request if it takes longer than 60 seconds
    const timeoutId = setTimeout(() => {
        req.destroy(new Error('Request timed out'));
    }, 6000); // 6 seconds

    req.end();
}
/**
 * Clear the stored secret in case of authentication failure.
 */
export async function clearStoredSecret(secretStorage: vscode.SecretStorage) {
    await secretStorage.delete("MySecret");
    vscode.window.showInformationMessage('Stored secret cleared due to authentication failure.');
}
