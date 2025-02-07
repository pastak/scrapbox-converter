import { test } from 'vitest'
import loadAndAssert from "./helpers/loadAndAssert";

[
  "strong",
  "italic",
  "strong-italic",
  "strike",
  "link",
  "image",
  "code",
].forEach((type) => {
  test("convert " + type, () => loadAndAssert(type));
});
