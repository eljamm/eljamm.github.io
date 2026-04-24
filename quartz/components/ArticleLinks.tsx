import { QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
import { JSX } from "preact"
import style from "./styles/contentMeta.scss"

interface ArticleLinksOptions {
  show: boolean
}

const defaultOptions: ArticleLinksOptions = {
  show: true,
}

export default ((opts?: Partial<ArticleLinksOptions>) => {
  const options: ArticleLinksOptions = { ...defaultOptions, ...opts }

  function ArticleLinks({ fileData, displayClass }: QuartzComponentProps) {
    const frontmatter = fileData.frontmatter as Record<string, unknown>

    if (options.show && frontmatter?.hideLinks !== true) {
      const website = frontmatter?.website as string | undefined
      const source = frontmatter?.source as string | undefined

      if (!website && !source) {
        return null
      }

      const links: JSX.Element[] = []

      if (website) {
        links.push(
          <a href={website} target="_blank" rel="noopener noreferrer" class="external-link">
            homepage{" "}
            <svg width="12" height="12" viewBox="0 0 512 512" fill="currentColor">
              <path d="M320 0H288V64h32 82.7L201.4 265.4 178.7 288 224 333.3l22.6-22.6L448 109.3V192v32h64V192 32 0H480 320zM32 32H0V64 480v32H32 456h32V480 352 320H424v32 96H64V96h96 32V32H160 32z" />
            </svg>
          </a>
        )
      }

      if (source) {
        links.push(
          <a href={source} target="_blank" rel="noopener noreferrer" class="external-link">
            source{" "}
            <svg width="12" height="12" viewBox="0 0 512 512" fill="currentColor">
              <path d="M320 0H288V64h32 82.7L201.4 265.4 178.7 288 224 333.3l22.6-22.6L448 109.3V192v32h64V192 32 0H480 320zM32 32H0V64 480v32H32 456h32V480 352 320H424v32 96H64V96h96 32V32H160 32z" />
            </svg>
          </a>
        )
      }

      return (
        <p show-comma={true} class={classNames(displayClass, "content-meta", "article-links")}>
          {links}
        </p>
      )
    }

    return null
  }

  ArticleLinks.css = style

  return ArticleLinks
}) satisfies QuartzComponentConstructor