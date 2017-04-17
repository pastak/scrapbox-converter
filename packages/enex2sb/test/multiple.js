import fs from 'fs'
import path from 'path'
import test from 'ava'
import proxyquire from 'proxyquire'
const enex2sb = proxyquire.noCallThru().load('../src/main', {
  './libs/uploadImage': (filepath) => new Promise((ok) => {
    ok({data: {permalink_url: 'https://gyazo.com/abcdef0123456789abcdef0123456789'}})
  })
}).default

test('convet multiple note in one enex', async (t) => {
  t.plan(4)
  const input = await enex2sb(fs.readFileSync(path.resolve('test/fixtures/multiple.enex')))
  t.is(input.length, 3)
  input.forEach((note, index) => {
    t.is(note.title, 'ノート' + (index + 1))
  })
})
