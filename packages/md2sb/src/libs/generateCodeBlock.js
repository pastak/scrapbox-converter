export default (node) => {
  let result = 'code:'
  if (node.lang) {
    const t = node.lang.split(':')
    if (t.length === 2) {
      result += t[1] + `(${t[0]})\n`
    } else if (node.lang.indexOf('.') > -1) {
      // ファイル名のみが書かれているとき
      result += node.lang
    } else {
      result += ` (${node.lang})\n`
    }
  } else {
    result += '\n'
  }
  result += ' ' + node.value.split('\n').join('\n ')
  return result
}
