'use strict';
import * as vscode from 'vscode';
import webServer from "./webserver";

export enum SourceType {
    SCRIPT,
    STYLE
}

export function activate(context: vscode.ExtensionContext) {
    const port = 3000
    let webS = new webServer(port);

    class BrowserContentProvider implements vscode.TextDocumentContentProvider {
        private _onDidChange = new vscode.EventEmitter<vscode.Uri>();

        get onDidChange(): vscode.Event<vscode.Uri> {
            return this._onDidChange.event;
        }

        public update(uri: vscode.Uri) {
            this._onDidChange.fire(uri);
        }

       
        provideTextDocumentContent(uri: vscode.Uri, token: vscode.CancellationToken): string {
            // TODO: detect failures on loading
            
            return `<iframe src="${uri}" frameBorder="0" position: absolute; style="width: 98vw; height: 99vh;" />`;
        }
    }

    function urlIsValid(url: string): boolean {
        if (url.startsWith("http://") || url.startsWith("https://")) {
            return true;
        }
        return false;
    }

 
  
    let provider = new BrowserContentProvider();
    let url = "http://127.0.0.1:" + port;
    let uri = vscode.Uri.parse(url);

    vscode.workspace.onDidSaveTextDocument((e: vscode.TextDocument) => {
        let fileNAme = e.fileName.split("/");
        if (fileNAme[fileNAme.length - 1].toLocaleLowerCase() == "manifest.json") {
            console.log("Manifest changed")
            webS.emmitChange();
        }
    });

    vscode.workspace.onDidChangeTextDocument((e: vscode.TextDocumentChangeEvent) => {
        if (e.document === vscode.window.activeTextEditor.document) {
            provider.update(uri);
        }
    });

    vscode.window.onDidChangeTextEditorSelection((e: vscode.TextEditorSelectionChangeEvent) => {
        if (e.textEditor === vscode.window.activeTextEditor) {
            provider.update(uri);
        }
    })

    let disposable = vscode.commands.registerCommand('extension.manifest', () => {

       
        // Handle https-http
        let registrationHTTPS = vscode.workspace.registerTextDocumentContentProvider('https', provider);
        let registrationHTTP = vscode.workspace.registerTextDocumentContentProvider('http', provider);
            if (!urlIsValid(url)) {
            return;
        }

    // Determine column to place browser in.
        let col: vscode.ViewColumn;
        let ae = vscode.window.activeTextEditor;
        if (ae != undefined) {
            col = ae.viewColumn || vscode.ViewColumn.One;
        } else {
            col = vscode.ViewColumn.One;
        }
        // col = vscode.ViewColumn.Two;
        // vscode.commands.executeCommand('vscode.previewHtml', "a", col)
        return vscode.commands.executeCommand('vscode.previewHtml', uri, col ).then((success) => {
            console.log("OK")
        }, (reason) => {
            console.log("KO")
            vscode.window.showErrorMessage(reason);
        });
    });

    context.subscriptions.push(disposable,);
    
}

// this method is called when your extension is deactivated
export function deactivate() {
}