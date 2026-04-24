import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
import { JSX } from "preact"
import style from "./styles/pageMeta.scss"

const PageMeta: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
  const frontmatter = fileData.frontmatter as Record<string, unknown>

  const categories = frontmatter?.categories as string | string[] | undefined
  const website = frontmatter?.website as string | undefined
  const source = frontmatter?.source as string | undefined
  const rating = frontmatter?.rating as number | string | undefined

  const ratingValue = rating != null && rating !== "" ? Number(rating) : 0
  const hasRating = Number.isInteger(ratingValue) && ratingValue > 0

  if (!categories && !website && !source && !hasRating) {
    return null
  }

  const items: JSX.Element[] = []

  if (categories) {
    const cats = Array.isArray(categories) ? categories : [categories]
    const links = cats.map((cat) => {
      const match = cat.match(/\[\[([^\]]+)\]\]/)
      const label = match ? match[1] : cat
      return (
        <a href={`/${label.toLowerCase().replace(/\s+/g, "-")}`} class="internal category-link">
          {label}
        </a>
      )
    })
    items.push(
      <div class="meta-item">
        <span class="meta-label">category</span>
        <span class="meta-value">{links}</span>
      </div>,
    )
  }

  if (website) {
    items.push(
      <div class="meta-item">
        <span class="meta-label">homepage</span>
        <a href={website} target="_blank" rel="noopener noreferrer" class="external-link">
          link
          <svg width="12" height="12" viewBox="0 0 512 512" fill="currentColor">
            <path d="M320 0H288V64h32 82.7L201.4 265.4 178.7 288 224 333.3l22.6-22.6L448 109.3V192v32h64V192 32 0H480 320zM32 32H0V64 480v32H32 456h32V480 352 320H424v32 96H64V96h96 32V32H160 32z" />
          </svg>
        </a>
      </div>,
    )
  }

  if (source) {
    items.push(
      <div class="meta-item">
        <span class="meta-label">source</span>
        <a href={source} target="_blank" rel="noopener noreferrer" class="external-link">
          link
          <svg width="12" height="12" viewBox="0 0 512 512" fill="currentColor">
            <path d="M320 0H288V64h32 82.7L201.4 265.4 178.7 288 224 333.3l22.6-22.6L448 109.3V192v32h64V192 32 0H480 320zM32 32H0V64 480v32H32 456h32V480 352 320H424v32 96H64V96h96 32V32H160 32z" />
          </svg>
        </a>
      </div>,
    )
  }

  if (hasRating) {
    const stars: JSX.Element[] = []
    for (let i = 1; i <= 5; i++) {
      stars.push(<span class={i <= ratingValue ? "star filled" : "star"}>★</span>)
    }
    items.push(
      <div class="meta-item">
        <span class="meta-label">rating</span>
        <span class="meta-value rating">{stars}</span>
      </div>,
    )
  }

  return (
    <div class={classNames(displayClass, "page-meta")}>
      <h3>Info</h3>
      {items}
    </div>
  )
}

PageMeta.css = style

export default (() => PageMeta) satisfies QuartzComponentConstructor
