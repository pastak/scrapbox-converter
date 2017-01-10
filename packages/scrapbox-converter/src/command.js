import command from 'commander'
import settings from '../package.json'
import findAndLoadFiles from './libs/findAndLoadFiles'

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
  .usage('scrapbox-converter <...files>')
  .arguments('<files...>')
  .action(async (files) => {
    const pages = finalize(await findAndLoadFiles(files))
    const json = {pages}
    console.log(JSON.stringify(json))
  })
  .parse(process.argv)
