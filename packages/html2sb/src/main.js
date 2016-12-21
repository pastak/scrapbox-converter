import htmlparser from 'htmlparser2'
import Compiler from './libs/compiler'

export default async (input) => {
  let htmlString = input
  if (typeof input === 'object') {
    if (input instanceof Buffer) {
      htmlString = input.toString()
    } else if (typeof input !== 'string') {
      throw new Error('It allows string or buffer')
    }
  }
  const handler = new htmlparser.DomHandler()
  const parser = new htmlparser.Parser(handler)
  parser.parseComplete(htmlString)
  const parsedData = handler.dom
  const compiler = new Compiler()
  let {result, metas} = compiler.compile(parsedData)
  if (metas.title) {
    result = metas.title + '\n' + result
  }
  if (metas.keywords) {
    result += '\n' + metas.keywords.split(',').map((_) => '#' + _.trim()).join(' ')
  }
  if (result.charAt(result.length - 1) !== '\n') {
    result += '\n'
  }
  return result
}
