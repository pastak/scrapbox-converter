import fs from 'fs';
import md2sb from 'md2sb';

export default async (path: string): Promise<string> => {
  return await md2sb(fs.readFileSync(path));
};
