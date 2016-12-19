import path from 'path'
import fs from 'fs'
import command from 'commander'
import md2sb from './../main'
import settings from '../../package.json'

let stdin = ''

command
  .version(settings.version)
  .description(settings.description)
  .usage('\n\tmd2sb [file] \n\tcat hoge.md | md2sb')
  .arguments('[file]')
  .action(async (file) => {
    const result = await md2sb(fs.readFileSync(path.resolve(file)))
    console.log(result)
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
    console.log(await md2sb(stdin))
  })
}
