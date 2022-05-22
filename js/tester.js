const Request = require('./request');
const marky = require('marky');
const { FetchError } = require('node-fetch');
const { Response } = require('node-fetch');

const RED = "#D00000";
const BLUE = "#1A659E";
const GREEN = "#5FAD56";
const WHITE = "#FFFFFF";
const BLACK = "#000000";

class Tester {
    constructor() {
        this.cache = [Request];
    }

    setWebview(webview) {
        this.webview = webview;
    }

    logOutput(log, content) {
        this.webview.postMessage({ tokens: log, content: content })
    }

    async runFlow(flow) {
        this.logOutput([
            { text: "running flow", highlight: WHITE, color: BLACK },
            { text: flow.name, highlight: "transparent", color: WHITE }
        ]);

        this.logOutput([
            { text: "root", highlight: WHITE, color: BLACK },
            { text: flow.root, highlight: "transparent", color: WHITE }
        ]);

        //flow.variableTokens.forEach((token) => {
//
        //});

        //let finalRoute = flow.route.replace()
        for(let i = 0; i < flow.flow.length; i++) {
            let flowPart = flow.flow[i];

            flow.variableTokens.forEach(variableToken => {
                flowPart.route = flowPart.route.replace(variableToken.token, variableToken.default);
            });

            this.logOutput([
                { text: flowPart.name, highlight: WHITE, color: BLACK }
            ]);

            await this.submitRequest(flow.root, flowPart.route, flowPart.method, flowPart.body);
        }

        this.logOutput([
            { text: "completed flow", highlight: "transparent", color: BLACK }
        ]);
    }

    async submitRequest(root, route, method, data) {
        this.logOutput([
            { text: method, highlight: WHITE, color: BLACK },
            { text: route, highlight: "transparent", color: WHITE }
        ]);

        let request = new Request(root, route, method, data);

        marky.mark('requestSend');
        this.handleResponse(await request.send());
    }

    handleResponse(response) {
        response instanceof FetchError ? this.logResponseAsFetchError(response) :
            response instanceof TypeError ? this.logResponseAsTypeError(response) :
                response instanceof Response ? this.logResponseAsRecieved(response) : null;
    }

    logResponseAsFetchError(response) {
        this.logOutput([
            { text: "error", highlight: RED, color: WHITE },
            { text: response.errno, highlight: "transparent", color: WHITE }
        ]);
    }

    logResponseAsTypeError(response) {
        this.logOutput([
            { text: "error", highlight: RED, color: WHITE },
            { text: response.message, highlight: "transparent", color: WHITE }
        ]);
    }

    async logResponseAsRecieved(response) {
        let responseTime = marky.stop('requestSend').duration.toFixed(2);

        this.logOutput([
            { text: response.status, highlight: mapStatusCode(response.status), color: WHITE },
            { text: response.statusText, highlight: mapStatusCode(response.status), color: WHITE },
            { text: 'in', highlight: "transparent", color: WHITE },
            { text: responseTime, highlight: WHITE, color: BLACK },
            { text: "ms", highlight: WHITE, color: BLACK }
        ]);

        let responseBody = await response.text();
        let responseType = 'text response';

        try {
            responseBody = JSON.parse(responseBody);
            responseType = 'json response';
        } catch (e) {
            if(/<\/?[a-z][\s\S]*>/i.test(responseBody)) {
                responseType = 'html response';
            }
        }

        this.logOutput([
            { text: ">", highlight: "transparent", color: WHITE },
            { text: responseType, highlight: WHITE, color: BLACK }
        ], responseBody);

        
    }
}

function mapStatusCode(status) {
    return status < 200 ? WHITE :
        status < 300 ? GREEN :
            status < 400 ? BLUE :
                status < 600 ? RED : WHITE
}

module.exports = Tester;