import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const Header: QuartzComponent = ({ children }: QuartzComponentProps) => {
  const banner = "https://file.garden/ZTeNOnlIhS-zrdb1/images/clamp.jpg"

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
      <nav class="portfolio-top-nav" aria-label="Main navigation">
        <a href="/">Home</a>
        <a href="/README">Diary of Notes</a>
        <a href="/notes-and-diary">Diary</a>
        <a href="https://github.com/floralchai/sunshine" target="_blank" rel="noopener noreferrer">Source Code</a>
      </nav>
      <div class="site-header-title">{children}</div>
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
  width: 100%;
  height: 300px;
  object-fit: cover;
  image-rendering: pixelated;
}
.site-header-title { min-width: 0; max-width: 100%; overflow-wrap: anywhere; }
.site-header-title h1 { margin: 0; }
.portfolio-top-nav {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: .35rem;
  padding: .35rem 0 .45rem;
  border: 0;
  border-bottom: 4px solid transparent;
  border-image: none;
  background: linear-gradient(90deg, #e7a0aa, #efbd91, #f1d98b, #a5cfb4, #9fc7e9, #aaa6df, #c5a5dc) left bottom / 100% 4px no-repeat;
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
  padding: .45rem .8rem .55rem;
  color: var(--secondary);
  font-weight: 600;
  text-decoration: none;
  border-bottom: 0;
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
