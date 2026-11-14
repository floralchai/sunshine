import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const WALINE_SERVER_URL = (process.env.WALINE_SERVER_URL ?? "").trim().replace(/\/+$/, "")
const WALINE_CLIENT_CSS = "https://unpkg.com/@waline/client@v3/dist/waline.css"

const walineClientScript = WALINE_SERVER_URL
  ? `const serverURL = ${JSON.stringify(WALINE_SERVER_URL)};
const clientModuleURL = "https://unpkg.com/@waline/client@v3/dist/waline.js";
const state = window.__tawnyFlorWaline ?? (window.__tawnyFlorWaline = {
  instance: null,
  target: null,
  handler: null,
  clientPromise: null,
  pendingTarget: null,
});

// Keep compatibility with a previously initialized state object.
state.target ??= null;
state.clientPromise ??= null;
state.pendingTarget ??= null;

function mountWaline() {
  const target = document.getElementById("waline-comments-mount");

  if (!target) {
    state.instance?.destroy();
    state.instance = null;
    state.target = null;
    state.pendingTarget = null;
    return;
  }

  if (state.target === target && state.instance) {
    state.instance.update({ path: window.location.pathname });
    return;
  }

  if (state.pendingTarget === target) return;

  state.clientPromise ??= import(clientModuleURL)
    .then(({ init }) => init)
    .catch((error) => {
      state.clientPromise = null;
      throw error;
    });

  state.pendingTarget = target;
  state.clientPromise
    .then((init) => {
      // Ignore a stale page if navigation happened while Waline was loading.
      if (document.getElementById("waline-comments-mount") !== target) return;

      state.instance?.destroy();
      state.instance = init({
        el: target,
        serverURL,
        path: window.location.pathname,
        lang: "en",
        dark: false,
        login: "disable",
        meta: ["nick"],
        requiredMeta: [],
        commentSorting: "latest",
        pageSize: 10,
        placeholder: "Leave a kind little note. New comments appear after moderator approval.",
        emoji: [{
          name: "Tawny Flor Pixel",
          folder: "https://tawnyflor.neocities.org/static/waline-emoji/",
          prefix: "tf_",
          type: "svg",
          icon: "flower",
          items: ["flower", "heart", "star", "sparkle", "rainbow", "bunny"],
        }],
      });
      state.target = target;
    })
    .catch((error) => {
      console.error("[Waline] The comment form could not be initialized.", error);
    })
    .finally(() => {
      if (state.pendingTarget === target) state.pendingTarget = null;
    });
}

if (!state.handler) {
  state.handler = () => mountWaline();
  document.addEventListener("nav", state.handler);
}

mountWaline();`
  : ""

const WalineComments: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
  // Keep the navigation listener alive on the 404 layout, but do not show a
  // comment form on the 404 page itself.
  if (fileData.slug === "404") {
    return null
  }

  return (
    <section class="waline-comments" aria-labelledby="waline-comments-title">
      <h2 id="waline-comments-title">Comments</h2>
      <p class="waline-comments-intro">
        A little corner to leave a note, share an idea, or say hello.
      </p>
      <div class="waline-feeling-prompt" aria-label="A few feelings to inspire your comment">
        <p class="waline-feeling-title">What do you feel about this?</p>
        <div class="waline-feeling-chips">
          <span class="waline-feeling-chip waline-feeling-pink">♡ Love it</span>
          <span class="waline-feeling-chip waline-feeling-peach">✿ Enjoyed it</span>
          <span class="waline-feeling-chip waline-feeling-lilac">✧ Interesting</span>
          <span class="waline-feeling-chip waline-feeling-mint">☁ Still thinking</span>
        </div>
        <p class="waline-feeling-hint">Pick a feeling, then tell me what is on your mind.</p>
      </div>
      {WALINE_SERVER_URL ? (
        <>
          <link rel="stylesheet" href={WALINE_CLIENT_CSS} />
          <div id="waline-comments-mount" />
        </>
      ) : (
        <div class="waline-setup-notice" role="status">
          <span class="waline-setup-flower" aria-hidden="true">✿</span>
          <p>
            The comment garden is being prepared. Waline will appear here after
            its server is connected.
          </p>
        </div>
      )}
    </section>
  )
}

WalineComments.css = `
.waline-comments {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  margin-block: 2rem 1.5rem;
  padding-top: 1.15rem;
  border-top: 2px solid transparent;
  border-image: linear-gradient(90deg, #e7a0aa, #efbd91, #f1d98b, #a5cfb4, #9fc7e9, #aaa6df, #c5a5dc) 1;
}
.waline-comments h2 {
  margin: 0 0 .35rem;
  padding-bottom: .45rem;
  border-bottom: 2px solid transparent;
  border-image: linear-gradient(90deg, #e7a0aa, #efbd91, #f1d98b, #a5cfb4, #9fc7e9, #aaa6df, #c5a5dc) 1;
  font-family: "Nunito", "Trebuchet MS", sans-serif;
  color: #51447d;
}
.waline-comments-intro {
  margin: .25rem 0 1rem;
  color: #77717f;
  font-size: .95rem;
}
.waline-feeling-prompt {
  margin: 1rem 0 1.15rem;
  padding: 1rem 1.1rem;
  border: 2px solid #f0dce9;
  border-radius: 12px;
  background: linear-gradient(125deg, #fff7fa 0%, #fbf8ff 55%, #f4fbf7 100%);
}
.waline-feeling-title {
  margin: 0 0 .7rem;
  color: #685276;
  font-family: "Nunito", "Trebuchet MS", sans-serif;
  font-size: 1.05rem;
  font-weight: 800;
}
.waline-feeling-chips {
  display: flex;
  flex-wrap: wrap;
  gap: .5rem;
}
.waline-feeling-chip {
  display: inline-flex;
  align-items: center;
  gap: .3rem;
  padding: .38rem .72rem;
  border: 1.5px solid currentColor;
  border-radius: 999px;
  font-family: "Nunito", "Trebuchet MS", sans-serif;
  font-size: .88rem;
  font-weight: 700;
  line-height: 1.35;
}
.waline-feeling-pink {
  color: #a95f7b;
  background: #fff0f5;
  border-color: #edc2d2;
}
.waline-feeling-peach {
  color: #986b4d;
  background: #fff5e9;
  border-color: #efd4b5;
}
.waline-feeling-lilac {
  color: #75629c;
  background: #f4efff;
  border-color: #d8c9ef;
}
.waline-feeling-mint {
  color: #527d68;
  background: #eff9f2;
  border-color: #c5e2ce;
}
.waline-feeling-hint {
  margin: .7rem 0 0;
  color: #817589;
  font-size: .82rem;
}
.waline-setup-notice {
  display: flex;
  align-items: center;
  gap: .8rem;
  padding: 1rem 1.1rem;
  border: 1px dashed #c5a5dc;
  border-radius: 8px;
  background: linear-gradient(110deg, #fff8fb, #f8f6ff, #f4fbff);
  color: #655873;
}
.waline-setup-notice p {
  margin: 0;
}
.waline-setup-flower {
  flex: 0 0 auto;
  color: #c77fae;
  font-size: 1.5rem;
}
.waline-comments #waline-comments-mount {
  --waline-font-size: 15px;
  --waline-theme-color: #9b83c9;
  --waline-active-color: #7358aa;
  --waline-color: #54595d;
  --waline-bg-color: #ffffff;
  --waline-bg-color-light: #fbf8fd;
  --waline-bg-color-hover: #f3edf8;
  --waline-border-color: #e6dced;
  --waline-disable-bg-color: #f7f2fa;
  --waline-disable-color: #ab9fb4;
  --waline-bq-color: #f5f0fa;
  --waline-badge-color: #9fc7e9;
  --waline-info-bg-color: #f8f5fb;
  --waline-info-color: #8c8195;
  --waline-border: 2px solid var(--waline-border-color);
  --waline-avatar-radius: 8px;
  --waline-box-shadow: none;
  color: #54595d;
  font-family: "Source Serif 4", Georgia, serif;
}
.waline-comments #waline-comments-mount .wl-panel,
.waline-comments #waline-comments-mount .wl-card {
  border: 2px solid var(--waline-border-color) !important;
  box-shadow: none !important;
}

.waline-comments #waline-comments-mount input,
.waline-comments #waline-comments-mount textarea {
  border: 2px solid var(--waline-border-color) !important;
  box-shadow: none !important;
}
.waline-comments #waline-comments-mount button,
.waline-comments #waline-comments-mount input,
.waline-comments #waline-comments-mount textarea {
  font-family: "Nunito", "Trebuchet MS", sans-serif;
}
.waline-comments #waline-comments-mount .wl-btn,
.waline-comments #waline-comments-mount .wl-btn.primary {
  border-radius: 6px;
}
.waline-comments #waline-comments-mount .wl-panel {
  margin-top: 1rem;
  padding: 1rem;
  border: 2px solid #efdce9 !important;
  border-radius: 12px;
  background: linear-gradient(145deg, #fffafc 0%, #fbf9ff 58%, #f6fcf8 100%);
}
.waline-comments #waline-comments-mount .wl-header {
  border-bottom: 1px dashed #e8d8e9;
}
.waline-comments #waline-comments-mount .wl-input,
.waline-comments #waline-comments-mount .wl-textarea,
.waline-comments #waline-comments-mount textarea,
.waline-comments #waline-comments-mount input {
  border: 2px solid #ead9e8 !important;
  border-radius: 8px !important;
  background: #fffdfd !important;
  color: #594e60;
  transition: border-color .18s ease, background-color .18s ease;
}
.waline-comments #waline-comments-mount .wl-input:focus,
.waline-comments #waline-comments-mount .wl-textarea:focus,
.waline-comments #waline-comments-mount textarea:focus,
.waline-comments #waline-comments-mount input:focus {
  border-color: #bd9bcf !important;
  outline: 2px solid #eadcf2;
  outline-offset: 1px;
  background: #ffffff !important;
}
.waline-comments #waline-comments-mount textarea {
  min-height: 120px;
  padding: .8rem;
  line-height: 1.65;
}
.waline-comments #waline-comments-mount .wl-btn,
.waline-comments #waline-comments-mount .wl-btn.primary {
  min-height: 2.45rem;
  padding: .48rem 1rem;
  border: 2px solid #d9bdd9 !important;
  border-radius: 8px !important;
  background: #f8eaf2 !important;
  color: #76566f !important;
  font-weight: 800;
  box-shadow: none !important;
  transition: background-color .18s ease, border-color .18s ease, transform .18s ease;
}
.waline-comments #waline-comments-mount .wl-btn:hover,
.waline-comments #waline-comments-mount .wl-btn.primary:hover {
  border-color: #b9d8c3 !important;
  background: #edf8f0 !important;
  color: #4f725d !important;
}
.waline-comments #waline-comments-mount .wl-btn:focus-visible {
  outline: 3px solid #cbb7e4;
  outline-offset: 2px;
}
.waline-comments #waline-comments-mount .wl-card {
  border-radius: 10px;
  background: #fffdfd;
}
.waline-comments #waline-comments-mount .wl-content {
  line-height: 1.7;
}
.waline-comments #waline-comments-mount .wl-meta {
  color: #8b7c91;
}
.waline-comments #waline-comments-mount .wl-emoji img {
  image-rendering: pixelated;
}
@media (max-width: 640px) {
  .waline-comments {
    margin-block: 1.5rem 1rem;
  }
  .waline-comments #waline-comments-mount {
    --waline-avatar-size: 2.7rem;
  }
}
`

WalineComments.afterDOMLoaded = walineClientScript

export default (() => WalineComments) satisfies QuartzComponentConstructor
