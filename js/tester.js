const Request = require('./request');
const marky = require('marky');

class Tester {
    constructor() {
        this.cache = [Request];
    }

    setWebview(webview) {
        this.webview = webview;
    }

    logOutput(log) {
        this.webview.postMessage(log);
    }
    
    async submitRequest(root, route, method, data) {
        this.logOutput(method + ' ' + root + ' ~ ' + data);

        let request = new Request(root, route, method, data);
        
        marky.mark('requestSend');
        let response = await request.send();
        let responseBody = await response.text();
        let responseTime = marky.stop('requestSend').duration.toFixed(2);
        
        this.logOutput('status ' + response.status + ': ' + response.statusText + ' in ' + responseTime + ' ms');

        console.log(response);

        this.cache.push(request);
    }
}

module.exports = Tester;