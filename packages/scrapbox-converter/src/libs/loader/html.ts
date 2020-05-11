import fs from 'fs';
import {parse, toScrapbox, guessTitle} from 'html2sb-compiler';

export default async (path) => {
  const htmlString = fs.readFileSync(path).toString();
  const parsed = parse(htmlString);
  let sb = toScrapbox(parsed[0]);
  sb.title = guessTitle(parsed, sb, (_, foundTitle) => {
    return foundTitle || null;
  });
  return sb;
};
