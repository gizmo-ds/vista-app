enum TokenType {
  Text,
  StartTag,
  EndTag
}

class Token {
  constructor(public tokenType: TokenType, public value: string) {}
}

class Tokenizer {
  parse(text: string): Token[] {
    const tokens: Token[] = []
    let pos = 0

    while (pos < text.length) {
      if (text[pos] === "[") {
        const endTag = text[pos + 1] === "/"
        const tagStart = pos + (endTag ? 2 : 1)
        const tagEnd = text.indexOf("]", tagStart)
        if (tagEnd === -1) break

        const tag = text.substring(tagStart, tagEnd)
        tokens.push(
          new Token(endTag ? TokenType.EndTag : TokenType.StartTag, tag)
        )
        pos = tagEnd + 1
      } else {
        const nextTag = text.indexOf("[", pos)
        const textEnd = nextTag === -1 ? text.length : nextTag
        const textContent = text.substring(pos, textEnd)
        tokens.push(new Token(TokenType.Text, textContent))
        pos = textEnd
      }
    }
    return tokens
  }
}

enum NodeType {
  Text,
  BoldText, // [b]
  ItalicText, // [i]
  UnderlineText, // [u]
  CrossedOutText // [s]
}

class Node {
  constructor(public nodeType: NodeType, public content: string | Node[]) {}

  toString(): string {
    return this.content.toString()
  }
}

class Parser {
  private tokenizer = new Tokenizer()
  constructor(private tags: { [key: string]: NodeType }) {}

  parse(text: string): Node[] {
    const tokens = this.tokenizer.parse(text)
    const stack: Node[][] = [[]]

    tokens.forEach(token => {
      switch (token.tokenType) {
        case TokenType.Text:
          stack[stack.length - 1].push(new Node(NodeType.Text, token.value))
          break
        case TokenType.StartTag:
          if (this.tags[token.value]) stack.push([])
          break
        case TokenType.EndTag:
          if (this.tags[token.value]) {
            const contentNodes = stack.pop()
            if (contentNodes)
              stack[stack.length - 1].push(
                new Node(this.tags[token.value], contentNodes)
              )
          }
          break
      }
    })
    return stack[0]
  }
}

const parser = new Parser({
  b: NodeType.BoldText,
  i: NodeType.ItalicText,
  u: NodeType.UnderlineText,
  s: NodeType.CrossedOutText
})

// convert bbcode to JSX elements, nesting is not supported.
export function bbcode2element(bbcode: string, args: string[]): JSX.Element[] {
  const parsed = parser.parse(bbcode)
  const replace = (str: string) =>
    str.replace(/\$(\d+)/g, (_, i) => args?.[parseInt(i) - 1] ?? "")
  const elements = parsed.map(child => {
    const content =
      typeof child.content === "string"
        ? replace(child.content)
        : child.content.map(b => replace(b.content.toString()))
    switch (child.nodeType) {
      case NodeType.BoldText:
        return <b>{content}</b>
      case NodeType.CrossedOutText:
        return <del>{content}</del>
      case NodeType.UnderlineText:
        return <span class="underline">{content}</span>
      case NodeType.ItalicText:
        return <i>{content}</i>
      default:
        return <span>{content}</span>
    }
  })
  return elements
}
