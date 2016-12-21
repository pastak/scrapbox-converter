import fs from 'fs'
import path from 'path'
import test from 'ava'
import html2sb from '../src/main'

test ('convert html exported by evernote', async (t) => {
  const expected = fs.readFileSync(path.resolve('test/fixtures/scrapbox/evernote/test.txt')).toString()
  const input = await html2sb(fs.readFileSync(path.resolve('test/fixtures/html/evernote/test.html')))
  t.is(expected, input)
})
