import generateCodeBlock from "./generateCodeBlock";
import addListItemCount from "./addListItemCount";
import { Parent } from "unist";

type Context = {
  parents: string[];
  listItemCount?: number;
  listDepth?: number;
};

class Compiler {
  lastElmEndLine: number;
  decorate: string[];

  constructor() {
    this.lastElmEndLine = 1;
    this.decorate = [];
  }

  isDecorateElement(node): boolean {
    return ["emphasis", "delete", "strong", "heading"].includes(
      typeof node === "string" ? node : node.type
    );
  }

  compile(
    ast,
    _context: Omit<Context, "parents"> & { parents: string[] | undefined } = {
      parents: undefined,
    }
  ): string {
    let result = [...(ast.children || ast)]
      .map((node) =>
        this.node2SbText(node, {
          ..._context,
          parents: (_context.parents ?? []).slice(0),
        })
      )
      .join("");
    if (
      ast.type &&
      ast.type === "root" &&
      result.charAt(result.length - 1) !== "\n"
    ) {
      result += "\n";
    }
    return result;
  }

  node2SbText(node: Parent, context: Context): string {
    let result = "";
    if (context.parents.length === 0 && node.type !== "heading") {
      result += "\n".repeat(node.position.start.line - this.lastElmEndLine);
      this.lastElmEndLine = node.position.end.line;
    } else if (node.type === "listItem") {
      const lineBreak = Math.max(
        node.position.start.line - this.lastElmEndLine - 1,
        0
      );
      result += "\n".repeat(lineBreak);
      this.lastElmEndLine = node.position.end.line;
    }
    context.parents.push(node.type);
    switch (node.type) {
      case "thematicBreak":
        result += "[/icons/hr.icon]";
        break;
      case "emphasis":
        this.decorate.push("/");
        result += this.compile(node.children, context);
        break;
      case "delete":
        this.decorate.push("-");
        result += this.compile(node.children, context);
        break;
      case "strong":
        this.decorate.push("*");
        result += this.compile(node.children, context);
        break;
      case "heading":
        // @ts-expect-error
        this.decorate.push("*".repeat(Math.max(1, 5 - (node.depth as number))));
        result += this.compile(node.children, context);
        break;
      case "link":
        if (
          (node.children as Parent[]).filter((_) => _.type === "image").length
        ) {
          result += (node.children as Parent[])
            .map((n) => {
              // @ts-expect-error
              if (n.type === "image") return `[${n.url} ${node.url}]`;
              // @ts-expect-error
              return `[${this.compile(n, context)} ${node.url}]`;
            })
            .join("");
        } else {
          // @ts-expect-error
          result += `[${this.compile(node.children, context)} ${node.url}]`;
        }
        break;
      case "image":
        // @ts-expect-error
        result += `[${node.url}]`;
        break;
      case "inlineCode":
        // @ts-expect-error
        result += `\`${node.value}\``;
        break;
      case "blockquote":
        {
          const depth = context.parents.filter(
            (p) => p === "blockquote"
          ).length;
          const quoteMark = "> ".repeat(Math.max(depth - 1, 1));
          result +=
            (depth === 1 ? "" : "\n") +
            quoteMark +
            this.compile(node.children, context)
              .split(/\n/)
              .join("\n" + quoteMark);
        }
        break;
      case "code":
        result += generateCodeBlock(node);
        break;
      case "table":
        result += "table:table\n";
        result +=
          " " +
          (node.children as Parent[])
            .map((tableRow) =>
              (tableRow.children as Parent[])
                .map((tableCell) => {
                  context.parents.push("tableCell");
                  return this.compile(tableCell.children, context);
                })
                .join("\t")
            )
            .join("\n ");
        break;
      case "list":
        {
          // @ts-expect-error
          const tagName = node.ordered ? "ol" : "ul";
          context.listItemCount = 0;
          context.parents[context.parents.length - 1] = tagName;
          result += this.compile(
            tagName === "ol" ? addListItemCount(node.children) : node.children,
            context
          );
        }
        break;
      case "listItem": {
        const depth = context.parents.filter(
          (i) => i === "ol" || i === "ul"
        ).length;
        const isChangedDepth = 2 <= depth && (context.listDepth ?? 0) < depth;
        const inner = this.compile(node.children, {
          ...context,
          listDepth: depth,
        });
        result +=
          (isChangedDepth ? "\n" : "") +
          " ".repeat(depth) +
          // @ts-expect-error
          (node.listItemCount ? node.listItemCount + ". " : "") +
          inner +
          (isChangedDepth ? "" : "\n");
        break;
      }
      case "paragraph":
        result += this.compile(node.children, context);
        break;
      case "text":
        {
          // @ts-expect-error
          let textValue = node.value;
          if (context.parents.includes("tableCell"))
            // @ts-expect-error
            textValue = (node.value as string).replace(/(\s|\t)+$/, "");
          // @ts-expect-error
          if (context.parents.includes("listItem")) textValue = node.value;
          result += textValue;
        }
        break;
    }
    if (
      this.isDecorateElement(node) &&
      !context.parents.slice(0, -1).filter((_) => this.isDecorateElement(_))
        .length
    ) {
      result = `[${this.decorate.join("")} ${result}]`;
      if (node.type === "heading") {
        result =
          "\n".repeat(
            Math.max(node.position.start.line - this.lastElmEndLine, 0)
          ) + result;
        this.lastElmEndLine = node.position.end.line;
      }
      this.decorate = [];
    }
    return result;
  }
}

export function compiler(): void {
  const compile = new Compiler();
  this.Compiler = compile.compile.bind(compile);
}
