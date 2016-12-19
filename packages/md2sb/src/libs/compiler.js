import toHAST from 'mdast-util-to-hast'
import deepcopy from 'deepcopy'
import generateCodeBlock from './generateCodeBlock'
import addListItemCount from './addListItemCount'

export default class {
  compile (ast, _context = {}) {
    let result =  [...(ast.children || ast)].map((node) => this.node2SbText(
      node,
      deepcopy(Object.assign(_context, {parents: (_context.parents || []).slice(0)}))
    )).join('\n')
    if (ast.type && ast.type === 'root' && result.charAt(result.length - 1) !== '\n') {
      result += '\n'
    }
    return result
  }

  node2SbText (node, context) {
    let result = ''
    switch (node.type) {
      case 'thematicBreak':
        result += '[/icons/hr.icon]'
        break
      case 'emphasis':
        result += `[\\ ${this.compile(node.children, context)}]`
        break
      case 'delete':
        result += `[- ${this.compile(node.children, context)}]`
        break
      case 'strong':
        result += `[* ${this.compile(node.children, context)}]`
        break
      case 'heading':
        result += `[[${this.compile(node.children, context)}]]`
        break
      case 'Strong':
        result += `[[${this.compile(node.children, context)}]]`
        break
      case 'blockquote':
        result += '> ' + this.compile(node.children, context).split('\n').join('\n> ' + result)
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
        context.parents.push(tagName)
        result += this.compile(tagName === 'ol' ? addListItemCount(node.children) : node.children, context)
        break
      case 'listItem':
        result += ' '.repeat(context.parents.filter((i) => i === 'ol' || i === 'ul').length)
          + (context.parents[context.parents.length - 1] === 'ol' ? node.listItemCount + '. ' : '')
          + this.compile(node.children, context)
        break
      case 'paragraph':
        result += this.compile(node.children, context)
        break
      case 'text':
        let textValue = node.value
        if (context.parents.includes('tableCell')) textValue = node.value.replace(/(\s|\t)+$/, '')
        result += textValue
        break
    }
    if (context.parents.includes('BlockQuote')) {
      result = '> '.repeat(context.parents.filter((i) => i === 'BlockQuote').length - 1) + result
    }
    context.parents.push(node.type)
    return result
  }
}
