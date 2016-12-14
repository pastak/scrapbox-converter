import fs from 'fs'
import path from 'path'
import test from 'ava'
import Md2sb from '../src/main'

test('convert heading', async (t) => {
  const md2sb = new Md2sb()
  const markdown = fs.readFileSync(path.resolve('test/fixture/md/heading.md'))
  const input = md2sb.convert(markdown)
  const expect = fs.readFileSync(path.resolve('test/fixture/sb/heading.sb')).toString()
  t.is(input, expect)
})
