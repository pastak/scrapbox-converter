import test from 'ava'
import loadAndAssert from './helpers/loadAndAssert'

['strong', 'italic', 'strong-italic', 'strike', 'link', 'image', 'code'].forEach((type) => {
  test('convert ' + type, (t) => loadAndAssert(t, type))
})
