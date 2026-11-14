import { PageFrame, PageFrameProps } from "./types"
import HeaderConstructor from "../Header"

const SiteHeader = HeaderConstructor()

/**
 * Full-width page frame — no sidebars. The center content area spans the
 * full width of the page. Header, beforeBody, body, afterBody, and footer
 * are all rendered in a single column.
 *
 * Useful for page types like Canvas, presentations, or dashboards that
 * need maximum horizontal space.
 */
export const FullWidthFrame: PageFrame = {
  name: "full-width",
  render({
    componentData,
    header,
    beforeBody,
    pageBody: Content,
    afterBody,
    footer,
  }: PageFrameProps) {
    // quartz.ts already places SiteHeader in the header slot. Use it as the wrapper
    // instead of nesting a second SiteHeader inside itself.
    const HeaderComponent = header.find((Component) => Component === SiteHeader) ?? SiteHeader
    const headerChildren = header.filter((Component) => Component !== SiteHeader)

    return (
      <>
        <div class="center full-width">
          <div class="page-header">
            <HeaderComponent {...componentData}>
              {headerChildren.map((ChildComponent) => (
                <ChildComponent {...componentData} />
              ))}
            </HeaderComponent>
            <div class="popover-hint">
              {beforeBody.map((BodyComponent) => (
                <BodyComponent {...componentData} />
              ))}
            </div>
          </div>
          <Content {...componentData} />
          <hr />
          <div class="page-footer">
            {afterBody.map((BodyComponent) => (
              <BodyComponent {...componentData} />
            ))}
          </div>
        </div>
        {footer.map((FooterComponent) => (
          <FooterComponent {...componentData} />
        ))}
      </>
    )
  },
}
