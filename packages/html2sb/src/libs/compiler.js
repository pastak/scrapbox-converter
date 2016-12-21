export default class {
  constructor () {
    this.title = ''
  }
  compile (ast) {
    let result =  [...(ast.children || ast)].map((node) => this.node2sb(node))
      .join('')
    if (this.title) result.unshift(this.title)
    return result
  }

  node2sb (node) {
    let result = ''
    if (node.type === 'text') return node.data
    if (node.type === 'directive') return ''
    switch (node.name) {
      case 'title':
        this.title = node.data
        break
      case 'br':
        result += '\n'
        break
      case 'img':
        result += `[${node.attribs.src}]`
        break
      case 'table':
        result = 'table:\n'
          + this.compile(node.children)
        break
      case 'tr':
      case 'thead':
        result += ' ' + node.children.map((_) => this.compile(_)).join('\t') + '\n'
        break
      case 'b':
      case 'strong':
        result += `[[${this.compile(node.children)}]]`
        break
      case 'i':
      case 'em':
        result += `[/ ${this.compile(node.children)}]`
        break
      case 'a':
        result += `[${node.attribs.href} ${this.compile(node.children)}]`
        break
      case 'ol':
        let count = 1
        result += this.compile(node.children.map((n) => {
          if(n.name !== 'li') return n
          n.listNumber = count++
          return n
        }))
        break
      case 'li':
        result += ' '.repeat(this.countListLevel(node))
        + (node.listNumber ? node.listNumber + '. ' : '')
        + this.compile(node.children) + '\n'
        break
      default:
        result += this.compile(node.children)
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
