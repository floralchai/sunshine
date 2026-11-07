import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const Header: QuartzComponent = ({ children }: QuartzComponentProps) => (
  <header>
    {children}
    <nav class="portfolio-top-nav" aria-label="Main navigation">
      <a href="/">Home</a>
      <a href="/Welcome">Welcome</a>
      <a href="/README">Notes</a>
    </nav>
  </header>
)

Header.css = `
header { display: flex; flex-direction: column; align-items: stretch; margin: 1.25rem 0 1.5rem; gap: 1rem; }
header h1 { margin: 0; flex: auto; }
.portfolio-top-nav { display: flex; flex-wrap: wrap; align-items: center; gap: .35rem; padding: .45rem 0; border-top: 1px solid var(--lightgray); border-bottom: 1px solid var(--lightgray); background: #f8f9fa; }
.portfolio-top-nav a { display: inline-block; padding: .45rem .8rem; border-radius: 3px; color: var(--secondary); font-weight: 600; text-decoration: none; }
.portfolio-top-nav a:hover { color: var(--dark); background: var(--highlight); text-decoration: underline; text-decoration-color: #9b6bc5; text-decoration-thickness: 2px; text-underline-offset: 4px; }
@media (max-width: 600px) { .portfolio-top-nav { gap: .15rem; } .portfolio-top-nav a { padding: .4rem .55rem; } }
`

export default (() => Header) satisfies QuartzComponentConstructor
