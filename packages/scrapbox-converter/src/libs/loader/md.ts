import fs from 'fs';
import md2sb from 'md2sb';

export default async (path) => {
  return await md2sb(fs.readFileSync(path));
};
