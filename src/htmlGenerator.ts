import * as vscode from "vscode";
import getNonce from "./getNonce";

/**
 * Generate the login page HTML content.
 */
export function getLoginPageHtml(webview: vscode.Webview, extensionUri: vscode.Uri): string {
    const styleVSCodeUri = webview.asWebviewUri(
        vscode.Uri.joinPath(extensionUri, "media", "global.css")
    );
    const scriptUri = webview.asWebviewUri(
        vscode.Uri.joinPath(extensionUri, "media", "login.js")
    );

    return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <link href="${styleVSCodeUri}" rel="stylesheet">
        </head>
        <body>
            <h1 id="login_heading">EPLX-Chatbot Login</h1>
            <div id="login"></div>
            <input type="text" id="logininput" />
            <button id="storeSecret">Enter API Key</button>
            <p id="Logindisplay"></p>
            <script src="${scriptUri}"></script>
        </body>
        </html>`;
}

/**
 * Generate the main page HTML content.
 */
export function getMainPageHtml(webview: vscode.Webview, extensionUri: vscode.Uri): string {
    const styleVSCodeUri = webview.asWebviewUri(
        vscode.Uri.joinPath(extensionUri, "media", "global.css")
    );
    const scriptUri = webview.asWebviewUri(
        vscode.Uri.joinPath(extensionUri, "media", "main.js")
    );
    const scriptUri1 = webview.asWebviewUri(
        vscode.Uri.joinPath(extensionUri, "media", "api.js")
    );
    const scriptUri2 = webview.asWebviewUri(
        vscode.Uri.joinPath(extensionUri, "media", "ui.js")
    );

    const nonce = getNonce();

    return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <link href="${styleVSCodeUri}" rel="stylesheet">
        </head>
        <body>
            <div id="chat-container">
                <div id="display"></div>
                <div id="input-container">
                    <input type="text" id="userInput" placeholder="Type your message here..." />
                    <svg id="Submit" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M10.0719 8.02397L5.7146 3.66666L6.33332 3.04794L11 7.71461V8.33333L6.33332 13L5.7146 12.3813L10.0719 8.02397Z" fill="#C5C5C5"/>
                    </svg>
                </div>
            </div>
            <script type="module" src="${scriptUri}"></script>
            <script type="module" src="${scriptUri1}"></script>
            <script type="module" src="${scriptUri2}"></script>
        </body>
        </html>`;
}
