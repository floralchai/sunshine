import { QuartzComponentConstructor, QuartzComponentProps } from "./types"

function BackToTop({ displayClass }: QuartzComponentProps) {
  return (
    <div class={["back-to-top", displayClass].filter(Boolean).join(" ")}>
      <a href="#" aria-label="Back to top of page">
        <span aria-hidden="true">↑</span> Back to top <span aria-hidden="true">✿</span>
      </a>
    </div>
  )
}

export default (() => BackToTop) satisfies QuartzComponentConstructor
