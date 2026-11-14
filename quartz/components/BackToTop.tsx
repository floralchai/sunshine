import { QuartzComponentConstructor, QuartzComponentProps } from "./types"

function BackToTop({ displayClass }: QuartzComponentProps) {
  return (
    <div class={["back-to-top", displayClass].filter(Boolean).join(" ")}>
      <button
        type="button"
        aria-label="Scroll to site header"
        onClick={() => document.querySelector(".site-header")?.scrollIntoView({ behavior: "smooth", block: "start" })}
      >
        ↑ Back to top
      </button>
    </div>
  )
}

export default (() => BackToTop) satisfies QuartzComponentConstructor
