import test from 'ava'
import loadAndAssert from './helpers/loadAndAssert'

['link-includes-image', 'list-strong-style-text'].forEach((type) => {
  test('convert ' + type, (t) => loadAndAssert(t, type))
})
