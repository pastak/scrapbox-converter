import remark from 'remark'
import toHAST from 'mdast-util-to-hast'
import Compiler from './libs/compiler'

export default async (input) => {
  let mdText = input
  if (typeof input === 'object') {
    if (input instanceof Buffer) {
      mdText = input.toString()
    } else if (typeof input !== 'string') {
      throw new Error('It allows string or buffer')
    }
  }
  return await new Promise((ok, ng) => {
    remark().use((processor, opt) => {
      processor.Compiler = Compiler
    }).process(mdText, (err, file) => {
      if (err) return ng(err)
      return ok(String(file))
    })
  })
}
