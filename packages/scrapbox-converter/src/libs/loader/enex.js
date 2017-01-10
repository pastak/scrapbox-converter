import fs from 'fs'
import enex2sb from 'enex2sb'

export default async (path) => {
  return await enex2sb(fs.readFileSync(path))
}
