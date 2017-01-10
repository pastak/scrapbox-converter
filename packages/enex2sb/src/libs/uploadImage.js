import Gyazo from 'gyazo-api'
const client = new Gyazo(process.env.GYAZO_ACCESS_TOKEN)

export default async (filepath) => {
  return await client.upload(filepath)
}
