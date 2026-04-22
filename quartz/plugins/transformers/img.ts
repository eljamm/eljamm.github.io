import { QuartzTransformerPlugin } from "../types"

export interface Options {
  enable: boolean
}

const defaultOptions: Options = {
  enable: true,
}

const imgShortcodeRegex = /\{\{\s*img\s*\(([\s\S]*?)\)\s*\}\}/g

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

function cleanAttributeValue(value: string | undefined): string {
  if (!value) return ""
  return value.replace(/^<|>$/g, "")
}

function buildFigureHtml(attrs: Record<string, string>): string {
  const { src, alt = "", caption, width, height, link } = attrs
  const cleanSrc = cleanAttributeValue(src)
  const cleanLink = link ? cleanAttributeValue(link) : undefined

  if (!cleanSrc) {
    return ""
  }

  let imgTag = `<img src="${escapeHtml(cleanSrc)}" alt="${escapeHtml(alt)}"`
  if (width) imgTag += ` width="${escapeHtml(width)}"`
  if (height) imgTag += ` height="${escapeHtml(height)}"`
  imgTag += " />"

  let html = `<figure class="img-shortcode">`
  if (cleanLink) {
    html += `<a href="${escapeHtml(cleanLink)}">${imgTag}</a>`
  } else {
    html += imgTag
  }
  if (caption) {
    html += `<figcaption>${escapeHtml(caption)}</figcaption>`
  }
  html += "</figure>"

  return html
}

export const Img: QuartzTransformerPlugin<Partial<Options>> = (userOpts) => {
  const opts = { ...defaultOptions, ...userOpts }

  return {
    name: "Img",
    textTransform(_ctx, src) {
      if (!opts.enable) {
        return src
      }

      return src.toString().replace(imgShortcodeRegex, (_value, content) => {
        const attrs = parseShortcodeAttributes(content)
        return buildFigureHtml(attrs)
      })
    },
  }
}