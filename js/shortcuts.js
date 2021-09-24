// Listens for Ctrl / Cmd + key shortcuts

const handlers = {};

// listen subscribes for Ctrl / Cmd + key shortcut
// and invokes the callback when the shortcut is triggered
function listen(key, callback) {
    handlers[key] = callback;
}

document.addEventListener("keydown", (event) => {
    if (!event.ctrlKey && !event.metaKey) {
        return;
    }
    const handler = handlers[event.key];
    if (!handler) {
        return;
    }
    console.debug(`Triggered Ctrl/Cmd + ${event.key} shortcut`);
    event.preventDefault();
    handler();
});

const shortcuts = { listen };
export default shortcuts;
