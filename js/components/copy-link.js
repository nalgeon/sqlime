// Copy-on-click element
class CopyOnClick extends HTMLElement {
    connectedCallback() {
        if (!this.rendered) {
            this.render();
            this.rendered = true;
        }
    }

    render() {
        this.addEventListener("click", () => {
            navigator.clipboard.writeText(this.href).then(() => {
                this.markSuccess();
            });
        });
    }

    markSuccess() {
        const text = this.innerText;
        this.innerHTML = "copied!";
        setTimeout(() => {
            this.innerHTML = text;
        }, 500);
    }

    get href() {
        return this.getAttribute("href");
    }
    set value(newValue) {
        return this.setAttribute("href", newValue);
    }
}

customElements.define("copy-on-click", CopyOnClick);
