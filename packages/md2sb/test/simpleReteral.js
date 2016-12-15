import fs from 'fs'
import path from 'path'
import test from 'ava'
import Md2sb from '../src/main'

const generateReteralTest = (t, type) => {
  const md2sb = new Md2sb()
  const markdown = fs.readFileSync(path.resolve('test/fixture/md/' + type + '.md'))
  const input = md2sb.convert(markdown)
  const expect = fs.readFileSync(path.resolve('test/fixture/sb/' + type + '.sb')).toString()
  t.is(input, expect)
}

// ['blockquote', 'codeblock', 'heading', 'hr', 'list', 'paragraph', 'table']
  ['blockquote', 'codeblock', 'heading'].forEach((type) => {
    test('convert ' + type, (t) => generateReteralTest(t, type))
  })
