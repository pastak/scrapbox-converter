import fs from "node:fs";
import path from "node:path";
import { expect, test } from "vitest";
import { guessTitle, parse, toScrapbox } from "../src";

const updateToken = !!process.env.UPDATE_TOKEN;

function readFixture(file) {
  return fs.readFileSync(path.join(__dirname, "fixtures", file), "utf8");
}

function testFixture(file) {
  const allPages = parse(readFixture(file + ".html"), {
    evernote: true,
  });
  if (!allPages?.length) return;
  for (let index = 0; index < allPages.length; index++) {
    const pageFile = allPages.length === 1 ? file : file + "-" + (index + 1);
    const pageTokens = allPages[index];
    let expectedTokens;

    try {
      expectedTokens = JSON.parse(readFixture(pageFile + ".json"));
    } catch (e) {
      throw new Error(
        pageFile +
          ".json is not well formatted:\n" +
          (e.stack || e.message || e),
      );
    }
    const expectedOutput = readFixture(pageFile + ".txt");
    const sb = toScrapbox(pageTokens);
    if (updateToken)
      fs.writeFileSync(
        path.join(__dirname, "fixtures", pageFile + ".json"),
        JSON.stringify(pageTokens, null, 2),
      );
    if (process.env.SHOW_TOKEN)
      console.log(JSON.stringify(pageTokens, null, 2));
    if (!process.env.IGNORE_TOKEN_TEST && !updateToken)
      expect(pageTokens, file + "#tokens").toEqual(expectedTokens);
    sb.title = guessTitle(
      pageTokens,
      sb,
      (_pageTokens, foundTitle, template) => {
        const named = "Untitled";
        return foundTitle || template(named) || named;
      },
    );
    expect(
      (sb.title ? sb.title + "\n" : "") + sb.lines.join("\n") + "\n",
      file + "#output",
    ).toBe(expectedOutput);
  }
}

[
  "formatting",
  "evernote",
  "evernote-multipage",
  "blocks",
  "code",
  "list",
  "list-in-list",
  "list-of-links",
  "header",
  "hr",
  "images",
  "table",
  "table-in-div",
  "complex",
  "links",
  "links-empty",
  "text-styles",
  "list-skipped-inheritance",
  "list-wrong-inheritance",
  "simple-paragraph",
  "entities",
  "complex-paragraph",
  "styled-code",
  "styled-code",
  "invalid-list-in-list",
  "invalid-text-in-table",
]
  .filter((pageFile) => {
    if (process.env.TEST_ONLY_RUN) {
      return process.env.TEST_ONLY_RUN === pageFile;
    }
    return true;
  })
  .forEach((type) => {
    test("convert " + type, () => testFixture(type));
  });
