import { toSimpleText } from "./toScrapbox";
const CONTINUE = false;
const ABORT = true;

function iterateTokenRaw(iterator, level, token) {
  if (iterator(token, level) === ABORT) {
    return ABORT;
  }
  if (token.children) {
    return token.children.map((child) =>
      iterateTokenRaw.bind(null, iterator, level + 1, child),
    );
  }
  return CONTINUE;
}

function iterateToken(iterator, token) {
  let nextTasks = iterateTokenRaw(iterator, 0, token);
  if (nextTasks === ABORT) {
    return;
  }
  while (nextTasks && nextTasks.length > 0) {
    const taskToExecute = nextTasks.shift();
    const moreTasks = taskToExecute();
    if (moreTasks === ABORT) {
      return;
    }
    if (moreTasks) {
      nextTasks = nextTasks.concat(moreTasks);
    }
  }
}

function defaultTemplate(userTitle) {
  return String(userTitle);
}

function getTemplate(parent) {
  let bestEnlarged;
  let firstEntry;
  let onlyEntry = true;
  let base;
  while (
    (parent.type === "div" || parent.type === undefined) &&
    parent.children &&
    parent.children.length === 1
  ) {
    parent = parent.children[0];
  }
  iterateToken((token, level) => {
    if (level === 1 && onlyEntry) {
      base = firstEntry;
    }
    if (firstEntry === undefined) {
      firstEntry = token;
    } else {
      onlyEntry = false;
    }
    if (token.type === "text" && token.enlarge > 2) {
      if (!bestEnlarged || token.enlarge > bestEnlarged.enlarge) {
        bestEnlarged = token;
      }
    }
    return CONTINUE;
  }, parent);
  if (base) {
    if (base.type === "table") {
      return function tableTitle(userTitle) {
        return "Table (" + userTitle + ")";
      };
    }
    if (base.type === "list") {
      return function listTitle(userTitle) {
        if (base.children.length > 0 && base.children[0].children) {
          userTitle =
            base.children
              .map((token) => {
                const max = 15;
                let text = toSimpleText(token).replace(/[\t\n]/gi, "");
                if (text.length > max) {
                  text = text.substr(0, max - 3) + "...";
                }
                return text;
              })
              .join(", ") || "?";
        }
        return "List (" + userTitle + ")";
      };
    }
  }
  if (bestEnlarged) {
    return function enlargedTitle(userTitle) {
      return String(bestEnlarged.text || userTitle);
    };
  }
  return defaultTemplate;
}

export const guessTitle = (parsed, sb, evaluateTitle) => {
  if (typeof evaluateTitle === "function") {
    return evaluateTitle(parsed, sb.title, (userTitle) => {
      const template = getTemplate(parsed);
      return template(userTitle);
    });
  }
  return sb.title || getTemplate(parsed)("");
};
