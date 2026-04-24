import { QuartzEmitterPlugin } from "../types"
import { QuartzComponentProps } from "../../components/types"
import HeaderConstructor from "../../components/Header"
import BodyConstructor from "../../components/Body"
import { pageResources, renderPage } from "../../components/renderPage"
import { ProcessedContent, QuartzPluginData, defaultProcessedContent } from "../vfile"
import { FullPageLayout } from "../../cfg"
import { FullSlug, joinSegments, pathToRoot } from "../../util/path"
import { defaultListPageLayout, sharedPageComponents } from "../../../quartz.layout"
import { CategoryContent } from "../../components"
import { write } from "./helpers"
import { BuildCtx } from "../../util/ctx"
import { StaticResources } from "../../util/resources"

interface CategoryPageOptions extends FullPageLayout {
  sort?: (f1: QuartzPluginData, f2: QuartzPluginData) => number
}

function parseCategory(cat: string): string {
  const match = cat.match(/\[\[([^\]]+)\]\]/)
  return match ? match[1] : cat
}

function slugifyCategory(cat: string): string {
  return cat.toLowerCase().replace(/\s+/g, "-")
}

function computeCategoryInfo(
  allFiles: QuartzPluginData[],
  content: ProcessedContent[],
): [Set<string>, Record<string, ProcessedContent>] {
  const categories: Set<string> = new Set(
    allFiles.flatMap((data) => {
      const cats = data.frontmatter?.categories
      if (!cats) return []
      const arr = Array.isArray(cats) ? cats : [cats]
      return arr.map((c) => slugifyCategory(parseCategory(c)))
    }),
  )

  categories.add("index")

  const categoryDescriptions: Record<string, ProcessedContent> = Object.fromEntries(
    [...categories].map((cat) => {
      const displayName = cat === "index" ? "index" : cat.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
      const title = cat === "index" ? "Categories" : `Category: ${displayName}`
      return [
        cat,
        defaultProcessedContent({
          slug: joinSegments("categories", cat) as FullSlug,
          frontmatter: { title, tags: [] },
        }),
      ]
    }),
  )

  for (const [tree, file] of content) {
    const slug = file.data.slug!
    if (slug.startsWith("categories/")) {
      const cat = slug.slice("categories/".length)
      const normalizedCat = slugifyCategory(cat)
      if (categories.has(normalizedCat)) {
        categoryDescriptions[normalizedCat] = [tree, file]
        if (file.data.frontmatter?.title === cat || file.data.frontmatter?.title === normalizedCat) {
          const displayName = normalizedCat === "index" ? "index" : normalizedCat.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
          file.data.frontmatter.title = `Category: ${displayName}`
        }
      }
    }
  }

  return [categories, categoryDescriptions]
}

async function processCategoryPage(
  ctx: BuildCtx,
  category: string,
  categoryContent: ProcessedContent,
  allFiles: QuartzPluginData[],
  opts: FullPageLayout,
  resources: StaticResources,
) {
  const slug = joinSegments("categories", category) as FullSlug
  const [tree, file] = categoryContent
  const cfg = ctx.cfg.configuration
  const externalResources = pageResources(pathToRoot(slug), resources)
  const componentData: QuartzComponentProps = {
    ctx,
    fileData: file.data,
    externalResources,
    cfg,
    children: [],
    tree,
    allFiles,
  }

  const content = renderPage(cfg, slug, componentData, opts, externalResources)
  return write({
    ctx,
    content,
    slug: file.data.slug!,
    ext: ".html",
  })
}

export const CategoryPage: QuartzEmitterPlugin<Partial<CategoryPageOptions>> = (userOpts) => {
  const opts: FullPageLayout = {
    ...sharedPageComponents,
    ...defaultListPageLayout,
    pageBody: CategoryContent({ sort: userOpts?.sort }),
    ...userOpts,
  }

  const { head: Head, header, beforeBody, pageBody, afterBody, left, right, footer: Footer } = opts
  const Header = HeaderConstructor()
  const Body = BodyConstructor()

  return {
    name: "CategoryPage",
    getQuartzComponents() {
      return [
        Head,
        Header,
        Body,
        ...header,
        ...beforeBody,
        pageBody,
        ...afterBody,
        ...left,
        ...right,
        Footer,
      ]
    },
    async *emit(ctx, content, resources) {
      const allFiles = content.map((c) => c[1].data)
      const [categories, categoryDescriptions] = computeCategoryInfo(allFiles, content)

      for (const cat of categories) {
        yield processCategoryPage(ctx, cat, categoryDescriptions[cat], allFiles, opts, resources)
      }
    },
  }
}