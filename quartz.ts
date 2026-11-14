import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"
import { PageTypeDispatcher } from "./quartz/plugins/pageTypes/dispatcher"
import Header from "./quartz/components/Header"
import HyvorComments from "./quartz/components/HyvorComments"

const config = await loadQuartzConfig()
const baseLayout = await loadQuartzLayout()

const header = Header()
const hyvorComments = HyvorComments()

// Keep the custom banner/navigation in the shared page frame for every page type.
const defaults = {
  ...baseLayout.defaults,
  header: [header, ...(baseLayout.defaults.header ?? [])],
  afterBody: [...(baseLayout.defaults.afterBody ?? []), hyvorComments],
}

// Quartz 5 resolves explicit page-type layouts before shared defaults. Add the
// shared site header to those layouts as well, while keeping 404 pages free of comments.
const byPageType = Object.fromEntries(
  Object.entries(baseLayout.byPageType).map(([pageType, pageLayout]) => [
    pageType,
    {
      ...pageLayout,
      header: [header, ...(pageLayout.header ?? [])],
      afterBody: pageType === "404" ? [] : [...(pageLayout.afterBody ?? []), hyvorComments],
    },
  ]),
)

const siteLayout = { defaults, byPageType }

// The build reads the default export's emitters. Replace the config-created
// dispatcher so the custom component participates in both page rendering and
// ComponentResources discovery (including the bundled afterDOMLoaded script).
const dispatcherIndex = config.plugins.emitters.findIndex(
  (emitter) => emitter.name === "PageTypeDispatcher",
)
if (dispatcherIndex === -1) {
  throw new Error("Quartz PageTypeDispatcher was not registered.")
}
config.plugins.emitters[dispatcherIndex] = PageTypeDispatcher(siteLayout)

export default config
export const layout = siteLayout
