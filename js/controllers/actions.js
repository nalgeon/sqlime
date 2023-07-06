// Action controller executes an action
// when the corresponding button is clicked.
class ActionController {
    constructor(handlers) {
        this.handlers = handlers;
    }

    // listen listens for clicks
    listen(...elems) {
        for (const el of elems) {
            el.addEventListener("click", this.onClick.bind(this));
        }
    }

    // onClick executes an action
    // according to the button clicked
    onClick(event) {
        const btn =
            event.target.tagName == "BUTTON"
                ? event.target
                : event.target.parentElement;
        if (btn.tagName != "BUTTON") {
            return;
        }

        const handler = this.handlers[btn.dataset.action];
        if (!handler) {
            return;
        }

        btn.setAttribute("disabled", "");
        handler(btn.dataset.arg)
            .then(() => {
                btn.removeAttribute("disabled");
            })
            .catch(() => {
                btn.removeAttribute("disabled");
            });
    }
}

export { ActionController };
