const ui = {
    settings: document.querySelector("#settings"),
    username: document.querySelector("#username"),
    token: document.querySelector("#token"),
};

ui.settings.addEventListener("submit", (event) => {
    event.preventDefault();
    localStorage.setItem("github.username", ui.username.value);
    localStorage.setItem("github.token", ui.token.value);
});

ui.username.addEventListener("change", (event) => {
    localStorage.setItem("github.username", event.target.value);
});

ui.token.addEventListener("change", (event) => {
    localStorage.setItem("github.token", event.target.value);
});

ui.username.value = localStorage.getItem("github.username") || "";
ui.token.value = localStorage.getItem("github.token") || "";
