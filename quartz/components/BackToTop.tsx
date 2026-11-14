import { QuartzComponentConstructor, QuartzComponentProps } from "./types"

function BackToTop({ displayClass }: QuartzComponentProps) {
  return (
    <div class={["back-to-top", displayClass].filter(Boolean).join(" ")}>
      <button
        type="button"
        aria-label="Back to top of page"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        ↑ Back to top
      </button>
    </div>
  )
}

export default (() => BackToTop) satisfies QuartzComponentConstructor
