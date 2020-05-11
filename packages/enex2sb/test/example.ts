import fs from 'fs';
import path from 'path';
import test from 'ava';
import enex2sb from '../src/main';
const uploadImage = () => new Promise((ok) => {
  ok({data: {permalink_url: 'https://gyazo.com/abcdef0123456789abcdef0123456789'}});
});

test ('convert example xml', async (t) => {
  const expected = fs.readFileSync(path.resolve('test/fixtures/example.sb.txt')).toString();
  const input = await enex2sb(uploadImage, fs.readFileSync(path.resolve('test/fixtures/example.enex')));
  t.truthy(Array.isArray(input));
  t.deepEqual(expected.split('\n'), input[0].lines.concat(''));
  t.is('test', input[0].title);
});
