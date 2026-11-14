import { QuartzComponent, QuartzComponentConstructor } from "./types"
// @ts-ignore -- Quartz treats *.inline.ts imports as raw browser scripts.
import commentWidgetScript from "./scripts/comment-widget.inline"

const commentFormUrl =
  "https://docs.google.com/forms/d/e/1FAIpQLSeWfvuC_DsO3RNcMqI0YRscqaglKEWHtYi3j6tgTwIDDOlSsQ/viewform"

const CommentWidget: QuartzComponent = () => (
  <section id="c_widget" class="comment-widget" aria-label="Page comments">
    <noscript>
      <p>Comments need JavaScript to load on this page.</p>
      <p>
        <a href={commentFormUrl} target="_blank" rel="noopener noreferrer">
          Open the comment form directly
        </a>
      </p>
    </noscript>
  </section>
)

CommentWidget.displayName = "CommentWidget"
CommentWidget.afterDOMLoaded = commentWidgetScript

export default (() => CommentWidget) satisfies QuartzComponentConstructor
