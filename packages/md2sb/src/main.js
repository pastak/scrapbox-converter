import {parse} from 'markdown-to-ast'

export default class {
  convert (input) {
    let mdText = input
    if (typeof input === 'object') {
      if (input instanceof Buffer) {
        mdText = input.toString()
      } else if (typeof input !== 'string') {
        throw new Error('It allows string or buffer')
      }
    }
    return this.parse(parse(mdText)) + '\n'
  }

  parse (ast) {
    return [...(ast.children || ast)].map((node) => this.node2SbText(node)).join('\n\n')
  }

  node2SbText (node) {
    switch (node.type) {
      case 'Header':
        return `[[${this.parse(node.children)}]]`
      case 'Strong':
        return `[[${this.parse(node.children)}]]`
      case 'Str':
        return node.value
    }
  }
}
