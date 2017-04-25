import md5 from 'nano-md5'
import htmlparser from 'htmlparser2'
import Html2SbCompiler from 'html2sb-compiler'
import intoStream from 'into-stream'
import {find, findAll} from './libs/utils'
import uploadImage from './libs/uploadImage'

export default async (input) => {
  let xmlString = input
  if (typeof input === 'object') {
    if (input instanceof Buffer) {
      xmlString = input.toString()
    } else if (typeof input !== 'string') {
      throw new Error('It allows string or buffer')
    }
  }
  const handler = new htmlparser.DomHandler()
  const parser = new htmlparser.Parser(handler)
  parser.parseComplete(xmlString)
  const parsedData = handler.dom
  const notes = findAll('note', find('en-export', parsedData)).reverse()
  return await Promise.all(notes.map(async (note) => {
    const title = find('title', note).children[0].data
    const content = find('content', note)

    const ENNoteData = content.children[0].data
    const ENNoteXML = ENNoteData.match(/\[CDATA\[([.\s\S]+)]]/)[1]

    let resources = {}

    await Promise.all(findAll('resource', note).map(async (resource) => {
      const mimeType = find('mime', resource).children[0].data
      if (/^image\/.*/.test(mimeType)) {
        const file = new Buffer(find('data', resource).children[0].data, 'base64')
        const calculatedMd5 = md5.fromBytes(file.toString('latin1')).toHex()
        const res = await uploadImage(intoStream(file))
        resources[calculatedMd5] = res.data.permalink_url
      }
    }))

    const compiler = new Html2SbCompiler(ENNoteXML)
    compiler.extend('en-media', (node, defaultCompile) => {
      const resourceUrl = resources[node.attribs.hash]
      switch (node.attribs.type) {
        case 'image/gif':
        case 'image/jpeg':
        case 'image/png':
          return `[${resourceUrl}]`
          break
        case 'audio/wav':
        case 'audio/mpeg':
        case 'audio/amr':
        case 'application/pdf':
          // Nothing to do
          break
      }
    })
    const {result} = compiler.compile()

    const tags = findAll('tag', note).map((_) => '#' + _.children[0].data)

    const body = title + '\n' + result + '\n\n' + tags.join(' ') + '\n'
    return {body, title}
  }))
}
