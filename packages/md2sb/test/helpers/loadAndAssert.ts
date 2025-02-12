import fs from "node:fs";
import path from "node:path";
import { expect } from "vitest";
import md2sb from "../../src/main";

export default async (type) => {
  const markdown = fs.readFileSync(
    path.resolve("test/fixtures/md/" + type + ".md"),
  );
  const input = await md2sb(markdown);
  const expected = fs
    .readFileSync(path.resolve("test/fixtures/scrapbox/" + type + ".txt"))
    .toString();
  expect(input).toEqual(expected);
};
