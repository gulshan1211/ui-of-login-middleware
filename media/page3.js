
document.getElementById('BackToChatbot').addEventListener('click', () => {
    vscode.postMessage({
        type: 'backToChatbot'
    });
});
document.getElementById('GoodMorning').addEventListener('click', () => {
    vscode.postMessage({
        type: 'goodMorning'
    });
});