// SQL editor component
const TAB_WIDTH = 2;

class SqlimeEditor extends HTMLElement {
    connectedCallback() {
        if (!this.rendered) {
            this.render();
            this.listen();
            this.rendered = true;
        }
    }

    render() {
        this.contentEditable = "true";
        this.spellcheck = "false";
    }

    listen() {
        // shortcuts
        this.addEventListener("keydown", this.onKeydown.bind(this));
        // always paste as plain text
        this.addEventListener("paste", this.onPaste.bind(this));
        // first input event
        const onInput = (event) => {
            this.dispatchEvent(new Event("start"));
            this.removeEventListener("input", onInput);
        };
        this.addEventListener("input", onInput);
    }

    // focus sets cursor at the end of the editor
    focus() {
        super.focus();
        document.execCommand("selectAll", false, null);
        document.getSelection().collapseToEnd();
    }

    // clear clears editor contents
    clear() {
        this.value = "";
    }

    onKeydown(event) {
        if (handleIndent(this, event)) return;
        if (handleExecute(this, event)) return;
    }

    onPaste(event) {
        event.preventDefault();
        // get text representation of clipboard
        const text = (event.originalEvent || event).clipboardData.getData(
            "text/plain"
        );
        // insert text manually
        document.execCommand("insertHTML", false, text);
    }

    get value() {
        return this.innerText;
    }
    set value(newValue) {
        this.innerText = newValue;
    }

    get query() {
        const selectedQuery = window.getSelection().toString().trim();
        return selectedQuery || this.innerText;
    }
}

// handleIndent indents text with Tab
function handleIndent(elem, event) {
    if (event.key != "Tab") {
        return false;
    }
    event.preventDefault();
    document.execCommand("insertHTML", false, " ".repeat(TAB_WIDTH));
    return true;
}

// handleExecute truggers 'execute' event by Ctrl/Cmd+Enter
function handleExecute(elem, event) {
    // Ctrl+Enter or Cmd+Enter
    if (!event.ctrlKey && !event.metaKey) {
        return false;
    }
    // 10 and 13 are Enter codes
    if (event.keyCode != 10 && event.keyCode != 13) {
        return false;
    }

    event.preventDefault();
    elem.dispatchEvent(new CustomEvent("execute", { detail: elem.query }));
    return true;
}

if (!window.customElements.get("sqlime-editor")) {
    window.SqlimeEditor = SqlimeEditor;
    customElements.define("sqlime-editor", SqlimeEditor);
}
