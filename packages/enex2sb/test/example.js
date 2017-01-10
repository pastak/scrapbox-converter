import fs from 'fs'
import path from 'path'
import test from 'ava'
import proxyquire from 'proxyquire'
const enex2sb = proxyquire.noCallThru().load('../src/main', {
  './libs/uploadImage': (filepath) => new Promise((ok) => {
    ok({data: {permalink_url: 'https://gyazo.com/abcdef0123456789abcdef0123456789'}})
  })
}).default

test ('convert example xml', async (t) => {
  const expected = fs.readFileSync(path.resolve('test/fixtures/example.sb.txt')).toString()
  const input = await enex2sb(fs.readFileSync(path.resolve('test/fixtures/example.enex')))
  t.is(expected, input.body)
  t.is('test', input.title)
})
