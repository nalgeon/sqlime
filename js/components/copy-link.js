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
            if (!navigator.clipboard) {
                this.legacyCopy();
                this.markSuccess();
                return;
            }
            navigator.clipboard.writeText(this.href).then(() => {
                this.markSuccess();
            });
        });
    }

    legacyCopy() {
        const txt = document.createElement("textarea");
        txt.value = this.href;

        // Avoid scrolling to bottom
        txt.style.top = "0";
        txt.style.left = "0";
        txt.style.position = "fixed";

        document.body.appendChild(txt);
        txt.focus();
        txt.select();

        document.execCommand("copy");
        document.body.removeChild(txt);
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
