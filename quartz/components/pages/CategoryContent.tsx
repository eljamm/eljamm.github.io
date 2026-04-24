import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import style from "../styles/listPage.scss"
import { PageList, SortFn } from "../PageList"
import { FullSlug, resolveRelative, simplifySlug } from "../../util/path"
import { QuartzPluginData } from "../../plugins/vfile"
import { Root } from "hast"
import { htmlToJsx } from "../../util/jsx"
import { ComponentChildren } from "preact"
import { concatenateResources } from "../../util/resources"

interface CategoryContentOptions {
  sort?: SortFn
  numPages: number
}

const defaultOptions: CategoryContentOptions = {
  numPages: 10,
}

function parseCategory(cat: string): string {
  const match = cat.match(/\[\[([^\]]+)\]\]/)
  return match ? match[1] : cat
}

function slugifyCategory(cat: string): string {
  return cat.toLowerCase().replace(/\s+/g, "-")
}

export default ((opts?: Partial<CategoryContentOptions>) => {
  const options: CategoryContentOptions = { ...defaultOptions, ...opts }

  const CategoryContent: QuartzComponent = (props: QuartzComponentProps) => {
    const { tree, fileData, allFiles } = props
    const slug = fileData.slug

    if (!(slug?.startsWith("categories/") || slug === "categories")) {
      throw new Error(`Component "CategoryContent" tried to render a non-category page: ${slug}`)
    }

    const category = simplifySlug(slug.slice("categories/".length) as FullSlug)
    const allPagesWithCategory = (cat: string) =>
      allFiles.filter((file) => {
        const cats = file.frontmatter?.categories
        if (!cats) return false
        const arr = Array.isArray(cats) ? cats : [cats]
        return arr.map((c) => slugifyCategory(parseCategory(c))).includes(cat)
      })

    const content = (
      (tree as Root).children.length === 0
        ? fileData.description
        : htmlToJsx(fileData.filePath!, tree)
    ) as ComponentChildren
    const cssClasses: string[] = fileData.frontmatter?.cssclasses ?? []
    const classes = cssClasses.join(" ")
    if (category === "/") {
      const categoriesList = [
        ...new Set(
          allFiles.flatMap((data) => {
            const cats = data.frontmatter?.categories
            if (!cats) return []
            const arr = Array.isArray(cats) ? cats : [cats]
            return arr.map((c) => slugifyCategory(parseCategory(c)))
          }),
        ),
      ].sort((a, b) => a.localeCompare(b))
      const categoryItemMap: Map<string, QuartzPluginData[]> = new Map()
      for (const cat of categoriesList) {
        categoryItemMap.set(cat, allPagesWithCategory(cat))
      }
      return (
        <div class="popover-hint">
          <article class={classes}>
            <p>{content}</p>
          </article>
          <p>Total categories: {categoriesList.length}</p>
          <div>
            {categoriesList.map((cat) => {
              const pages = categoryItemMap.get(cat)!
              const listProps = {
                ...props,
                allFiles: pages,
              }

              const contentPage = allFiles.filter((file) => file.slug === `categories/${cat}`).at(0)

              const root = contentPage?.htmlAst
              const contentPageContent =
                !root || root?.children.length === 0
                  ? contentPage?.description
                  : htmlToJsx(contentPage.filePath!, root)

              const categoryListingPage = `/categories/${cat}` as FullSlug
              const href = resolveRelative(fileData.slug!, categoryListingPage)

              return (
                <div>
                  <h2>
                    <a class="internal category-link" href={href}>
                      {cat.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    </a>
                  </h2>
                  {contentPageContent && <p>{contentPageContent}</p>}
                  <div class="page-listing">
                    <p>
                      {pages.length} page{pages.length !== 1 && "s"} under this category
                    </p>
                    <PageList limit={options.numPages} {...listProps} sort={options?.sort} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )
    } else {
      const pages = allPagesWithCategory(category)
      const listProps = {
        ...props,
        allFiles: pages,
      }

      return (
        <div class="popover-hint">
          <article class={classes}>{content}</article>
          <div class="page-listing">
            <p>{pages.length} page{pages.length !== 1 && "s"} in this category</p>
            <div>
              <PageList {...listProps} sort={options?.sort} />
            </div>
          </div>
        </div>
      )
    }
  }

  CategoryContent.css = concatenateResources(style, PageList.css)
  return CategoryContent
}) satisfies QuartzComponentConstructor