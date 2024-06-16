import * as vscode from "vscode";
import getNonce from "./getNonce";
import * as http from 'http';

let token: any;

/**
 * SidebarProvider class to handle the webview sidebar.
 */
export class SidebarProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;
    private _doc?: vscode.TextDocument;

    constructor(private readonly _extensionUri: vscode.Uri, private readonly secretStorage: vscode.SecretStorage) {}

    /**
     * Resolve the webview view and set up event listeners.
     */
    public async resolveWebviewView(webviewView: vscode.WebviewView) {
        this._view = webviewView;

        // Configure webview options
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri],
        };

        // Delete any stored secrets
        await this.secretStorage.delete("MySecret");

        // Set up visibility change listener
        webviewView.onDidChangeVisibility(() => {
            if (webviewView.visible) {
                this.checkAuthAndLoadPage(webviewView);
            }
        });

        // Check authentication and load the appropriate page
        this.checkAuthAndLoadPage(webviewView);

        // Set up message listener
        webviewView.webview.onDidReceiveMessage(async (data) => {
            token = data;
            switch (data.type) {
                case "onInfo":
                    if (data.value) vscode.window.showInformationMessage(data.value);
                    break;
                case "onError":
                    if (data.value) vscode.window.showErrorMessage(data.value);
                    break;
                case "storeSecret":
                    if (data.value) {
                        await this.secretStorage.delete("MySecret");
                        await this.secretStorage.store("MySecret", data.value);
                        vscode.window.showInformationMessage('Checking....');
                        this.checkAuthAndLoadPage(webviewView);
                    }
                    break;
            }
        });
    }

    /**
     * Check authentication status and load the appropriate page.
     */
    private async checkAuthAndLoadPage(webviewView: vscode.WebviewView) {
        const secret = await this.secretStorage.get("MySecret");
        if (secret) {
            this.checkAuth(secret, webviewView);
        } else {
            webviewView.webview.html = this._getLoginPage(webviewView.webview);
        }
    }

    /**
     * Verify the stored secret and load the main page or show the login page.
     */
    private async checkAuth(secret: string, webviewView: vscode.WebviewView) {
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
            if (res.statusCode === 200) {
                vscode.window.showInformationMessage('Authentication successful!');
                webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
                webviewView.webview.postMessage({ type: 'sendMessageToUI', value: token.value });
            } else {
                vscode.window.showErrorMessage('Authentication failed! Clearing data...');
                this.clearStoredSecret();
                webviewView.webview.html = this._getLoginPage(webviewView.webview);
            }
        });

        req.on('error', (error) => {
            console.error(`Problem with request: ${error.message}`);
            webviewView.webview.html = this._getLoginPage(webviewView.webview);
        });

        req.end();
    }

    /**
     * Clear the stored secret in case of authentication failure.
     */
    private async clearStoredSecret() {
        await this.secretStorage.delete("MySecret");
        vscode.window.showInformationMessage('Stored secret cleared due to authentication failure.');
    }

    /**
     * Generate the login page HTML content.
     */
    private _getLoginPage(webview: vscode.Webview): string {
        const styleVSCodeUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, "media", "global.css")
        );
        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, "media", "main1.js")
        );

        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <link href="${styleVSCodeUri}" rel="stylesheet">
            </head>
            <body>
                <h1 id"login_heading">EPLX-Chatbot Login</h1>
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
    private _getHtmlForWebview(webview: vscode.Webview): string {
        const styleVSCodeUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, "media", "global.css")
        );
        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, "media", "main.js")
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
                <script src="${scriptUri}"></script>
            </body>
            </html>`;
    }
}
