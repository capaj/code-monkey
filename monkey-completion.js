const os = require('os')

const {
  // TextDocument,
  Position,
  Range,
  CompletionItem,
  TextEdit,
  workspace
} = require('vscode')

const config = workspace.getConfiguration('code-monkey')
const {monkeyWords} = require('./extension')
const makeCompletionItem = (name) => {
  const ci = new CompletionItem(name)
  ci.documentation = 'monkey'
  ci.filterText = name
  ci.sortText = name
  ci.insertText = name
  return ci
}

class MonkeyCompletionItemProvider {
  provideCompletionItems (document, position, token) {
    const [head, ...words] = monkeyWords
    return words.map(makeCompletionItem)
  }
}

module.exports = MonkeyCompletionItemProvider
