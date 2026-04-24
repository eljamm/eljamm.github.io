import { createHighlighter as shikiCreateHighlighter, type BundledHighlighterOptions, type Highlighter } from "shiki"
import { QuartzTransformerPlugin } from "../types"
import rehypePrettyCode, { Options as CodeOptions, Theme as CodeTheme } from "rehype-pretty-code"
import { expectGrammar } from "./expect-grammar"

interface Theme extends Record<string, CodeTheme> {
  light: CodeTheme
  dark: CodeTheme
}

interface Options {
  theme?: Theme
  keepBackground?: boolean
}

const defaultOptions: Options = {
  theme: {
    light: "github-light",
    dark: "github-dark",
  },
  keepBackground: false,
}

async function createHighlighter(options: BundledHighlighterOptions<any, any>): Promise<Highlighter> {
  return shikiCreateHighlighter({
    ...options,
    langs: [...options.langs, expectGrammar],
  })
}

export const SyntaxHighlighting: QuartzTransformerPlugin<Partial<Options>> = (userOpts) => {
  const opts: CodeOptions = {
    ...defaultOptions,
    ...userOpts,
    getHighlighter: createHighlighter,
  }

  return {
    name: "SyntaxHighlighting",
    htmlPlugins() {
      return [[rehypePrettyCode, opts]]
    },
  }
}