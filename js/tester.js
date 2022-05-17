const Request = require('./request');

class Tester {
    constructor() {
        this.cache = [Request];
    }

    async submitRequest(route, method, data) {
        let request = new Request(route, method, data);
        let response = await request.send();
        let responseBody = await response.text();
        
        console.log(responseBody);

        this.cache.push(request);
    }
}

module.exports = Tester;