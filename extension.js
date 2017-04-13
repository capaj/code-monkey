const vscode = require('vscode')
const _ = require('lodash')
const maxLength = 10
const nonAlphaRegex = /[^a-zA-Z\d\s:]/
const alphaRegex = /^\w+$/
const monkeyWords = []

function activate(context) {
  let cursorPosition = null
  let startNewWord = true

  function addWord (word) {
    word = word.trim()
    if (word.length === 0) {
      return
    }
    if (monkeyWords.length === maxLength) {
      monkeyWords.pop()
    }
    const indexOfWord = monkeyWords.indexOf(word)
    if (indexOfWord !== -1) {
      monkeyWords.splice(indexOfWord, 1)
    }
    startNewWord = false
    monkeyWords.unshift(word)
  }

  const editorSelectionEventDisposable = vscode.window.onDidChangeTextEditorSelection(event => {
    console.log('onDidChangeTextEditorSelection', event)
    const {selections} = event
    if (selections.length > 1) {
      startNewWord = true
    } else {
      const [selection] = selections
      if (!selection.start.isEqual(selection.end)) {
        startNewWord = true
        return
      } else {
        cursorPosition = selection.start
      }
      // if (selection.is) {

      // }
      cursorPosition = selection
    }
  })
  const editorChangeEventDisposable = vscode.workspace.onDidChangeTextDocument(event => {
    const {text} = event.contentChanges[0]
    if (text.startsWith('\n')) {
      startNewWord = true
      return
    }
    if (text.length === 1) {
      if (monkeyWords[0] && startNewWord === false) {
        if (text === ' ') {
          startNewWord = true
        } else {
          monkeyWords[0] += text
        }
      } else {
        addWord(text)
      }
    } else if (text.length > 1) {
      const splittedLastWord = monkeyWords[0].split(nonAlphaRegex)
      const lastToken = splittedLastWord.pop()
      if (text.startsWith(lastToken)) {
        monkeyWords[0] = monkeyWords[0].substr(0, monkeyWords[0].length - lastToken.length) + text;
      } else if (text.match(alphaRegex) === null) {
        monkeyWords[0] += text
      } else {
        addWord(text)
      }
    } else if (text.length === 0) {
      const {rangeLength} = event.contentChanges[0]
      if (rangeLength === monkeyWords[0].length) {
        monkeyWords.shift()
      } else {
        monkeyWords[0] = monkeyWords[0].substr(0, monkeyWords[0].length - rangeLength)
      }
    }

    let monkeyWordsIndex = monkeyWords.length
    while (monkeyWordsIndex--) {
      if (monkeyWords.indexOf(monkeyWords[monkeyWordsIndex]) !== monkeyWordsIndex) {
        monkeyWords.splice(monkeyWordsIndex, 1)
      }
    }
    console.log(monkeyWords)
  })
  const MonkeyCompletionItemProvider = require('./monkey-completion')
  const dispAutocomplete = vscode.languages.registerCompletionItemProvider('*', new MonkeyCompletionItemProvider())

  context.subscriptions.push(dispAutocomplete)
  context.subscriptions.push(editorChangeEventDisposable)
  context.subscriptions.push(editorSelectionEventDisposable)
}
exports.activate = activate

exports.deactivate = () => {

}

exports.monkeyWords = monkeyWords
