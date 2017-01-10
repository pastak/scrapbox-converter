import fs from 'fs'
import Compiler from 'html2sb-compiler'

export default async (path) => {
  const htmlString = fs.readFileSync(path).toString()
  const compiler = new Compiler(htmlString)
  let {result, metas} = compiler.compile()
  if (metas.keywords) {
    result += '\n' + metas.keywords.split(',').map((_) => '#' + _.trim()).join(' ')
  }
  if (result.charAt(result.length - 1) !== '\n') {
    result += '\n'
  }
  return {title: metas.title, body: result}
}
