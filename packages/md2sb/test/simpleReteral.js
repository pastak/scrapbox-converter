import test from 'ava'
import loadAndAssert from './helpers/loadAndAssert'

// ['blockquote', 'codeblock', 'heading', 'hr', 'list', 'paragraph', 'table']
['blockquote', 'codeblock', 'heading', 'hr', 'paragraph', 'table'].forEach((type) => {
  test('convert ' + type, (t) => loadAndAssert(t, type))
})
