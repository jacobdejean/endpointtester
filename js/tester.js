const fetch = require('node-fetch');

class Tester {
    constructor() {
        this.cache = [];
        this.route = '/';
        this.method = 'GET';
        this.data = null;
    }

    async submit() {
        const response = await fetch(this.route, {
            method: this.method,
            body: this.method === "GET" ? null : this.data
        });

        const responseBody = await response.text();
        
        console.log(responseBody);
    }
}

module.exports = Tester;