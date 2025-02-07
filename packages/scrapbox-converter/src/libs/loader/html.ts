import * as fs from "fs";
import { guessTitle, parse, toScrapbox } from "html2sb-compiler";

export default async (path) => {
  const htmlString = fs.readFileSync(path).toString();
  const parsed = parse(htmlString);
  const sb = toScrapbox(parsed[0]);
  sb.title = guessTitle(parsed, sb, (_, foundTitle) => {
    return foundTitle || null;
  });
  return sb;
};
