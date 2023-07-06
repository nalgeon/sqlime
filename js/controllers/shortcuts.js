// Shortcut controller listens for Ctrl / Cmd + key shortcuts
// and executes an action when the shortcut is triggered.
class ShortcutController {
    constructor(handlers) {
        this.handlers = handlers;
    }

    // listen listens for shortcuts
    listen(...elems) {
        for (const el of elems) {
            el.addEventListener("keydown", this.onKeydown.bind(this));
        }
    }

    // onClick executes an action
    // according to the shortcut
    onKeydown(event) {
        if (!event.ctrlKey && !event.metaKey) {
            return;
        }
        const handler = this.handlers[event.key];
        if (!handler) {
            return;
        }
        console.debug(`Triggered Ctrl/Cmd + ${event.key} shortcut`);
        event.preventDefault();
        handler();
    }
}

export { ShortcutController };
