const find = (name, node) => {
  let result = null;
  let target = node.children;
  if (!target) {
    if (Array.isArray(node)) {
      target = node;
    } else {
      target = [];
    }
  }
  target.forEach((child) => {
    if (result) return;
    if (child.name === name) return result = child;
    if (child.children) result = find(name, child);
  });
  return result;
};

const findAll = (name, node) => {
  let result = [];
  let target = node && node.children;
  if (!target) {
    if (Array.isArray(node)) {
      target = node;
    } else {
      target = [];
    }
  }
  target.forEach((child) => {
    if (child.name === name) result.push(child);
    if (child.children) result.concat(findAll(name, child));
  });
  return result.reverse();
};

export {find, findAll};
