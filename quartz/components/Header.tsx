import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const Header: QuartzComponent = ({ children }: QuartzComponentProps) => (
  <header class="site-header">
    <div class="site-header-banner">
      <img
        src="https://file.garden/ZTeNOnlIhS-zrdb1/images/clamp.jpg"
        alt="TawnyFlor decorative header banner"
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
