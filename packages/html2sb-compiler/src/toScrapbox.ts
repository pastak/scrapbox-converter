/* eslint-disable @typescript-eslint/no-use-before-define */
'use strict';
const NO_LINE_BREAK = false;
const SOFT_LINE_BREAK = 2;
const HARD_LINE_BREAK = 3;

function toSimpleText (node) {
  if (node.type === 'list') {
    return '\n' + processList(node);
  }
  if (node.type === 'img') {
    let src = '';
    if (node.src) {
      src = node.src;
      if (!/^https?:\/\/gyazo.com\//.test(src) && !/\.(png|jpe?g|gif|svg|webp)$/.test(src)) {
        src = src + '#.png';
      }
    } else {
      src = 'data:' + node.mime + ';base64,' + node.data;
    }
    if (node.href) {
      return '[' + node.href + ' ' + src + ']';
    }
    return '[' + src + ']';
  }

  let before = '';
  if (node.bold) {
    before += '*';
  }
  if (node.enlarge) {
    before += (new Array(node.enlarge + 1)).join('*');
  }
  if (node.italic) {
    before += '/';
  }
  if (node.strike) {
    before += '-';
  }
  if (node.underline) {
    before += '_';
  }
  let content;
  if (node.children) {
    content = node.children.map(toSimpleText).filter(Boolean).join(' ');
  } else {
    content = node.text || '';
  }
  let check = '';
  if (node.type === 'check') {
    check = (node.checked ? '✅' : '⬜') + ' ';
  }
  let inner;
  if (before !== '') {
    inner = check + '[' + before + ' ' + content + ']';
  } else {
    inner = check + content;
  }

  if (node.href) {
    if (node.href === '___SELF_WIKI_LINK___') {
      inner = inner
        .replace(/^\s+/, '')
        .replace(/\s+$/, '')
        .replace(/\s/g, '_');
      return '[' + inner + ']';
    }
    return '[' + node.href + ' ' + inner + ']';
  }
  return inner;
}

function processList (node, _?: null, __?: null, indent?: string) {
  if (!indent) {
    indent = '';
  }
  indent += '\t';
  const listAsText = node.children
    .map(function (listEntry, nr) {
      let children;
      if (listEntry.children) {
        children = listEntry.children.concat();
      } else {
        children = [listEntry];
      }
      let lastEntry;
      if (children[children.length - 1].type === 'list') {
        lastEntry = children.pop();
      }
      let data = toSimpleText({
        type: listEntry.type,
        src: listEntry.src,
        checked: listEntry.checked,
        children: children
      });
      if (data !== '') {
        const lines = data.split('\n').map(function (line, index) {
          if (index === 0 && node.variant === 'ol') {
            return indent + (nr + 1) + '. ' + line;
          }
          return indent + line;
        }).filter(function (line) {
          return !/^\s*$/.test(line);
        });
        if (lines.length === 0) {
          data = '';
        } else {
          data = lines.join('\n') + '\n';
        }
      }
      if (lastEntry) {
        data = data + processList(lastEntry, null, null, indent) + '\n';
      }
      return data;
    })
    .join('');
  return listAsText.substr(0, listAsText.length - 1);
}

const stringifier = {
  'link': function (node, line) {
    line.push(toSimpleText(node));
    return NO_LINE_BREAK;
  },
  'list': processList,
  'hr': function () {
    return '[/icons/hr.icon]';
  },
  'div': function (node, _, resources) {
    let result = [];
    if (node.children) {
      result = stringifyNodes(node, result, resources, true);
    }
    return result;
  },
  'table': function (node) {
    return 'table:_\n' +
      node.children.map(function (row) {
        return '\t' + row.children.map(function (td) {
          return toSimpleText(td);
        }).join('\t');
      }).join('\n');
  },
  'code': function (node) {
    return 'code:_' +
      node.text.split('\n').map(function (codeLine) {
        return '\n\t' + codeLine.split(' ').join(' ');
      }).join('');
  },
  'img': function (node, line) {
    line.push(toSimpleText(node));
    return NO_LINE_BREAK;
  },
  'br': function (node) {
    return node.force ? HARD_LINE_BREAK : SOFT_LINE_BREAK;
  },
  'text': function (node, line) {
    if (node.blockquote) {
      return new Array(node.blockquote + 1).join('>') + ' ' + toSimpleText(node);
    }
    line.push(toSimpleText(node));
    return NO_LINE_BREAK;
  },
  'reference': function (node, line, resources) {
    if (resources) {
      return stringifyNode(resources[node.hash], line, resources);
    }
  }
};

function stringifyNode (child, line, resources) {
  const nodeStringifier = stringifier[child.type];
  if (!nodeStringifier) {
    console.warn('Unknown stringifier for node type: ' + child.type);
    console.log(child);
    return;
  }
  return nodeStringifier(child, line, resources);
}

function stringifyNodes (tokens, result, resources, nested = false) {
  let line = [];
  tokens.children.forEach(function (child) {
    const block = stringifyNode(child, line, resources);
    const isLineBreak = (block === SOFT_LINE_BREAK || block === HARD_LINE_BREAK);
    if (block === NO_LINE_BREAK) {
      return;
    }
    if (line.length > 0) {
      result.push(line.join(' '));
      if (!isLineBreak) {
        result.push('');
      }
      line = [];
    }
    if (Array.isArray(block)) {
      result = result.concat(block);
    } else if (!isLineBreak) {
      result.push(block);
      result.push('');
    }
    if (child.type === 'div' && !nested) {
      result.push('\n');
    }
  });
  if (line.length > 0) {
    result.push(line.join(' '));
  }
  return result;
}

function toScrapbox (tokens): {
  title: string;
  lines: string[];
} {
  let result: string[] = [];
  result = stringifyNodes(tokens, result, tokens.resources);
  if (tokens.tags) {
    result.push('');
    result.push(tokens.tags.map(function (tag) {
      return '#' + tag;
    }).join(' '));
  }
  let formerWasEmpty = false;
  result = result.filter(function removeMultipleLineBreaks (block) {
    if (block === '') {
      if (formerWasEmpty) {
        return false;
      }
      formerWasEmpty = true;
    } else {
      formerWasEmpty = false;
    }
    return true;
  });
  let last = result.length - 1;
  while ((result[last] === '' || result[last] === null) && last > 0) {
    last -= 1;
  }

  const lines = result.slice(0, last + 1).reduce(function (lines, line) {
    if (line.indexOf('\n') !== -1) {
      if (line === '\n') {
        line = '';
      } else {
        return lines.concat(line.split('\n'));
      }
    }
    lines.push(line);
    return lines;
  }, [] as string[]);

  let lastLineIsBreak = false;
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lastLineIsBreak) {
      lines.pop();
    }
    if (lines[i] !== '') {
      break;
    } else {
      lastLineIsBreak = true;
    }
  }

  return {
    title: tokens.title,
    lines: lines
  };
}

toScrapbox.toSimpleText = toSimpleText;

export {toSimpleText, toScrapbox}
