import * as vscode from 'vscode';
import { fileStats } from './types';

let statusBarItem: vscode.StatusBarItem;
const separator = '|';

export function activate(context: vscode.ExtensionContext) {
	const commandId = 'file-length.ShowLinesCount';
	context.subscriptions.push(
		vscode.commands.registerCommand(commandId, () => {
			const currentDocument = vscode.window.activeTextEditor?.document;

			vscode.window.showInformationMessage(
				`File ${getFileName(currentDocument)} is ${
					currentDocument?.lineCount
				} lines long`
			);
		})
	);

	statusBarItem = vscode.window.createStatusBarItem(
		vscode.StatusBarAlignment.Left,
		0
	);
	statusBarItem.command = commandId;
	statusBarItem.tooltip = 'Lines in the current File';

	context.subscriptions.push(statusBarItem);

	context.subscriptions.push(
		vscode.window.onDidChangeActiveTextEditor(updateStatusBarItem)
	);
	context.subscriptions.push(
		vscode.window.onDidChangeVisibleTextEditors(updateStatusBarItem)
	);
	context.subscriptions.push(
		vscode.workspace.onDidChangeTextDocument(updateStatusBarItem)
	);

	updateStatusBarItem();
}

function updateStatusBarItem(): void {
	const text = statusBarText();

	if (text !== '') {
		statusBarItem.text = `$(list-ordered) Length: ${text}`;
		statusBarItem.show();
	} else {
		statusBarItem.hide();
	}
}

function openFileStats(): Array<fileStats> {
	const visibleEditors: ReadonlyArray<vscode.TextEditor> =
		vscode.window.visibleTextEditors;
	const openFiles: Array<fileStats> = [];
	visibleEditors.forEach((e) => {
		console.log(e);
		openFiles.push({
			lines: e?.document.lineCount,
			column: e?.viewColumn,
		});
	});

	openFiles.sort(
		(a, b) =>
			(a.column == undefined ? Number.MAX_VALUE : a.column) -
			(b.column == undefined ? Number.MAX_VALUE : b.column)
	);
	return openFiles;
}

function getFileName(doc: vscode.TextDocument | undefined): string | undefined {
	const displayName = doc?.isUntitled ? '' : doc?.fileName;
	const workSpace = vscode.workspace.workspaceFolders?.[0].uri.path;
	return displayName?.replace(workSpace ? workSpace : '', '');
}

function statusBarText(): string {
	const sortedLengths: Array<number> = openFileStats().map(
		(file) => file.lines
	);
	return sortedLengths.join(` ${separator} `);
}
