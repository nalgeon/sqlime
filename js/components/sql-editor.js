// SQL editor component
class SqlEditor extends HTMLElement {
    connectedCallback() {
        if (!this.rendered) {
            this.render();
            this.listen();
            this.rendered = true;
        }
    }

    render() {
        this.contentEditable = "true";
    }

    listen() {
        // Ctrl+Enter or Cmd+Enter shortcut
        this.addEventListener("keydown", (event) => {
            if (
                (event.keyCode == 10 || event.keyCode == 13) &&
                (event.ctrlKey || event.metaKey)
            ) {
                this.dispatchEvent(
                    new CustomEvent("execute", { detail: this.value })
                );
                return false;
            }
            return true;
        });

        // first input event
        const onInput = (event) => {
            this.dispatchEvent(new Event("start"));
            this.removeEventListener("input", onInput);
        };
        this.addEventListener("input", onInput);

        // always paste as plain text
        this.addEventListener("paste", function (event) {
            event.preventDefault();
            // get text representation of clipboard
            const text = (event.originalEvent || event).clipboardData.getData(
                "text/plain"
            );
            // insert text manually
            document.execCommand("insertHTML", false, text);
        });
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

    get value() {
        return this.innerText;
    }
    set value(newValue) {
        this.innerText = newValue;
    }
}

customElements.define("sql-editor", SqlEditor);
