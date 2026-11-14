import { QuartzComponent, QuartzComponentConstructor } from "./types"
import commentWidgetScript from "./scripts/comment-widget.inline"

const CommentWidget: QuartzComponent = () => (
  <section id="c_widget" class="comment-widget" aria-label="Page comments" />
)

CommentWidget.displayName = "CommentWidget"
CommentWidget.afterDOMLoaded = commentWidgetScript

export default (() => CommentWidget) satisfies QuartzComponentConstructor
