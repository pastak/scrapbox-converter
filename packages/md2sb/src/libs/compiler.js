import generateCodeBlock from './generateCodeBlock'

export default class {
  compile (ast, parents = []) {
    let result =  [...(ast.children || ast)].map((node) => this.node2SbText(node, parents.slice(0))).join('\n')
    if (ast.type && ast.type === 'root' && result.charAt(result.length - 1) !== '\n') {
      result += '\n'
    }
    return result
  }

  node2SbText (node, parents) {
    let result = ''
    switch (node.type) {
      case 'thematicBreak':
        result += '[/icons/hr.icon]'
        break
      case 'heading':
        result += `[[${this.compile(node.children, parents)}]]`
        break
      case 'Strong':
        result += `[[${this.compile(node.children, parents)}]]`
        break
      case 'blockquote':
        result += '> ' + this.compile(node.children, parents).split('\n').join('\n> ' + result)
        break
      case 'code':
        result += generateCodeBlock(node)
        break
      case 'List':
        parents.push('List')
        result += this.compile(node.children, parents)
        break
      case 'ListItem':
        result += ' '.repeat(parents.filter((i) => i === 'List').length) + this.compile(node.children, parents)
        break
      case 'paragraph':
        result += this.compile(node.children, parents)
        break
      case 'text':
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
