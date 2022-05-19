const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const Tester = require('./js/tester');

let _tester = new Tester();

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	console.log('Congratulations, your extension "endpointtester" is now active!');

	let disposable = vscode.commands.registerCommand('endpointtester.endpointTester', function () {
		vscode.window.showInformationMessage('Started endpointtester');

		const panel = vscode.window.createWebviewPanel('endpointtester', "Endpoint Tester", vscode.ViewColumn.One, getWebviewOptions(context));

		const stylePath = vscode.Uri.joinPath(context.extensionUri, 'styles', 'stylesheet.css');
		const styleUri = panel.webview.asWebviewUri(stylePath);
		
		const compactPath = vscode.Uri.file(path.join(context.extensionPath, 'views', 'compact.html'));
		let compactViewHtml = fs.readFileSync(compactPath.fsPath, 'utf8').toString();

		const nonce = getNonce();

		_tester.setWebview(panel.webview);

		// Tries to prevent someone from manually inserting matching nonces into html
		if(!compactViewHtml.includes('{nonce}')) throw new Error('External html has been tampered with. Exiting.');

		compactViewHtml = compactViewHtml
			.replace('{style}', styleUri.toString())
			.replace('{cspSource}', panel.webview.cspSource)
			.replace('{nonce}', nonce)
			.replace('{nonce}', nonce);

		panel.webview.onDidReceiveMessage(handleWebviewMessage, undefined, context.subscriptions);

		panel.webview.html = compactViewHtml;
	});

	context.subscriptions.push(disposable);
}

function deactivate() {}

function handleWebviewMessage(message) {
	_tester.submitRequest(message.root, message.route, message.method, null);
}

function getWebviewOptions(ctx) {
	return {
		localResourceRoots: [
			vscode.Uri.file(path.join(ctx.extensionPath, 'styles')),
			vscode.Uri.file(path.join(ctx.extensionPath, 'js')) ],
		enableScripts: true
	}
}

function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}

module.exports = {
	activate,
	deactivate
}