export default (nodeList) => nodeList.map((node, index) => {
  if (node.type !== 'listItem') return node
  node.listItemCount = index + 1
  return node
})
