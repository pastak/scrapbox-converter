export default class {
  constructor () {
    this.metas = {}
  }
  compile (ast) {
    let result =  [...(ast.children || ast)].map((node) => this.node2sb(node))
      .join('')
    return {result, metas: this.metas}
  }

  node2sb (node) {
    let result = ''
    if (node.type === 'text') return node.data
    if (node.type === 'directive') return ''
    switch (node.name) {
      case 'title':
        this.metas.title = this.compile(node.children).result
        break
      case 'meta':
        this.metas[node.attribs.name] = node.attribs.content
        break
      case 'br':
        result += '\n'
        break
      case 'img':
        result += `[${node.attribs.src}]`
        break
      case 'table':
        result = 'table:\n'
          + this.compile(node.children).result
        break
      case 'tr':
      case 'thead':
        result += ' ' + node.children.map((_) => this.compile(_).result).join('\t') + '\n'
        break
      case 'b':
      case 'strong':
        result += `[[${this.compile(node.children).result}]]`
        break
      case 'i':
      case 'em':
        result += `[/ ${this.compile(node.children).result}]`
        break
      case 'a':
        result += `[${node.attribs.href} ${this.compile(node.children).result}]`
        break
      case 'ol':
        let count = 1
        result += this.compile(node.children.map((n) => {
          if(n.name !== 'li') return n
          n.listNumber = count++
          return n
        })).result
        break
      case 'li':
        result += ' '.repeat(this.countListLevel(node))
        + (node.listNumber ? node.listNumber + '. ' : '')
        + this.compile(node.children).result + '\n'
        break
      default:
        result += this.compile(node.children).result
    }
    if (this.isChildOf('body', node)) {
      result += '\n'
    }
    return result
  }

  isChildOf (type, node) {
    if (!node.parent) return false
    const {parent} = node
    if (parent.name === type) return true
    this.isChildOf(type, parent)
  }
  countListLevel (node, count = 0) {
    if (!node.parent) return count
    if (node.parent.name === 'ul' || node.parent.name === 'ol') {
      count += 1
    }
    return this.countListLevel(node.parent, count)
  }
}
