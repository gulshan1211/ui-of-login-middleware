import * as vscode from "vscode";
import { checkAuthAndLoadPage, clearStoredSecret } from "./authService";
import { getLoginPageHtml, getMainPageHtml } from "./htmlGenerator";

/**
 * SidebarProvider class to handle the webview sidebar.
 */
export class SidebarProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;

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
                checkAuthAndLoadPage(webviewView, this._extensionUri, this.secretStorage);
            }
        });

        // Check authentication and load the appropriate page
        checkAuthAndLoadPage(webviewView, this._extensionUri, this.secretStorage);

        // Set up message listener
        webviewView.webview.onDidReceiveMessage(async (data) => {
            switch (data.type) {
                case "showError":
                    if (data.value) vscode.window.showErrorMessage(data.value);
                    break;
                case "storeSecret":
                    if (data.value) {
                        await this.secretStorage.delete("MySecret");
                        await this.secretStorage.store("MySecret", data.value);
                        vscode.window.showInformationMessage('Checking....');
                        checkAuthAndLoadPage(webviewView, this._extensionUri, this.secretStorage);
                    }
                    break;
            }
        });
    }
}

