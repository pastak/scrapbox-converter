import {parse} from 'markdown-to-ast'
import generateCodeBlock from './libs/generateCodeBlock'

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

  parse (ast, parents = []) {
    return [...(ast.children || ast)].map((node) => this.node2SbText(node, parents.slice(0))).join('\n')
  }

  node2SbText (node, parents) {
    let result = ''
    switch (node.type) {
      case 'Header':
        result += `[[${this.parse(node.children, parents)}]]\n`
        break
      case 'Strong':
        result += `[[${this.parse(node.children, parents)}]]`
        break
      case 'BlockQuote':
        result += '> ' + this.parse(node.children, parents).split('\n').join('\n> ' + result)
        break
      case 'CodeBlock':
        result += generateCodeBlock(node)
        break
      case 'Paragraph':
        result += this.parse(node.children, parents)
        break
      case 'Str':
        result += node.value
        break
    }
    if (parents.includes('BlockQuote')) {
      result = '> '.repeat(parents.filter((i) => i === 'BlockQuote').length - 1) + result
    }
    parents.push(node.type)
    return result
  }
}
