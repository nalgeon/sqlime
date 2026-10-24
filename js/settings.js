const ui = {
    settings: document.querySelector("#settings"),
    github: {
        username: document.querySelector("#github-username"),
        token: document.querySelector("#github-token"),
    },
};

ui.settings.addEventListener("submit", (event) => {
    event.preventDefault();
    localStorage.setItem("github.username", ui.github.username.value);
    localStorage.setItem("github.token", ui.github.token.value);
});

ui.github.username.addEventListener("change", (event) => {
    localStorage.setItem("github.username", event.target.value);
});

ui.github.token.addEventListener("change", (event) => {
    localStorage.setItem("github.token", event.target.value);
});

ui.github.username.value = localStorage.getItem("github.username") || "";
ui.github.token.value = localStorage.getItem("github.token") || "";
