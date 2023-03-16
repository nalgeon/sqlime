const ui = {
    settings: document.querySelector("#settings"),
    github: {
        username: document.querySelector("#github-username"),
        token: document.querySelector("#github-token"),
    },
    openai: {
        apikey: document.querySelector("#openai-apikey"),
    },
};

ui.settings.addEventListener("submit", (event) => {
    event.preventDefault();
    localStorage.setItem("github.username", ui.github.username.value);
    localStorage.setItem("github.token", ui.github.token.value);
    localStorage.setItem("openai.apikey", ui.openai.apikey.value);
});

ui.github.username.addEventListener("change", (event) => {
    localStorage.setItem("github.username", event.target.value);
});

ui.github.token.addEventListener("change", (event) => {
    localStorage.setItem("github.token", event.target.value);
});

ui.openai.apikey.addEventListener("change", (event) => {
    localStorage.setItem("openai.apikey", event.target.value);
});

ui.github.username.value = localStorage.getItem("github.username") || "";
ui.github.token.value = localStorage.getItem("github.token") || "";
ui.openai.apikey.value = localStorage.getItem("openai.apikey") || "";
