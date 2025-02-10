import * as fs from "node:fs";
import * as path from "node:path";
import { expect, test } from "vitest";
import enex2sb from "../src/main";
const uploadImage = () =>
  new Promise((ok) => {
    // eslint-disable-next-line @typescript-eslint/camelcase
    ok({
      data: {
        permalink_url: "https://gyazo.com/abcdef0123456789abcdef0123456789",
      },
    });
  });

test("convert example xml", async (t) => {
  const expected = fs
    .readFileSync(path.resolve("test/fixtures/example.sb.txt"))
    .toString();
  const input = await enex2sb(
    uploadImage,
    fs.readFileSync(path.resolve("test/fixtures/example.enex")),
  );
  expect(Array.isArray(input)).toBe(true);
  expect(input[0].lines.concat("")).toEqual(expected.split("\n"));
  expect(input[0].title).toBe("test");
});
