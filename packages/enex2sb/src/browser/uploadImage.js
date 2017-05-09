import upload from 'gyazo-browser-upload'

export default async (buffer, options) => {
  // We could implement the proper data type but that would be wasted effort
  // because gyazo looks at the buffer content only, anyways
  var res = await upload('data:image/*;base64,' + buffer.toString('base64'), options)
  return {
    data: {
      permalink_url: res.url
    }
  }
}
