import { QuartzTransformerPlugin } from "../types"

export interface Options {
  enable: boolean
}

const defaultOptions: Options = {
  enable: true,
}

const youtubeShortcodeRegex = /\{\{\s*youtube\s*\(([\s\S]*?)\)\s*\}\}/g

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

function buildYoutubeHtml(attrs: Record<string, string>): string {
  const { id, title, playlist, autoplay, class: className, cookie } = attrs

  if (!id) {
    console.warn("[youtube] Missing video id")
    return ""
  }

  const videoId = escapeHtml(id)
  const videoTitle = escapeHtml(title ?? "YouTube video")
  const playlistParam = playlist ? escapeHtml(playlist) : ""
  const autoplayVal = autoplay === "true" ? "1" : "0"
  const embedClass = className ? ` ${escapeHtml(className)}` : ""
  const useCookie = cookie === "true"

  return `<div class="yv${embedClass}" data-video-id="${videoId}" data-playlist="${playlistParam}" data-autoplay="${autoplayVal}">
    <div class="yv-thumb" tabindex="0" role="button" aria-label="Play YouTube video">
        <div class="yv-bg"></div>
        <img src="https://img.youtube.com/vi/${videoId}/maxresdefault.jpg" alt="${videoTitle}" loading="lazy">
        ${title ? `<div class="yv-title"><span class="yv-title-text">${videoTitle}</span></div>` : ""}
        <div class="yv-play">
            <div class="yv-play-ring"></div>
            <svg viewBox="0 0 24 24">
                <path fill="currentColor" d="M8 5v14l11-7z"/>
            </svg>
        </div>
        <div class="yv-glow"></div>
    </div>
    <div class="yv-embed">
        <noscript>
            <iframe src="https://www.youtube${useCookie ? "" : "-nocookie"}.com/embed/${videoId}?${playlistParam ? `list=${playlistParam}&` : ""}autoplay=${autoplayVal}" title="${videoTitle}" class="yvi" allowfullscreen></iframe>
        </noscript>
    </div>
</div>`
}

export const YouTube: QuartzTransformerPlugin<Partial<Options>> = (userOpts) => {
  const opts = { ...defaultOptions, ...userOpts }

  return {
    name: "YouTube",
    textTransform(_ctx, src) {
      if (!opts.enable) {
        return src
      }

      return src.toString().replace(youtubeShortcodeRegex, (_value, content) => {
        const attrs = parseShortcodeAttributes(content)
        return buildYoutubeHtml(attrs)
      })
    },
  }
}
