
document.getElementById('BackToChatbot').addEventListener('click', () => {
    vscode.postMessage({
        type: 'backToChatbot'
    });
});
document.getElementById('GoodNight').addEventListener('click', () => {
    vscode.postMessage({
        type: 'goodNight'
    });
});