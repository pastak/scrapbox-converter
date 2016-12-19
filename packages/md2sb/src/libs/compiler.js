import toHAST from 'mdast-util-to-hast'
import deepcopy from 'deepcopy'
import generateCodeBlock from './generateCodeBlock'
import addListItemCount from './addListItemCount'

export default class {
  constructor () {
    this.lastElmEndLine = 1
  }
  compile (ast, _context = {}) {
    let result =  [...(ast.children || ast)].map((node) => this.node2SbText(
      node,
      deepcopy(Object.assign(_context, {parents: (_context.parents || []).slice(0)}))
    )).join('')
    if (ast.type && ast.type === 'root' && result.charAt(result.length - 1) !== '\n') {
      result += '\n'
    }
    return result
  }

  node2SbText (node, context) {
    console.log(node)
    let result = ''
    if (context.parents.length === 0) {
      result += '\n'.repeat(node.position.start.line - this.lastElmEndLine)
      this.lastElmEndLine = node.position.end.line
    } else if (node.type === 'listItem') {
      const lineBreak = Math.max(node.position.start.line - this.lastElmEndLine - 1, 0)
      result += '\n'.repeat(lineBreak)
      this.lastElmEndLine = node.position.end.line
    }
    context.parents.push(node.type)
    switch (node.type) {
      case 'thematicBreak':
        result += '[/icons/hr.icon]'
        break
      case 'emphasis':
        result += `[/ ${this.compile(node.children, context)}]`
        break
      case 'delete':
        result += `[- ${this.compile(node.children, context)}]`
        break
      case 'strong':
        if (node.children.filter((_) => _.type === 'emphasis').length) {
          result += node.children.map((n) => {
            if (n.type === 'emphasis') return `[/ [[${this.compile(n.children, context)}]]]`
            return `[[]]`
          }).join('${this.compile(node.children, context)}')
        } else {
          result += `[[${this.compile(node.children, context)}]]`
        }
        break
      case 'heading':
        result += `[[${this.compile(node.children, context)}]]`
        break
      case 'link':
        if (node.children.filter((_) => _.type === 'image').length) {
          result += node.children.map((n) => {
            if (n.type === 'image') return `[${n.url} ${node.url}]`
            return `[${this.compile(n, context)} ${node.url}]`
          }).join('')
        } else {
          result += `[${this.compile(node.children, context)} ${node.url}]`
        }
        break
      case 'image':
        result += `[${node.url}]`
        break
      case 'inlineCode':
        result += `\`${node.value}\``
        break
      case 'blockquote':
        const depth = context.parents.filter((p) => p === 'blockquote').length
        const quoteMark = '> '.repeat(Math.max(depth - 1, 1))
        result += (depth === 1 ? '' : '\n')
          + quoteMark
          + this.compile(node.children, context).split(/\n/).join('\n' + quoteMark)
        break
      case 'code':
        result += generateCodeBlock(node)
        break
      case 'table':
        result += 'table:table\n'
        result += ' ' + node.children.map((tableRow) => tableRow.children.map(
          (tableCell) => {
            context.parents.push('tableCell')
            return this.compile(tableCell.children, context)
          })
          .join('\t')
        )
        .join('\n ')
        break
      case 'list':
        const tagName = toHAST(node).tagName
        context.listItemCount = 0
        context.parents[context.parents.length -1] = tagName
        result += this.compile(tagName === 'ol' ? addListItemCount(node.children) : node.children, context)
        break
      case 'listItem':
        result += ' '.repeat(context.parents.filter((i) => i === 'ol' || i === 'ul').length)
          + (node.listItemCount ? node.listItemCount + '. ' : '')
          + this.compile(node.children, context)
        break
      case 'paragraph':
        result += this.compile(node.children, context)
        break
      case 'text':
        let textValue = node.value
        if (context.parents.includes('tableCell')) textValue = node.value.replace(/(\s|\t)+$/, '')
        if (context.parents.includes('listItem')) textValue = node.value + '\n'
        result += textValue
        break
    }
    return result
  }
}
