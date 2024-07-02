import * as vscode from 'vscode';
import { SidebarProvider } from './SidebarProvider';

/**
 * Activate the extension and set up the sidebar provider.
 * 
 * @param context - The extension context provided by VS Code.
 */
export function activate(context: vscode.ExtensionContext) {
    // Create an instance of SidebarProvider with the extension's URI and secret storage
    const sidebarProvider = new SidebarProvider(context.extensionUri, context.secrets);

    // Register the SidebarProvider to manage the "Chatbot-sidebar" webview view
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            "Chatbot-sidebar",   // The ID of the webview view to be registered
            sidebarProvider      // The provider instance handling the webview view
        )
    );
}
