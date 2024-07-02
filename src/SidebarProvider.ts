import * as vscode from "vscode";
import { checkAuthAndLoadPage } from "./authService";
import { fetchResponse, getResponse, sendRelevantData } from "./api";

/**
 * SidebarProvider class to manage the webview sidebar in VS Code.
 */
export class SidebarProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;

    /**
     * Constructor for SidebarProvider.
     * @param _extensionUri - URI of the extension.
     * @param secretStorage - VS Code Secret Storage API.
     */
    constructor(
        private readonly _extensionUri: vscode.Uri, 
        private readonly secretStorage: vscode.SecretStorage
    ) {}

    /**
     * Resolves the webview view, sets up event listeners, and manages communication with the webview.
     * @param webviewView - The webview view instance.
     */
    public async resolveWebviewView(webviewView: vscode.WebviewView) {
        this._view = webviewView;

        // Configure webview options to enable scripts and specify local resource roots
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri],
        };

        // Clear any stored secrets
        await this.secretStorage.delete("MySecret");

        // Set up a listener to check authentication and load the page when the view becomes visible
        webviewView.onDidChangeVisibility(() => {
            if (webviewView.visible) {
                checkAuthAndLoadPage(webviewView, this._extensionUri, this.secretStorage);
            }
        });

        // Initial check for authentication and load the appropriate page
        checkAuthAndLoadPage(webviewView, this._extensionUri, this.secretStorage);

        // Set up a message listener for communication with the webview
        webviewView.webview.onDidReceiveMessage(async (data) => {
            switch (data.type) {
                case "showError":
                    // Display error message to the user
                    if (data.value) {
                        vscode.window.showErrorMessage(data.value);
                    }
                    break;

                case "storeSecret":
                    // Store the new secret and reload the page
                    if (data.value) {
                        await this.secretStorage.delete("MySecret");
                        await this.secretStorage.store("MySecret", data.value);
                        vscode.window.showInformationMessage('Checking....');
                        checkAuthAndLoadPage(webviewView, this._extensionUri, this.secretStorage);
                    }
                    break;

                case "fetchResponse":
                    // Fetch response from the API and send result or error to the webview
                    const fetchResponseResult = await fetchResponse(data.query, await this.secretStorage.get("MySecret") || '');
                    if (fetchResponseResult.error) {
                        await webviewView.webview.postMessage({ type: "error", message: fetchResponseResult.error });
                    } else {
                        await webviewView.webview.postMessage({ type: "fetchResponseResult", result: fetchResponseResult.result });
                    }
                    break;

                case "getResponse":
                    // Get response from the API and send result or error to the webview
                    const getResponseResult = await getResponse(data.query, await this.secretStorage.get("MySecret") || '');
                    if (getResponseResult.error) {
                        await webviewView.webview.postMessage({ type: "error", message: getResponseResult.error });
                    } else {
                        await webviewView.webview.postMessage({ type: "getResponseResult", result: { answer: getResponseResult.answer, link: getResponseResult.link } });
                    }
                    break;

                case "sendRelevantData":
                    // Send relevant data to the API and send result or error to the webview
                    const sendRelevantDataResult = await sendRelevantData(data.question, data.answer, data.link, await this.secretStorage.get("MySecret") || '');
                    if (sendRelevantDataResult.error) {
                        await webviewView.webview.postMessage({ type: "error", message: sendRelevantDataResult.error });
                    } else {
                        await webviewView.webview.postMessage({ type: "sendRelevantDataResult", success: sendRelevantDataResult.success });
                    }
                    break;

                default:
                    // Handle unknown message types
                    console.warn('Unknown message type:', data.type);
                    break;
            }
        });
    }
}
