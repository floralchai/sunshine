import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const Header: QuartzComponent = ({ children }: QuartzComponentProps) => (
  <header class="site-header">
    <div class="site-header-banner">
      <img
        src="https://file.garden/ZTeNOnlIhS-zrdb1/images/clamp.jpg"
        alt="TawnyFlor website header"
        loading="eager"
        decoding="async"
      />
    </div>
    <div class="site-header-title">{children}</div>
    <nav class="portfolio-top-nav" aria-label="Main navigation">
      <a href="/">Home</a>
      <a href="/Welcome">Welcome</a>
      <a href="/README">Notes</a>
    </nav>
  </header>
)

Header.css = `
.site-header { display: flex; flex-direction: column; align-items: stretch; width: 100%; min-width: 0; max-width: 100%; margin: 1rem 0 1.25rem; gap: .8rem; box-sizing: border-box; }
.site-header-banner { width: 100%; max-width: 100%; min-width: 0; overflow: hidden; }
.site-header-banner img { display: block; width: 100%; max-width: 100%; height: clamp(5rem, 18vw, 12rem); object-fit: cover; object-position: center; }
.site-header-title { min-width: 0; max-width: 100%; overflow-wrap: anywhere; }
.site-header-title h1 { margin: 0; }
header h1 { margin: 0; flex: auto; }
.portfolio-top-nav { display: flex; flex-wrap: wrap; align-items: center; gap: .35rem; padding: .45rem 0; border-top: 1px solid var(--lightgray); border-bottom: 1px solid var(--lightgray); background: #f8f9fa; }
.portfolio-top-nav a { display: inline-block; padding: .45rem .8rem; border-radius: 3px; color: var(--secondary); font-weight: 600; text-decoration: none; }
.portfolio-top-nav a:hover { color: var(--dark); background: var(--highlight); text-decoration: underline; text-decoration-color: #9b6bc5; text-decoration-thickness: 2px; text-underline-offset: 4px; }
@media (max-width: 800px) {
  .site-header { width: 100%; margin: .5rem 0 .75rem; gap: .55rem; }
  .site-header-banner img { height: clamp(4.5rem, 28vw, 8rem); object-position: center; }
  .portfolio-top-nav { display: flex; flex-wrap: wrap; width: 100%; max-width: 100%; box-sizing: border-box; gap: .25rem; overflow: visible; }
  .portfolio-top-nav a { flex: 0 1 auto; min-height: 2.75rem; padding: .65rem .7rem; display: inline-flex; align-items: center; justify-content: center; white-space: normal; }
}
@media (max-width: 420px) {
  .site-header-banner img { height: 4.5rem; }
  .portfolio-top-nav { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .portfolio-top-nav a { width: 100%; padding-inline: .25rem; text-align: center; font-size: .9rem; }
}
`

export default (() => Header) satisfies QuartzComponentConstructor
