import fs from 'fs'
import path from 'path'
import test from 'ava'
import Compiler from '../src/libs/compiler'

test ('convert link includes image', async (t) => {
  const expected = fs.readFileSync(path.resolve('test/fixtures/scrapbox/link-includes-image.txt')).toString()
  const compiler = new Compiler(fs.readFileSync(path.resolve('test/fixtures/html/link-includes-image.html')))
  const input = await compiler.compile().result
  t.is(expected, input)
})


test ('convert strong italic', async (t) => {
  const expected = fs.readFileSync(path.resolve('test/fixtures/scrapbox/strong-italic.txt')).toString()
  const compiler = new Compiler(fs.readFileSync(path.resolve('test/fixtures/html/strong-italic.html')))
  const input = await compiler.compile().result
  t.is(expected, input)
})
