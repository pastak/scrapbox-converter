const fs = require('fs');
const path = require('path');
const test = require('tape').test;
const parse = require('../parse');
const toScrapbox = require('../toScrapbox');
const guessTitle = require('../guessTitle');

function readFixture (file) {
  return fs.readFileSync(path.join(__dirname, 'fixtures', file), 'utf8');
}

test('fixtures', function (t) {
  function testFixture (file) {
    const allPages = parse(readFixture(file + '.html'), {
      evernote: true
    });
    for (var index = 0; index < allPages.length; index++) {
      var pageFile = allPages.length === 1 ? file : (file + '-' + (index + 1));
      var pageTokens = allPages[index];
      var expectedTokens;

      if (process.env.TEST_ONLY_RUN) {
        if (process.env.TEST_ONLY_RUN !== pageFile) continue;
      }

      try {
        expectedTokens = JSON.parse(readFixture(pageFile + '.json'));
      } catch (e) {
        t.fail(pageFile + '.json is not well formatted:\n' + (e.stack || e.message || e));
        return;
      }
      const expectedOutput = readFixture(pageFile + '.txt');
      const sb = toScrapbox(pageTokens);
      if (process.env.SHOW_TOKEN) console.log(JSON.stringify(pageTokens, null, 2));
      if (!process.env.IGNORE_TOKEN_TEST) t.deepEqual(pageTokens, expectedTokens, file + '#tokens');
      sb.title = guessTitle(pageTokens, sb, function (pageTokens, foundTitle, template) {
        var named = 'Untitled';
        return foundTitle || template(named) || named;
      });
      t.equal((sb.title ? sb.title + '\n' : '') + sb.lines.join('\n') + '\n', expectedOutput, file + '#output');
    }
  }

  [
    'formatting',
    'evernote',
    'evernote-multipage',
    'blocks',
    'code',
    'list',
    'list-in-list',
    'header',
    'hr',
    'table',
    'table-in-div',
    'complex',
    'links',
    'text-styles',
    'list-skipped-inheritance',
    'list-wrong-inheritance',
    'simple-paragraph',
    'entities'
  ].forEach(testFixture);
  t.end();
});
