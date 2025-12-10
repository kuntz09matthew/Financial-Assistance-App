// Renderer process IPC test
const { ipcRenderer } = require('electron');

window.addEventListener('DOMContentLoaded', () => {
    // Listen for message from main process
    ipcRenderer.on('main-process-message', (event, message) => {
        const msgDiv = document.createElement('div');
        msgDiv.textContent = `Main: ${message}`;
        document.body.appendChild(msgDiv);
    });

    // Send test message to main process
    ipcRenderer.send('renderer-to-main', 'Hello from renderer!');

    // Listen for reply from main process
    ipcRenderer.on('main-to-renderer', (event, message) => {
        const replyDiv = document.createElement('div');
        replyDiv.textContent = `Main replied: ${message}`;
        document.body.appendChild(replyDiv);
    });
});
