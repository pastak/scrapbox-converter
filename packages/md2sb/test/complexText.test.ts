import { test } from "vitest";
import loadAndAssert from "./helpers/loadAndAssert";

["link-includes-image", "list-strong-style-text"].forEach((type) => {
  test("convert " + type, () => loadAndAssert(type));
});
