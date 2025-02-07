import { parse, toScrapbox } from "html2sb-compiler";

export default async (input) => {
  let htmlString = input;
  if (typeof input === "object") {
    if (input instanceof Buffer) {
      htmlString = input.toString();
    } else if (typeof input !== "string") {
      throw new Error("It allows string or buffer");
    }
  }
  const result = toScrapbox(parse(htmlString)[0]);
  return result.lines.join("\n") + "\n";
};
