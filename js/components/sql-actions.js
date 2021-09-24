// Actions menu component
class SqlActions extends HTMLElement {
    connectedCallback() {
        if (!this.rendered) {
            this.render();
            this.listen();
            this.rendered = true;
        }
    }

    render() {
        this.el = document.createElement("details");
        this.el.innerHTML = `
            <summary>more</summary>
            <button data-action="open-url" class="hidden-desktop">open url</button>
            <button data-action="load-demo">load demo</button>
            <button data-action="show-tables">show tables</button>
            <button data-action="show-version">show version</button>
        `;
        this.appendChild(this.el);
    }

    listen() {
        // notify listeners about the requested action
        this.el.addEventListener("click", (event) => {
            if (event.target.tagName != "BUTTON") {
                return;
            }
            this.el.open = false;
            const action = event.target.dataset.action;
            this.dispatchEvent(new CustomEvent("action", { detail: action }));
        });
    }
}

customElements.define("sql-actions", SqlActions);
