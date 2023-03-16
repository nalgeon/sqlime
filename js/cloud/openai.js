const URL = "https://api.openai.com/v1/chat/completions";

const HEADERS = {
    "Content-Type": "application/json",
};

const PROMPT =
    "Your primary goal is to help me understand, write and debug SQL queries in the SQLite dialect. Be detailed and thorough in your responses.";

const PARAMS = {
    temperature: 0.7,
    max_tokens: 1000,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
};

// OpenAI represents the OpenAI Chat Completion API
class OpenAI {
    constructor(apiKey, prompt = "") {
        this.apiKey = apiKey;
        this.prompt = prompt || PROMPT;
        this.headers = Object.assign({}, HEADERS);
        this.headers.Authorization = `Bearer ${apiKey}`;
    }

    // ask queries the API for chat completion
    // and returns the resulting message
    async ask(question) {
        const params = this.prepareParams(question);
        const resp = await this.fetchResponse(params);
        if (resp.choices.length == 0) {
            throw new Error("received an empty answer");
        }
        const answer = resp.choices[0].message.content.trim();
        return answer;
    }

    // prepareParams returns the params for the API request
    prepareParams(question) {
        const messages = [
            { role: "system", content: this.prompt },
            { role: "user", content: question },
        ];
        const data = {
            model: "gpt-3.5-turbo",
            messages: messages,
        };
        return Object.assign(data, PARAMS);
    }

    // fetchResponse queries the API for chat completion
    async fetchResponse(params) {
        const resp = await fetch(URL, {
            method: "post",
            headers: this.headers,
            body: JSON.stringify(params),
        });
        return await resp.json();
    }
}

export { OpenAI };
