import * as path from 'path';
import * as fs from 'fs';
import {program} from 'commander';
import enex2sb from './../node';
const settings = require('../../package.json');

let stdin = '';

program
  .version(settings.version)
  .description((settings as any).description)
  .usage('\n\tenex2sb [file] \n\tcat hoge.enex | enex2sb')
  .arguments('[file]')
  .action(async (file) => {
    if (!process.env.GYAZO_ACCESS_TOKEN) return console.error('You should set env-value GYAZO_ACCESS_TOKEN to your Gyazo access token get from https://gyazo.com/oauth/applications');
    const pages = await enex2sb(fs.readFileSync(path.resolve(file)));
    console.log(JSON.stringify({pages}, null, 2));
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
    if (!process.env.GYAZO_ACCESS_TOKEN) return console.error('You should set env-value GYAZO_ACCESS_TOKEN to your Gyazo access token get from https://gyazo.com/oauth/applications');
    console.log(JSON.stringify({pages: (await enex2sb(stdin))}, null, 2));
  });
}
