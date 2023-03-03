function actionButton(name, text, arg = null) {
    const btn = document.createElement("button");
    btn.className = "sqlime-link";
    btn.dataset.action = name;
    btn.innerHTML = text;
    if (arg) {
        btn.dataset.arg = arg;
    }
    return btn.outerHTML;
}

export { actionButton };
