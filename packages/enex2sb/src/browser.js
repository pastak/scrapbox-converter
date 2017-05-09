require('babel-register')

import main from './main'
import uploadImage from './browser/uploadImage'

export default main.bind(null, uploadImage)
