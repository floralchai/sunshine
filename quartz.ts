import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"
import Header from "./quartz/components/Header"

const config = await loadQuartzConfig()
export default config

// Add the site banner/navigation to the shared page frame so it appears on
// content, folder, tag, canvas, and other page types that use the default frame.
export const layout = await loadQuartzLayout({
  defaults: {
    header: [Header()],
  },
})
