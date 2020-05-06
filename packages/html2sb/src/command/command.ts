import * as path from 'path';
import * as fs from 'fs';
import {program} from 'commander';
import html2sb from './../main';
const settings = require('../../package.json'); // eslint-disable-line @typescript-eslint/no-var-requires

let stdin = '';

program
  .version(settings.version)
  .description((settings as any).description)
  .usage('\nhtml2sb [file] \n\tcat hoge.html | html2sb')
  .arguments('[file]')
  .action(async (file) => {
    const result = await html2sb(fs.readFileSync(path.resolve(file)));
    console.log(result);
  });

if(process.stdin.isTTY) {
  program.parse(process.argv);
} else {
  process.stdin.on('readable', () => {
    const chunk = process.stdin.read();
    if (chunk !== null) {
      stdin += chunk;
    }
  });
  process.stdin.on('end', async () => {
    console.log(await html2sb(stdin));
  });
}
