import fs from 'fs'
import path from 'path'
import test from 'ava'
import md2sb from '../src/main'

const generateReteralTest = async (t, type) => {
  const markdown = fs.readFileSync(path.resolve('test/fixture/md/' + type + '.md'))
  const input = await md2sb(markdown)
  const expect = fs.readFileSync(path.resolve('test/fixture/sb/' + type + '.sb')).toString()
  t.is(input, expect)
}

// ['blockquote', 'codeblock', 'heading', 'hr', 'list', 'paragraph', 'table']
  ['blockquote', 'codeblock', 'heading', 'hr', 'paragraph'].forEach((type) => {
    test('convert ' + type, (t) => generateReteralTest(t, type))
  })
