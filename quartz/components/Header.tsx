import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

type HeaderNavigationItem = {
  label?: string
  link?: string
}

type HeaderSettings = {
  banner?: string
  navigation?: HeaderNavigationItem[]
}

const normalisePath = (value: string) => {
  try {
    return decodeURIComponent(value).replace(/^\/+|\/+$/g, "")
  } catch {
    return value.replace(/^\/+|\/+$/g, "")
  }
}

const Header: QuartzComponent = ({ children, allFiles = [] }: QuartzComponentProps) => {
  // The SiteHeader note is the editable source of truth for the banner and
  // navigation. It is an ordinary Markdown note in the published vault.
  const settingsFile = allFiles.find((file: any) =>
    file.slug === "Portfolio/SiteHeader" || file.slug === "SiteHeader"
  ) as any
  const settings = (settingsFile?.frontmatter ?? {}) as HeaderSettings
  const banner = settings.banner || "https://file.garden/ZTeNOnlIhS-zrdb1/images/clamp.jpg"

  const publishedPaths = new Set(
    allFiles
      .map((file: any) => normalisePath(String(file.slug ?? "")))
      .filter(Boolean),
  )

  const navigation = (settings.navigation ?? [
    { label: "Home", link: "/" },
    { label: "Diary of Notes", link: "/README" },
    { label: "Diary", link: "/Notes%20and%20Diary" },
  ]).filter((item) => {
    if (!item.label?.trim() || !item.link?.trim()) return false
    if (/^https?:\/\//i.test(item.link)) return true
    const target = normalisePath(item.link)
    return target === "" || publishedPaths.has(target)
  })

  return (
    <header class="site-header">
      <div class="site-header-banner">
        <img
          src={banner}
          alt="TawnyFlor decorative header banner"
          loading="eager"
          decoding="async"
        />
      </div>
      <div class="site-header-title">{children}</div>
      <nav class="portfolio-top-nav" aria-label="Main navigation">
        {navigation.map((item) => (
          <a href={item.link}>{item.label}</a>
        ))}
      </nav>
    </header>
  )
}

// Keep one functional Reader Mode button even when responsive layouts or
// SPA navigation leave multiple plugin controls in the document.
Header.afterDOMLoaded = `
  (() => {
    const selector = ".readermode"
    const dedupeReaderMode = () => {
      const buttons = Array.from(document.querySelectorAll(selector))

      buttons.forEach((button) => {
        if (button.dataset.readerModeDuplicate === "true") {
          button.style.removeProperty("display")
          button.removeAttribute("data-reader-mode-duplicate")
          button.removeAttribute("aria-hidden")
          button.removeAttribute("tabindex")
        }
      })

      const visible = buttons.filter((button) => {
        const style = window.getComputedStyle(button)
        return style.display !== "none" &&
          style.visibility !== "hidden" &&
          button.getClientRects().length > 0
      })

      const keep = visible.find((button) =>
        button.closest("#quartz-body .sidebar.left")
      ) ?? visible[0]

      visible.forEach((button) => {
        if (button === keep) return
        button.style.setProperty("display", "none", "important")
        button.dataset.readerModeDuplicate = "true"
        button.setAttribute("aria-hidden", "true")
        button.setAttribute("tabindex", "-1")
      })
    }

    dedupeReaderMode()
    window.addEventListener("resize", dedupeReaderMode, { passive: true })
    window.addEventListener("pageshow", dedupeReaderMode)
    const observer = new MutationObserver(dedupeReaderMode)
    observer.observe(document.body, { childList: true, subtree: true })
  })()
`

Header.css = `
.site-header {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  margin: 1rem 0 1.25rem;
  gap: .8rem;
  box-sizing: border-box;
}
.site-header-banner {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
}
.site-header-banner img {
  display: block;
  width: 100%;
  max-width: 100%;
  height: min(300px, 24vw);
  min-height: 180px;
  object-fit: cover;
  object-position: center;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}
.site-header-title { min-width: 0; max-width: 100%; overflow-wrap: anywhere; }
.site-header-title h1 { margin: 0; }
.portfolio-top-nav {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: .35rem;
  padding: .45rem .55rem;
  border-block: 1px solid var(--lightgray);
  background: #f3f0fa;
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
}
.portfolio-top-nav a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  box-sizing: border-box;
  padding: .55rem .8rem;
  color: var(--secondary);
  font-weight: 600;
  text-decoration: none;
  touch-action: manipulation;
}
.portfolio-top-nav a:hover,
.portfolio-top-nav a:focus-visible {
  color: var(--dark);
  background: #e7def5;
  text-decoration: underline;
  text-decoration-color: #9b6bc5;
  text-decoration-thickness: 2px;
  text-underline-offset: 4px;
}
@media (max-width: 800px) {
  .site-header {
    width: 100%;
    margin: .5rem 0 .75rem;
    gap: .55rem;
  }
  .site-header-banner img {
    height: clamp(112px, 22vw, 144px);
    min-height: 0;
    max-height: 144px;
  }
  .portfolio-top-nav {
    flex-wrap: nowrap;
    justify-content: flex-start;
    overflow-x: auto;
    overflow-y: hidden;
    white-space: nowrap;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
    overscroll-behavior-x: contain;
  }
  .portfolio-top-nav a {
    flex: 0 0 auto;
    min-height: 44px;
    padding: .6rem .8rem;
  }
}
@media (max-width: 420px) {
  .site-header-banner img {
    height: 104px;
    max-height: 104px;
  }
  .portfolio-top-nav a {
    min-width: 44px;
    font-size: .9rem;
    padding-inline: .7rem;
  }
}
`

export default (() => Header) satisfies QuartzComponentConstructor
