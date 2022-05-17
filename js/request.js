const fetch = require('node-fetch');

class Request {
    constructor(route, method, data) {
        this.route = route;
        this.method = method;
        this.data = data;
    }

    async send() {
        return await fetch(this.route, {
            method: this.method,
            body: this.method === "GET" ? null : this.data
        });
    }
}

module.exports = Request;