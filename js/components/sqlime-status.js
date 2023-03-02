// SQL query status component
// shows the state of the SQL query execution
class SqlimeStatus extends HTMLElement {
    connectedCallback() {
        if (!this.rendered) {
            this.render();
            this.rendered = true;
        }
    }

    render() {
        const el = document.createElement("div");
        this.appendChild(el);
        this.el = el;
    }

    // success shows the message and marks is as success
    success(message) {
        this.el.className = "sql-status--success";
        this.value = message;
    }

    // success shows the message without styling it
    info(message) {
        this.el.className = "";
        this.value = message;
    }

    // error shows the message and marks is as error
    error(message) {
        this.el.className = "sql-status--error";
        this.value = message;
    }

    get value() {
        return this.el.innerText;
    }
    set value(newValue) {
        this.el.innerHTML = newValue;
    }
}

if (!window.customElements.get("sqlime-status")) {
    window.SqlimeStatus = SqlimeStatus;
    customElements.define("sqlime-status", SqlimeStatus);
}
