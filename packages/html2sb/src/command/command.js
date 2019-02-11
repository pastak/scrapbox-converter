import path from 'path';
import fs from 'fs';
import command from 'commander';
import html2sb from './../main';
import settings from '../../package.json';

let stdin = '';

command
  .version(settings.version)
  .description(settings.description)
  .usage('\nhtml2sb [file] \n\tcat hoge.html | html2sb')
  .arguments('[file]')
  .action(async (file) => {
    const result = await html2sb(fs.readFileSync(path.resolve(file)));
    console.log(result);
  });

if(process.stdin.isTTY) {
  command.parse(process.argv);
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
