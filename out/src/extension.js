'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const webserver_1 = require("./webserver");
var SourceType;
(function (SourceType) {
    SourceType[SourceType["SCRIPT"] = 0] = "SCRIPT";
    SourceType[SourceType["STYLE"] = 1] = "STYLE";
})(SourceType = exports.SourceType || (exports.SourceType = {}));
function activate(context) {
    const port = 3000;
    let webS = new webserver_1.default(port);
    class BrowserContentProvider {
        constructor() {
            this._onDidChange = new vscode.EventEmitter();
        }
        get onDidChange() {
            return this._onDidChange.event;
        }
        update(uri) {
            this._onDidChange.fire(uri);
        }
        provideTextDocumentContent(uri, token) {
            // TODO: detect failures on loading
            return `<iframe src="${uri}" frameBorder="0" position: absolute; style="width: 98vw; height: 99vh;" />`;
        }
    }
    function urlIsValid(url) {
        if (url.startsWith("http://") || url.startsWith("https://")) {
            return true;
        }
        return false;
    }
    let provider = new BrowserContentProvider();
    let url = "http://127.0.0.1:" + port;
    let uri = vscode.Uri.parse(url);
    vscode.workspace.onDidSaveTextDocument((e) => {
        let fileNAme = e.fileName.split("/");
        if (fileNAme[fileNAme.length - 1].toLocaleLowerCase() == "manifest.json") {
            console.log("Manifest changed");
            webS.emmitChange();
        }
    });
    vscode.workspace.onDidChangeTextDocument((e) => {
        if (e.document === vscode.window.activeTextEditor.document) {
            provider.update(uri);
        }
    });
    vscode.window.onDidChangeTextEditorSelection((e) => {
        if (e.textEditor === vscode.window.activeTextEditor) {
            provider.update(uri);
        }
    });
    let disposable = vscode.commands.registerCommand('extension.manifest', () => {
        // Handle https-http
        let registrationHTTPS = vscode.workspace.registerTextDocumentContentProvider('https', provider);
        let registrationHTTP = vscode.workspace.registerTextDocumentContentProvider('http', provider);
        if (!urlIsValid(url)) {
            return;
        }
        // Determine column to place browser in.
        let col;
        let ae = vscode.window.activeTextEditor;
        if (ae != undefined) {
            col = ae.viewColumn || vscode.ViewColumn.One;
        }
        else {
            col = vscode.ViewColumn.One;
        }
        // col = vscode.ViewColumn.Two;
        // vscode.commands.executeCommand('vscode.previewHtml', "a", col)
        return vscode.commands.executeCommand('vscode.previewHtml', uri, col).then((success) => {
            console.log("OK");
        }, (reason) => {
            console.log("KO");
            vscode.window.showErrorMessage(reason);
        });
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
