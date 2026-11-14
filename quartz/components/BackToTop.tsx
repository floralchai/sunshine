import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const BackToTop: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
  return (
    <div class={["back-to-top", displayClass].filter(Boolean).join(" ")}>
      <button
        type="button"
        data-back-to-top
        aria-label="Scroll to site header"
      >
        ↑ Back to top
      </button>
    </div>
  )
}

BackToTop.afterDOMLoaded = `
  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return
    const button = event.target.closest("[data-back-to-top]")
    if (!button) return

    event.preventDefault()
    document.querySelector(".site-header")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    })
  })
`

export default (() => BackToTop) satisfies QuartzComponentConstructor
