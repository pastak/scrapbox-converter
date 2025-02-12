import * as fs from "node:fs";
import * as path from "node:path";
import { expect, test } from "vitest";
import html2sb from "../src/main";

test("convert html exported by evernote", async (t) => {
  const expected = fs
    .readFileSync(path.resolve("test/fixtures/scrapbox/evernote/test.txt"))
    .toString();
  const input = await html2sb(
    fs.readFileSync(path.resolve("test/fixtures/html/evernote/test.html")),
  );
  expect(input).toEqual(expected);
});
