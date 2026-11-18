import { QuartzTransformerPlugin } from "../types"

export interface Options {
  enable: boolean
}

const defaultOptions: Options = {
  enable: true,
}

const videoShortcodeRegex = /\{\{\s*video\s*\(([\s\S]*?)\)\s*\}\}/g

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

function buildVideoHtml(attrs: Record<string, string>): string {
  const { src, alt = "", width, height, autoplay, loop, muted, controls = "true", caption } = attrs
  const cleanSrc = cleanAttributeValue(src)

  if (!cleanSrc) {
    return ""
  }

  let videoTag = `<video src="${escapeHtml(cleanSrc)}" `
  if (width) videoTag += `width="${escapeHtml(width)}" `
  if (height) videoTag += `height="${escapeHtml(height)}" `
  if (autoplay) videoTag += `autoplay `
  if (loop) videoTag += `loop `
  if (muted) videoTag += `muted `
  videoTag += `controls="${escapeHtml(controls)}">`
  if (alt) {
    videoTag += `<track kind="captions" label="${escapeHtml(alt)}" srclang="en" default>`
  }
  videoTag += "</video>"

  if (caption) {
    return `<figure class="video-shortcode">${videoTag}<figcaption>${escapeHtml(caption)}</figcaption></figure>`
  }

  return `<figure class="video-shortcode">${videoTag}</figure>`
}

export const Video: QuartzTransformerPlugin<Partial<Options>> = (userOpts) => {
  const opts = { ...defaultOptions, ...userOpts }

  return {
    name: "Video",
    textTransform(_ctx, src) {
      if (!opts.enable) {
        return src
      }

      return src.toString().replace(videoShortcodeRegex, (_value, content) => {
        const attrs = parseShortcodeAttributes(content)
        return buildVideoHtml(attrs)
      })
    },
  }
}
