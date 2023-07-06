// Toolbar element
class Toolbar extends HTMLElement {
    connectedCallback() {
        if (!this.rendered) {
            this.render();
            this.listen();
            this.rendered = true;
        }
    }

    render() {
        this.innerHTML = `
<label title="⌃O or ⌘O" class="button button--small">
    open file <input type="file">
</label>
<button title="⌃U or ⌘U" class="button button--small">open url</button>
<a href="settings.html" class="button button--small">
    <svg viewBox="0 0 800 800" role="img">
        <path fill="currentColor" fill-rule="evenodd" stroke="none"
            d="M 720.000061 171.428589 L 720.000061 19.047607 L 640 19.047607 L 640 171.428589 L 560 171.428589 L 560 247.619019 L 640 247.619019 L 640 780.952393 L 720.000061 780.952393 L 720.000061 247.619019 L 800 247.619019 L 800 171.428589 L 720.000061 171.428589 Z M 439.999969 19.047607 L 360.000031 19.047607 L 360.000031 361.904755 L 279.999939 361.904755 L 279.999939 438.095245 L 360.000031 438.095245 L 360.000031 780.952393 L 439.999969 780.952393 L 439.999969 438.095245 L 520.000061 438.095245 L 520.000061 361.904755 L 439.999969 361.904755 L 439.999969 19.047607 Z M 160.000031 552.380981 L 239.999969 552.380981 L 239.999969 628.571411 L 160.000031 628.571411 L 160.000031 780.952393 L 79.999939 780.952393 L 79.999939 628.571411 L 0 628.571411 L 0 552.380981 L 79.999939 552.380981 L 79.999939 19.047607 L 160.000031 19.047607 L 160.000031 552.380981 Z" />
    </svg>
    settings
</a>
<a href="about.html" class="button button--small button-help">
    <svg viewBox="0 0 800 800" role="img">
        <path fill="none" stroke="currentColor" stroke-width="156" stroke-linecap="round"
            stroke-linejoin="round" d="M 0 800 L 800 800 L 800 0 L 0 0 Z" />
        <path fill="currentColor" fill-rule="evenodd" stroke="none"
            d="M 394.474884 188.171265 C 408.828461 188.171265 420.556183 192.634827 429.658447 201.562073 C 438.760742 210.489258 443.311798 221.60437 443.311798 234.907715 C 443.311798 248.210999 438.760742 259.369873 429.658447 268.384644 C 420.556183 277.399353 408.828461 281.906677 394.474884 281.906677 C 379.946259 281.906677 368.087219 277.399353 358.89743 268.384644 C 349.707642 259.369873 345.112823 248.210999 345.112823 234.907715 C 345.112823 221.60437 349.707642 210.489258 358.89743 201.562073 C 368.087219 192.634827 379.946259 188.171265 394.474884 188.171265 Z M 444.624603 334.156921 L 444.624603 556.286133 L 515.516907 556.286133 L 515.516907 613 L 282.622559 613 L 282.622559 556.286133 L 361.654358 556.286133 L 361.654358 390.870758 L 285.248199 390.870758 L 285.248199 334.156921 Z" />
    </svg>
</a>`;
        this.btnOpenFile = this.querySelector(":nth-child(1)");
        this.file = this.btnOpenFile.querySelector("input");
        this.btnOpenUrl = this.querySelector(":nth-child(2)");
        this.btnSettings = this.querySelector(":nth-child(3)");
        this.btnAbout = this.querySelector(":nth-child(4)");
    }

    listen() {
        this.file.addEventListener("change", (event) => {
            if (!event.target.files.length) {
                return;
            }
            const file = event.target.files[0];
            this.dispatchEvent(new CustomEvent("open-file", { detail: file }));
        });

        this.btnOpenUrl.addEventListener("click", (event) => {
            this.dispatchEvent(new Event("open-url"));
        });
    }
}

customElements.define("tool-bar", Toolbar);
