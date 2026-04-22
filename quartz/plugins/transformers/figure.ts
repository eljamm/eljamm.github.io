import { QuartzTransformerPlugin } from "../types"

export interface Options {
  enable: boolean
}

const defaultOptions: Options = {
  enable: true,
}

const figureShortcodeRegex = /\{\{\s*figure\s*\(([\s\S]*?)\)\s*\}\}/g

function parseShortcodeAttributes(content: string): Record<string, string> {
  const attrs: Record<string, string> = {}
  const regex = /(\w+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g
  let match
  while ((match = regex.exec(content)) !== null) {
    const key = match[1]
    const value = match[2] ?? match[3]
    attrs[key] = value
  }
  return attrs
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function buildFigureHtml(attrs: Record<string, string>): string {
  const { src, alt = "", caption, width, height, link } = attrs

  if (!src) {
    return ""
  }

  let imgTag = `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}"`
  if (width) imgTag += ` width="${escapeHtml(width)}"`
  if (height) imgTag += ` height="${escapeHtml(height)}"`
  imgTag += " />"

  let html = `<figure class="figure-shortcode">`
  if (link) {
    html += `<a href="${escapeHtml(link)}">${imgTag}</a>`
  } else {
    html += imgTag
  }
  if (caption) {
    html += `<figcaption>${escapeHtml(caption)}</figcaption>`
  }
  html += "</figure>"

  return html
}

export const Figure: QuartzTransformerPlugin<Partial<Options>> = (userOpts) => {
  const opts = { ...defaultOptions, ...userOpts }

  return {
    name: "Figure",
    textTransform(_ctx, src) {
      if (!opts.enable) {
        return src
      }

      return src.toString().replace(figureShortcodeRegex, (_value, content) => {
        const attrs = parseShortcodeAttributes(content)
        return buildFigureHtml(attrs)
      })
    },
  }
}