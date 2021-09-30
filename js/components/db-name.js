// Database name component
class DbName extends HTMLElement {
    connectedCallback() {
        if (!this.rendered) {
            this.listen();
            this.rendered = true;
        }
    }

    listen() {
        // User changed database name
        this.addEventListener("keydown", (event) => {
            if (event.key != "Enter") {
                return;
            }
            event.preventDefault();
            event.target.blur();
            this.dispatchEvent(new Event("change"));
        });
    }

    ready(name) {
        this.value = name;
        this.contentEditable = "true";
        this.classList.add("ready");
    }

    get value() {
        return this.innerText;
    }
    set value(newValue) {
        this.innerText = newValue;
    }
}

customElements.define("db-name", DbName);
