import path from 'path'
import fs from 'fs'
import command from 'commander'
import enex2sb from './../main'
import settings from '../../package.json'

let stdin = ''

const parsedResult = (result) => {
  return result.map((note) => {
    const lines = note.body.split('\n')
    return {
      title: note.title,
      lines: lines
    }
  })
}

command
  .version(settings.version)
  .description(settings.description)
  .usage('\n\tenex2sb [file] \n\tcat hoge.enex | enex2sb')
  .arguments('[file]')
  .action(async (file) => {
    if (!process.env.GYAZO_ACCESS_TOKEN) return console.error('You should set env-value GYAZO_ACCESS_TOKEN to your Gyazo access token get from https://gyazo.com/oauth/applications')
    const result = await enex2sb(fs.readFileSync(path.resolve(file)))
    console.log(JSON.stringify({pages: parsedResult(result)}, null, 2))
  })

if(process.stdin.isTTY) {
  command.parse(process.argv)
} else {
  process.stdin.on('readable', () => {
    const chunk = process.stdin.read()
    if (chunk !== null) {
       stdin += chunk
    }
  })
  process.stdin.on('end', async () => {
    if (!process.env.GYAZO_ACCESS_TOKEN) return console.error('You should set env-value GYAZO_ACCESS_TOKEN to your Gyazo access token get from https://gyazo.com/oauth/applications')
    console.log(JSON.stringify({pages: parsedResult(await enex2sb(stdin))}, null, 2))
  })
}
