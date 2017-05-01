import Gyazo from 'gyazo-api'
import intoStream from 'into-stream'

const client = new Gyazo(process.env.GYAZO_ACCESS_TOKEN)

export default async (file) => {
  const stream = intoStream(file)
  stream.path = 'evernote-imported-file'
  return await client.upload(stream)
}
