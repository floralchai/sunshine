import { PageFrame, PageFrameProps } from "./types"
import HeaderConstructor from "../Header"
const Header = HeaderConstructor()

export const DefaultFrame: PageFrame = {
  name: "default",
  render({ componentData, header, beforeBody, pageBody: Content, afterBody, left, right, footer }: PageFrameProps) {
    return (
      <>
        <div class="left sidebar">
          <nav class="portfolio-sidebar-nav" aria-label="Portfolio navigation">
            <h2>Navigation</h2>
            <a href="/">Home</a>
            <a href="/README">Diary of Notes</a>
            <a href="/Notes%20and%20Diary">Diary</a>
            <a href="https://github.com/floralchai/sunshine" target="_blank" rel="noopener noreferrer">Source code</a>
          </nav>
          {left.map((BodyComponent) => <BodyComponent {...componentData} />)}
        </div>
        <div class="center">
          <div class="page-header">
            <Header {...componentData}>{header.map((HeaderComponent) => <HeaderComponent {...componentData} />)}</Header>
            <div class="page-header-actions-row">
              <div class="popover-hint">{beforeBody.map((BodyComponent) => <BodyComponent {...componentData} />)}</div>
              <nav class="page-header-actions" aria-label="Quick links">
                <a href="/">Home</a>
                <a href="/README">Diary of Notes</a>
                <a href="/Notes%20and%20Diary">Diary</a>
                <a href="https://github.com/floralchai/sunshine" target="_blank" rel="noopener noreferrer">Source code</a>
              </nav>
            </div>
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
