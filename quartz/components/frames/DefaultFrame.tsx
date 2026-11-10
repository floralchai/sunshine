import { PageFrame, PageFrameProps } from "./types"
import HeaderConstructor from "../Header"
const Header = HeaderConstructor()

export const DefaultFrame: PageFrame = {
  name: "default",
  render({ componentData, header, beforeBody, pageBody: Content, afterBody, left, right, footer }: PageFrameProps) {
    return (
      <>
        <aside class="left sidebar" aria-label="Left sidebar navigation and tools" tabindex="0">
          <nav class="portfolio-sidebar-nav" aria-label="Portfolio navigation">
            <h2>Navigation</h2>
            <a href="/">Home</a>
            <a href="/README">Diary of Notes</a>
            <a href="/notes-and-diary">Diary</a>
            <a href="https://github.com/floralchai/sunshine" target="_blank" rel="noopener noreferrer">Source code</a>
          </nav>
          {left.map((BodyComponent) => <BodyComponent {...componentData} />)}
        </aside>
        <div class="center">
          <div class="page-header">
            <Header {...componentData}>{header.map((HeaderComponent) => <HeaderComponent {...componentData} />)}</Header>
            <div class="popover-hint">{beforeBody.map((BodyComponent) => <BodyComponent {...componentData} />)}</div>
          </div>
          <Content {...componentData} />
          <hr />
          <div class="page-footer">{afterBody.map((BodyComponent) => <BodyComponent {...componentData} />)}</div>
        </div>
        <div class="right sidebar">{right.map((BodyComponent) => <BodyComponent {...componentData} />)}</div>
        {footer.map((FooterComponent) => <FooterComponent {...componentData} />)}
      </>
    )
  },
}
