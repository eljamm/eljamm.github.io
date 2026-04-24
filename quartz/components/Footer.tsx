import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/footer.scss"
import { version } from "../../package.json"
import { i18n } from "../i18n"

interface Options {
  links: Record<string, string>
}

export default ((opts?: Options) => {
  const Footer: QuartzComponent = ({ displayClass, cfg }: QuartzComponentProps) => {
    const year = new Date().getFullYear()
    const links = opts?.links ?? []
    const t = i18n(cfg.locale).components.footer
    return (
      <footer class={`${displayClass ?? ""}`}>
        <p>
          {Object.entries(links).map(([text, link], i) => (
            <>
              <a href={link}>{text}</a>
              {i < Object.entries(links).length - 1 && <span> • </span>}
            </>
          ))}
        </p>
        <p>
          © {year} Fedi Jamoussi • {t.license ?? "Website content is licensed under"}{" "}
          <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>
        </p>
        <p>
          {t.poweredBy ?? "Powered by"}{" "}
          <a href="https://quartz.jzhao.xyz/">Quartz v{version}</a>
        </p>
      </footer>
    )
  }

  Footer.css = style
  return Footer
}) satisfies QuartzComponentConstructor
