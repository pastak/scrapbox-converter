import test from 'ava'
import loadAndAssert from './helpers/loadAndAssert'

['strong', 'italic', 'strike'].forEach((type) => {
  test('convert ' + type, (t) => loadAndAssert(t, type))
})
