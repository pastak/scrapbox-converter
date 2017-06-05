'use strict'
var HTMLParser = require('htmlparser2/lib/Parser')
var styleParser = require('style-parser')
var trim = require('lodash.trim')
var md5

function parseSimple (variant, context, node) {
  var children
  if (node.children) {
    children = parseNodes(node.children, {
      options: context.options
    }).children
  }
  var result = {
    type: 'text',
    children: children
  }
  if (variant === 'blockquote') {
    result.blockquote = 1
  } else if (variant) {
    result[variant] = true
  }
  if (!context.children) {
    context.children = []
  }

  // Lists with broken inheritance (an ul inside a ul, instead of a li)
  // should be treated differently: the ul should become a child of the former
  // list entry.
  if (context.type === 'list' && (node.tagName === 'ol' || node.tagName === 'ul')) {
    var pos = context.children.length - 1
    var formerLi
    // There can - and likely will - be spaces, and line breaks between the list
    // nodes so we need to search backwards for the best match
    do {
      formerLi = context.children[pos]
      pos--
    } while ((!formerLi || !formerLi.children) && pos > -1)
    // If there is none, well, let us create one...
    if (!formerLi) {
      formerLi = {
        type: 'text',
        children: []
      }
      context.children.push(formerLi)
    } else if (!formerLi.children) {
      formerLi.children = []
    }
    formerLi.children.push({
      type: 'br'
    })
    formerLi.children.push({
      type: 'list',
      variant: node.tagName,
      children: result.children
    })
  } else {
    context.children.push(result)
  }
  return result
}

function parseHeader (enlarge, context, node) {
  context.children.push({
    type: 'br'
  })
  var simpleNode = parseSimple(null, context, node)
  simpleNode.bold = true
  simpleNode.enlarge = enlarge
}

function traditionalCodeBlock (context, node) {
  context.children.push({
    type: 'code',
    text: trim(firstChildContent(node))
  })
}

function list (variant, context, node) {
  var result = {
    type: 'list',
    variant: variant,
    children: [],
    options: context.options
  }
  node.children.forEach(function (child) {
    parseSimple(null, result, child)
  })
  delete result.options
  context.children.push(result)
}

function ignore (context, node) {
  if (node.children) {
    parseNodes(node.children, context)
  }
}

function parseStyle (context, node) {
  var fontSize = style(node, 'font-size')
  var parsed
  var enlarge = 0
  if (fontSize && (parsed = /^([0-9]+)\s*px\s*$/i.exec(fontSize))) {
    var num = parseInt(parsed[1], 10)
    if (num > 68) {
      enlarge += 1
    }
    if (num > 56) {
      enlarge += 1
    }
    if (num > 42) {
      enlarge += 1
    }
    if (num > 30) {
      enlarge += 1
    }
    if (num > 21) {
      enlarge += 1
    }
  }
  var bold = style(node, 'font-weight') === 'bold'
  var italic = /(^|\s)italic(\s|$)/i.test(style(node, 'font-style'))
  var underline = /(^|\s)underline(\s|$)/i.test(style(node, 'text-decoration')) ||
    (context.options.evernote && style(node, '-evernote-highlight') === 'true')
  var strikeThrough = /(^|\s)line-through(\s|$)/i.test(style(node, 'text-decoration'))
  var addedNode = parseSimple(null, context, node)
  if (enlarge !== 0) {
    addedNode.enlarge = enlarge
    addedNode.bold = true
  }
  if (bold) {
    addedNode.bold = true
  }
  if (underline) {
    addedNode.underline = true
  }
  if (strikeThrough) {
    addedNode.strike = true
  }
  if (italic) {
    addedNode.italic = true
  }
}

function style (node, prop) {
  if (!node.style) {
    if (!node.attribs || !node.attribs.style) {
      return ''
    }
    node.style = styleParser(node.attribs.style)
  }
  return node.style[prop] || ''
}

function firstChildContent (node) {
  if (!node.children) {
    return
  }
  if (node.children.length === 0) {
    return
  }
  return node.children[0].content
}

function singleNode (type, context, node) {
  context.children.push({
    type: type
  })
}

var tags = {
  'img': function (context, node) {
    context.children.push({
      type: 'img',
      src: node.attribs.src
    })
  },
  'a': function (context, node) {
    var childData = parseNodes(node.children, {
      options: context.options
    })
    context.children.push({
      type: 'text',
      href: node.attribs.href,
      children: childData.children
    })
  },
  'note': function (context, node) {
    if (context.options && context.options.evernote) {
      var content
      var pageContext = {
        type: 'page',
        options: context.options,
        children: []
      }
      node.children.forEach(function (child) {
        if (child.tagName === 'title') {
          pageContext.title = firstChildContent(child)
        } else if (child.tagName === 'tag') {
          if (!pageContext.tags) {
            pageContext.tags = []
          }
          pageContext.tags.push(firstChildContent(child))
        } else if (child.tagName === 'content') {
          content = firstChildContent(child)
        } else if (child.tagName === 'resource') {
          if (!md5) {
            // Lazy-load md5 because it is not necessarily required
            md5 = require('nano-md5')
          }
          var resource = {}
          child.children.forEach(function (resourceChild) {
            if (resourceChild.tagName === 'data') {
              resource.encoded = firstChildContent(resourceChild)
            } else if (resourceChild.tagName === 'mime') {
              resource.mime = firstChildContent(resourceChild)
            }
          })
          if (/^image\/(png|jpeg|gif)$/.test(resource.mime)) {
            var raw = Buffer.from(resource.encoded, 'base64')
            var hash = md5.fromBytes(raw.toString('latin1')).toHex()
            if (!pageContext.resources) {
              pageContext.resources = {}
            }
            pageContext.resources[hash] = {
              type: 'img',
              mime: resource.mime,
              data: resource.encoded
            }
          }
        }
      })
      if (content) {
        var contentNodes = parseHTML(content)
        if (pageContext.tags) {
          pageContext.tags = pageContext.tags.sort()
        }
        parseNode(pageContext, {
          children: contentNodes
        })
        delete pageContext.options
        context.children.push(pageContext)
      }
    }
  },
  'en-media': function (context, node) {
    if (node.attribs && context.options.evernote) {
      context.children.push({
        type: 'reference',
        hash: node.attribs.hash
      })
    }
  },
  'br': singleNode.bind(null, 'br'),
  'td': function (context, node) {
    var simple = parseSimple(null, context, node)
    simple.type = 'td'
  },
  'tbody': ignore,
  'tr': function (context, node) {
    var result = {
      type: 'tr',
      children: [],
      options: context.options
    }
    if (node.children) {
      parseNodes(node.children.filter(function (node) {
        return node.tagName === 'td'
      }), result)
    }
    delete result.options
    context.children.push(result)
  },
  'table': function (context, node) {
    var result = {
      type: 'table',
      children: [],
      options: context.options
    }
    if (node.children) {
      parseNodes(node.children, result)
    }
    delete result.options
    context.children.push(result)
  },
  'span': parseStyle,
  'font': parseStyle,
  'code': traditionalCodeBlock,
  'pre': traditionalCodeBlock,
  'h1': parseHeader.bind(null, 5),
  'h2': parseHeader.bind(null, 4),
  'h3': parseHeader.bind(null, 3),
  'h4': parseHeader.bind(null, 2),
  'h5': parseHeader.bind(null, 1),
  'ol': list.bind(null, 'ol'),
  'ul': list.bind(null, 'ul'),
  'div': function (context, node) {
    // <en-todo> are inline tags which are super weird.
    // This way .checkNode will be filled somehow.
    if (
      context.options.evernote &&
      node.children &&
      node.children.length >= 1 &&
      node.children[0].tagName === 'en-todo'
    ) {
      // Remove the check node
      var checkNode = node.children.shift()
      var result = {
        type: 'check',
        checked: checkNode.attribs && /^true$/i.test(checkNode.attribs.checked),
        children: [],
        options: context.options
      }
      parseSimple(null, result, checkNode)
      delete result.options
      context.checkNode = result
      return
    }

    // The fontfamily, namely the Monaco or Consolas font indicates
    // that we are in a code block
    if (
      context.options.evernote &&
      node.children &&
      style(node, '-en-codeblock') === 'true'
    ) {
      var data = []
      node.children.forEach(function (child) {
        if (
          child.tagName === 'div' &&
          child.children.length === 1 &&
          child.children[0].type === 'Text'
        ) {
          data.push(firstChildContent(child))
        }
      })
      context.children.push({
        type: 'code',
        text: data.join('\n')
      })
      return
    }

    if (node.children) {
      var newNode = parseNodes(node.children, {
        options: context.options
      })
      if (newNode.children && newNode.children.length > 0) {
        context.children.push({
          type: 'div',
          children: newNode.children
        })
      }
    }
  },
  'hr': singleNode.bind(null, 'hr'),
  'blockquote': parseSimple.bind(null, 'blockquote'),
  'b': parseSimple.bind(null, 'bold'),
  'strong': parseSimple.bind(null, 'bold'),
  'i': parseSimple.bind(null, 'italic'),
  'em': parseSimple.bind(null, 'italic'),
  'u': parseSimple.bind(null, 'underline'),
  's': parseSimple.bind(null, 'strike')
}

function parseNodes (nodes, context) {
  if (!context.children) {
    context.children = []
  }
  var checklist = null
  var applyChecklist = function (index) {
    if (checklist) {
      context.children.splice(checklist.index, 0, {
        type: 'list',
        variant: 'ul',
        children: checklist.entries
      })
      checklist = null
    }
  }
  nodes.forEach(function (node) {
    if (node.type === 'Text' && node.content === '\n') {
      return
    }
    parseNode(context, node)
    if (context.checkNode) {
      if (!checklist) {
        checklist = {
          index: context.children.length,
          entries: []
        }
      }
      checklist.entries.push(context.checkNode)
      delete context.checkNode
    } else if (node.tagName === 'br' || node.tagName === 'div') {
      applyChecklist(node)
    }
  })
  applyChecklist()
  return context
}

function parseNode (context, node) {
  if (!node.tagName) {
    if (node.type === 'Text') {
      context.children.push({
        type: 'text',
        text: node.content
      })
    }
  }
  var parser = tags[node.tagName]
  if (parser) {
    parser(context, node)
  } else if (node.type === 'Text') {
    parseSimple(null, context, node)
  } else {
    ignore(context, node)
  }
}

function reduceSameProperties (parent) {
  if (parent.children.length === 0) {
    return parent
  }
  var groupParent
  ['bold', 'underline', 'strike', 'italic', 'href'].forEach(function (prop) {
    var value = parent.children[0][prop]
    for (var i = 1; i < parent.children.length; i++) {
      if (parent.children[i][prop] !== value) {
        return
      }
    }
    parent.children.forEach(function (token) {
      delete token[prop]
    })
    if (value !== undefined) {
      if (!groupParent) {
        if (parent.type !== 'text') {
          groupParent = {
            type: 'text',
            children: parent.children
          }
          parent.children = [groupParent]
        } else {
          groupParent = parent
        }
      }
      groupParent[prop] = value
    }
  })
  return parent
}

function reduceSimpleNodes (parent) {
  parent.children = parent.children.filter(function (token) {
    if (token.type !== 'text') {
      return true
    }
    if (token.children) {
      return true
    }
    if (token.text === undefined || token.text === null) {
      return false
    }
    if (/^\s+$/i.test(token.text)) {
      return false
    }
    token.text = trim(token.text)
    return true
  })
  var allText = true
  parent.children.forEach(function (token) {
    if (token.children) {
      token = reduceSimpleNodes(token)
    }
    if (token.type !== 'text') {
      allText = false
    }
    if (
      token.type === 'text' &&
      token.children &&
      token.children.length === 1 &&
      (
        token.children[0].type === 'text' ||
        token.children[0].type === 'img'
      )
    ) {
      var targetToken = token.children[0]
      if (token.href && targetToken.href) {
        return
      }
      token.type = targetToken.type
      if (targetToken.src) {
        token.src = targetToken.src
      }
      if (targetToken.href) {
        token.href = targetToken.href
      }
      if (targetToken.bold || token.bold) {
        token.bold = true
      }
      if (targetToken.italic || token.italic) {
        token.italic = true
      }
      if (targetToken.strike || token.strike) {
        token.strike = true
      }
      if (targetToken.underline || token.underline) {
        token.underline = true
      }
      if (targetToken.enlarge) {
        token.bold = true
        token.enlarge = (token.enlarge || 0) + targetToken.enlarge
      }
      if (targetToken.blockquote) {
        token.blockquote = (token.blockquote || 0) + targetToken.blockquote
      }
      if (targetToken.children) {
        token.children = targetToken.children
      } else {
        delete token.children
      }
      if (targetToken.text) {
        token.text = targetToken.text
      } else {
        delete token.text
      }
    }
  })
  if (allText && parent.children.length > 1) {
    parent = reduceSameProperties(parent)
  }
  parent.children = parent.children.filter(function (token) {
    if (!token.children && token.hasOwnProperty('children')) {
      delete token.children
    }
    return !token.children || token.children.length !== 0 || parent.type === 'tr'
  })
  return parent
}

function parseHTML (input) {
  var current = {}
  var stack = []
  var root = current
  var parser = new HTMLParser({
    onopentag: function (name, attribs) {
      stack.push(current)
      var next = {
        tagName: name
      }
      if (Object.keys(attribs).length > 0) {
        next.attribs = attribs
      }
      if (!current.children) {
        current.children = []
      }
      current.children.push(next)
      current = next
    },
    ontext: function (text) {
      if (!current.children) {
        current.children = []
      }
      current.children.push({
        type: 'Text',
        content: text
      })
    },
    onclosetag: function (tagName) {
      if (current.tagName === tagName) {
        current = stack.pop()
        return
      }
      for (var i = stack.length - 1; i >= 0; i--) {
        if (stack[i].tagName === tagName) {
          while (stack.length > i) {
            current = stack.pop()
          }
          return
        }
      }
      // ignore tags that are ever opened
    }
  }, {
    recognizeCDATA: true,
    decodeEntities: true
  })
  parser.write(String(input))
  parser.end()
  return root.children || []
}

module.exports = function (input, options) {
  var htmlNodes = parseHTML(input)
  var parseResult = parseNodes(htmlNodes, {
    title: null,
    options: options || {},
    children: []
  })
  delete parseResult.options
  parseResult = reduceSimpleNodes(parseResult)
  if (parseResult.children.length === 0) {
    return []
  }
  var allPages = true
  if (parseResult.type === 'page') {
    allPages = false
  } else {
    for (var i = 0; i < parseResult.children.length; i++) {
      if (parseResult.children[i].type !== 'page') {
        allPages = false
        break
      }
    }
  }
  if (!allPages) {
    return [parseResult]
  }
  return parseResult.children
}
