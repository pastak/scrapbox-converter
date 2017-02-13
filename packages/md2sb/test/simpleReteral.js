import test from 'ava'
import loadAndAssert from './helpers/loadAndAssert'

// ['blockquote', 'codeblock', 'heading', 'hr', 'list', 'paragraph', 'table']
// 'list' is skiped: ref: https://github.com/wooorm/remark/issues/222
['blockquote', 'codeblock', 'heading', 'hr', 'paragraph', 'table'].forEach((type) => {
  test('convert ' + type, (t) => loadAndAssert(t, type))
})
