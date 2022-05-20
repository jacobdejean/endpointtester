const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const Tester = require('./tester');

class TesterProvider {
    constructor(extensionPath, extensionUri) {
        this.extensionPath = extensionPath;
        this.extensionUri = extensionUri;
        this.viewType = 'endpointtester.endpointTesterView';
        this.tester = new Tester();
    }

    resolveWebviewView(webviewView) {
        webviewView.webview.options = this.getWebviewOptions();
        webviewView.webview.html = this.getHtml(webviewView.webview);
    }

    getWebviewOptions() {
        return {
            localResourceRoots: [
                vscode.Uri.file(path.join(this.extensionPath, 'styles')),
                vscode.Uri.file(path.join(this.extensionPath, 'js')) ],
            enableScripts: true
        }
    }

    getHtml(webview) {
        const stylePath = vscode.Uri.joinPath(this.extensionUri, 'styles', 'stylesheet.css');
		const styleUri = webview.asWebviewUri(stylePath);
		
		const compactPath = vscode.Uri.file(path.join(this.extensionPath, 'views', 'compact.html'));
		let compactViewHtml = fs.readFileSync(compactPath.fsPath, 'utf8').toString();

		const nonce = this.getNonce();

		this.tester.setWebview(webview);

		// Tries to prevent someone from manually inserting matching nonces into html
		if(!compactViewHtml.includes('{nonce}')) throw new Error('External html has been tampered with. Exiting.');

		compactViewHtml = compactViewHtml
			.replace('{style}', styleUri.toString())
			.replace('{cspSource}', webview.cspSource)
			.replace('{nonce}', nonce)
			.replace('{nonce}', nonce);

        webview.onDidReceiveMessage((message) => {
            this.handleWebviewMessage(message);
        })

        return compactViewHtml;
    }

    handleWebviewMessage(message) {
        this.tester.submitRequest(message.root, message.route, message.method, null);
    }
    
    getNonce() {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }
}

module.exports = TesterProvider;