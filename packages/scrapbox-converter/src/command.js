import path from 'path'
import fs from 'fs'
import command from 'commander'
import settings from '../package.json'
import loadMdFile from './loadMdFile'

const findAndLoadMarkdown = async (files, basePath = './') => await Promise.all(
  (Array.isArray(files) ? files : [files])
    .map(async (file) => {
      const fullPath = path.resolve(basePath, file)
      const stats = fs.lstatSync(fullPath)
      const isFile = stats.isFile()
      const isDir = stats.isDirectory()
      if (isFile) {
        const ext = path.extname(fullPath)
        if (!(/\.(?:markdown|md)/.test(ext))) return
        const title = path.basename(fullPath, ext)
        const scrapboxStyleText = await loadMdFile(fullPath)
        let lines = scrapboxStyleText.split('\n')
        lines.unshift(title)
        return {title, lines}
      } else if (isDir) {
        return findAndLoadMarkdown(fs.readdirSync(fullPath), fullPath)
      }
    })
)

const finalize = (pages) => {
  const flatten = (arr) => arr.reduce((a, b) => {
    if (Array.isArray(b)) return a.concat(flatten(b))
    return a.concat(b)
  }, [])
  return flatten(pages).filter((_) => _)
}

command
  .version(settings.version)
  .description(settings.description)
  .usage('import-markdowns-to-scrapbox <...files>')
  .arguments('<...files>')
  .action(async (files) => {
    const pages = finalize(await findAndLoadMarkdown(files))
    const json = {pages}
    console.log(JSON.stringify(json))
  })
  .parse(process.argv)
