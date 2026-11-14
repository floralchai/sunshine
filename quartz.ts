import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"
import Header from "./quartz/components/Header"
import CommentWidget from "./quartz/components/CommentWidget"

const config = await loadQuartzConfig()
export default config

// Add the site banner/navigation to the shared page frame so it appears on
// content, folder, tag, canvas, and other page types that use the default frame.
const loadedLayout = await loadQuartzLayout({
  defaults: {
    header: [Header()],
  },
})

// Add page-specific comment threads to every configured page type except 404.
// Each route gets the thread keyed by window.location.pathname in the widget script.
const commentWidget = CommentWidget()
const withComments = (pageLayout: typeof loadedLayout.defaults) => ({
  ...pageLayout,
  afterBody: [...(pageLayout.afterBody ?? []), commentWidget],
})

export const layout = {
  ...loadedLayout,
  defaults: withComments(loadedLayout.defaults),
  byPageType: Object.fromEntries(
    Object.entries(loadedLayout.byPageType).map(([pageType, pageLayout]) => [
      pageType,
      pageType === "404" ? pageLayout : withComments(pageLayout),
    ]),
  ),
}
