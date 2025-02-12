import { test } from "vitest";
import loadAndAssert from "./helpers/loadAndAssert";

[
  "blockquote",
  "codeblock",
  "heading",
  "hr",
  "list",
  "paragraph",
  "table",
].forEach((type) => {
  test("convert " + type, () => loadAndAssert(type));
});
