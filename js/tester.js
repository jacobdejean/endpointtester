const fetch = require('node-fetch');

class Tester {
    constructor() {
        this.cache = [];
        this.route = '/';
        this.method = 'GET';
        this.data = { "warning": "no data provided" };
    }

    async submit() {
        const response = await fetch(this.route, {
            method: this.method,
            body: this.data
        });

        const responseBody = await response.text();
        
        console.log(responseBody);
    }
}

module.exports = Tester;