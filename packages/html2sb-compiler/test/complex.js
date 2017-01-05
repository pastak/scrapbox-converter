import fs from 'fs'
import path from 'path'
import test from 'ava'
import html2sb from '../src/main'

test ('convert link includes image', async (t) => {
  const expected = fs.readFileSync(path.resolve('test/fixtures/scrapbox/link-includes-image.txt')).toString()
  const input = await html2sb(fs.readFileSync(path.resolve('test/fixtures/html/link-includes-image.html')))
  t.is(expected, input)
})


test ('convert strong italic', async (t) => {
  const expected = fs.readFileSync(path.resolve('test/fixtures/scrapbox/strong-italic.txt')).toString()
  const input = await html2sb(fs.readFileSync(path.resolve('test/fixtures/html/strong-italic.html')))
  t.is(expected, input)
})
