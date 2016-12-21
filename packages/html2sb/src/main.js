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
  return compiler.compile(parsedData)
}
