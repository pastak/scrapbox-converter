import htmlparser from 'htmlparser2'
import Compiler from 'html2sb-compiler'

export default async (input) => {
  let htmlString = input
  if (typeof input === 'object') {
    if (input instanceof Buffer) {
      htmlString = input.toString()
    } else if (typeof input !== 'string') {
      throw new Error('It allows string or buffer')
    }
  }
  const compiler = new Compiler(htmlString)
  let {result, metas} = compiler.compile()
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
