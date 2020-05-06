/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');
const test = require('tape').test;
const parse = require('../parse');
const toScrapbox = require('../toScrapbox');
const guessTitle = require('../guessTitle');

const updateToken = !!process.env.UPDATE_TOKEN;

function readFixture (file) {
  return fs.readFileSync(path.join(__dirname, 'fixtures', file), 'utf8');
}

test('fixtures', function (t) {
  function testFixture (file) {
    const allPages = parse(readFixture(file + '.html'), {
      evernote: true
    });
    for (let index = 0; index < allPages.length; index++) {
      const pageFile = allPages.length === 1 ? file : (file + '-' + (index + 1));
      const pageTokens = allPages[index];
      let expectedTokens;

      try {
        expectedTokens = JSON.parse(readFixture(pageFile + '.json'));
      } catch (e) {
        t.fail(pageFile + '.json is not well formatted:\n' + (e.stack || e.message || e));
        return;
      }
      const expectedOutput = readFixture(pageFile + '.txt');
      const sb = toScrapbox(pageTokens);
      if (updateToken) fs.writeFileSync(path.join(__dirname, 'fixtures', pageFile + '.json'), JSON.stringify(pageTokens, null, 2));
      if (process.env.SHOW_TOKEN) console.log(JSON.stringify(pageTokens, null, 2));
      if (!process.env.IGNORE_TOKEN_TEST && !updateToken) t.deepEqual(pageTokens, expectedTokens, file + '#tokens');
      sb.title = guessTitle(pageTokens, sb, function (pageTokens, foundTitle, template) {
        const named = 'Untitled';
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
    'list-of-links',
    'header',
    'hr',
    'images',
    'table',
    'table-in-div',
    'complex',
    'links',
    'links-empty',
    'text-styles',
    'list-skipped-inheritance',
    'list-wrong-inheritance',
    'simple-paragraph',
    'entities',
    'complex-paragraph',
    'styled-code'
  ]
    .filter((pageFile) => {
      if (process.env.TEST_ONLY_RUN) {
        return process.env.TEST_ONLY_RUN === pageFile;
      }
      return true;
    })
    .forEach(testFixture);
  t.end();
});
