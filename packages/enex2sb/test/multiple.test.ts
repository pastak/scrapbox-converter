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

test("convet multiple note in one enex", async (t) => {
  const input = await enex2sb(
    uploadImage,
    fs.readFileSync(path.resolve("test/fixtures/multiple.enex")),
  );
  expect(input.length).toBe(3);
  input.forEach((note, index) => {
    expect(note.title).toBe("ノート" + (index + 1));
  });
});
