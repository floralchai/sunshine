import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"
import { PageTypeDispatcher } from "./quartz/plugins/pageTypes/dispatcher"
import Header from "./quartz/components/Header"
import WalineComments from "./quartz/components/WalineComments"

const config = await loadQuartzConfig()
const baseLayout = await loadQuartzLayout()

const header = Header()
const walineComments = WalineComments()

// Keep the custom banner/navigation in the shared page frame for every page type.
const defaults = {
  ...baseLayout.defaults,
  header: [header, ...(baseLayout.defaults.header ?? [])],
  afterBody: [...(baseLayout.defaults.afterBody ?? []), walineComments],
}

// Quartz 5 resolves explicit page-type layouts before shared defaults. Add the
// shared site header and Waline comments to those layouts as well, so the
// comment section is present across every page type.
const byPageType = Object.fromEntries(
  Object.entries(baseLayout.byPageType).map(([pageType, pageLayout]) => [
    pageType,
    {
      ...pageLayout,
      header: [header, ...(pageLayout.header ?? [])],
      afterBody: [...(pageLayout.afterBody ?? []), walineComments],
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
