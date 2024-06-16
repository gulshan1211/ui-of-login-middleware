import * as vscode from 'vscode';
import { SidebarProvider } from './SidebarProvider';
import * as path from 'path';
export function activate(context: vscode.ExtensionContext) {
    const sidebarProvider = new SidebarProvider(context.extensionUri, context.secrets);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            "Chatbot-sidebar",
            sidebarProvider
        )
    );

}
