import fs from 'fs';
import path from 'path';
import test from 'ava';
import enex2sb from '../src/main';
const uploadImage = () => new Promise((ok) => {
  ok({data: {permalink_url: 'https://gyazo.com/abcdef0123456789abcdef0123456789'}});
});

test('convet multiple note in one enex', async (t) => {
  t.plan(4);
  const input = await enex2sb(uploadImage, fs.readFileSync(path.resolve('test/fixtures/multiple.enex')));
  t.is(input.length, 3);
  input.forEach((note, index) => {
    t.is(note.title, 'ノート' + (index + 1));
  });
});
