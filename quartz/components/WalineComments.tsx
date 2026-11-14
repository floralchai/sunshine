import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const WALINE_SERVER_URL = (process.env.WALINE_SERVER_URL ?? "").trim().replace(/\/+$/, "")
const WALINE_CLIENT_CSS = "https://unpkg.com/@waline/client@v3/dist/waline.css"

const walineClientScript = WALINE_SERVER_URL
  ? `const serverURL = ${JSON.stringify(WALINE_SERVER_URL)};
const clientModuleURL = "https://unpkg.com/@waline/client@v3/dist/waline.js";
const state = window.__tawnyFlorWaline ?? (window.__tawnyFlorWaline = {
  instance: null,
  target: null,
  currentPath: null,
  handler: null,
  clientPromise: null,
  pendingKey: null,
  mountObserver: null,
  avatarObserver: null,
  avatarObserverRoot: null,
  loadingObserver: null,
});

state.target ??= null;
state.currentPath ??= null;
state.clientPromise ??= null;
state.pendingKey ??= null;

if (!state.feelingHandler) {
  state.feelingHandler = (event) => {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest("[data-waline-feeling]");
    if (!button) return;
    const feeling = button.getAttribute("data-waline-feeling");
    const textarea = document.querySelector("#waline-comments-mount textarea");
    if (!textarea || !feeling) return;
    document.querySelectorAll("[data-waline-feeling]").forEach((chip) => {
      chip.setAttribute("aria-pressed", chip === button ? "true" : "false");
    });
    const existing = textarea.value.trim();
    if (!existing.startsWith(feeling)) {
      textarea.value = existing ? feeling + " — " + existing : feeling + " — ";
    }
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
    textarea.focus();
  };
  document.addEventListener("click", state.feelingHandler);
}

const chiikawaAvatarFiles = [
  "chiikawa.svg",
  "hachiware.svg",
  "usagi.svg",
  "momonga.svg",
  "kurimanju.svg",
  "shisa.svg",
];

function applyChiikawaAvatars() {
  const root = document.getElementById("waline-comments-mount");
  if (!root) return;

  root.querySelectorAll("img.wl-avatar, .wl-avatar img, .wl-user img").forEach((avatar) => {
    if (!(avatar instanceof HTMLImageElement) || avatar.dataset.chiikawaAvatar === "true") return;

    const comment = avatar.closest(".wl-card, .wl-card-item, .wl-item, .wl-comment")
      || avatar.parentElement?.parentElement
      || root;
    const nickname = comment.querySelector(".wl-nick")?.textContent?.trim()
      || comment.querySelector(".wl-user")?.textContent?.trim()
      || avatar.getAttribute("alt")?.trim()
      || "little visitor";

    let hash = 2166136261;
    for (let i = 0; i < nickname.length; i++) {
      hash ^= nickname.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    const chosen = chiikawaAvatarFiles[(hash >>> 0) % chiikawaAvatarFiles.length];
    avatar.dataset.chiikawaAvatar = "true";
    avatar.src = "https://tawnyflor.neocities.org/static/waline-avatars/" + chosen;
    avatar.alt = nickname + " profile avatar";
    avatar.loading = "lazy";
  });
}

function watchChiikawaAvatars() {
  const root = document.getElementById("waline-comments-mount");
  if (!root) return;

  if (state.avatarObserverRoot !== root) {
    state.avatarObserver?.disconnect();
    applyChiikawaAvatars();
    state.avatarObserver = new MutationObserver(() => applyChiikawaAvatars());
    state.avatarObserver.observe(root, { childList: true, subtree: true });
    state.avatarObserverRoot = root;
    return;
  }
  applyChiikawaAvatars();
}

function setWalineStatus(target, message, visible = true) {
  const status = target?.closest(".waline-comments")?.querySelector(".waline-loading-status");
  if (!status) return;
  status.textContent = message;
  status.hidden = !visible;
}

function watchWalineReady(target) {
  state.loadingObserver?.disconnect();
  state.loadingObserver = null;
  const markReady = () => {
    if (!target.isConnected) {
      state.loadingObserver?.disconnect();
      state.loadingObserver = null;
      return true;
    }
    if (target.querySelector(".wl-panel, .wl-cards, .wl-list")) {
      setWalineStatus(target, "", false);
      state.loadingObserver?.disconnect();
      state.loadingObserver = null;
      return true;
    }
    return false;
  };
  if (!markReady()) {
    state.loadingObserver = new MutationObserver(markReady);
    state.loadingObserver.observe(target, { childList: true, subtree: true });
  }
}

function destroyWaline() {
  state.loadingObserver?.disconnect();
  state.loadingObserver = null;
  state.avatarObserver?.disconnect();
  state.avatarObserver = null;
  state.avatarObserverRoot = null;
  state.instance?.destroy();
  state.instance = null;
  state.target = null;
  state.currentPath = null;
}

function mountWaline() {
  const target = document.getElementById("waline-comments-mount");
  const path = window.location.pathname;

  if (!target) {
    destroyWaline();
    state.pendingKey = null;
    return;
  }

  // A new page may reuse the same DOM mount. Re-create Waline when its path
  // changes so the form and comment list immediately belong to the new page.
  if (state.target === target && state.instance && state.currentPath === path) {
    watchChiikawaAvatars();
    return;
  }

  if (state.pendingKey === target && state.pendingPath === path) return;

  setWalineStatus(target, "Loading comments… ♡", true);

  state.clientPromise ??= import(clientModuleURL)
    .then(({ init }) => init)
    .catch((error) => {
      state.clientPromise = null;
      throw error;
    });

  state.pendingKey = target;
  state.pendingPath = path;

  state.clientPromise
    .then((init) => {
      // Ignore a stale page if another navigation happened while the module loaded.
      if (
        document.getElementById("waline-comments-mount") !== target
        || window.location.pathname !== path
        || state.pendingKey !== target
        || state.pendingPath !== path
      ) return;

      destroyWaline();
      state.instance = init({
        el: target,
        serverURL,
        path,
        lang: "en",
        dark: false,
        login: "disable",
        meta: ["nick", "mail", "link"],
        requiredMeta: ["nick"],
        commentSorting: "latest",
        pageSize: 10,
        placeholder: "Leave a kind little note. Be gentle and keep it friendly ♡",
        emoji: [{
          name: "Tawny Flor Pixel",
          folder: "https://tawnyflor.neocities.org/static/waline-emoji/",
          prefix: "tf_",
          type: "svg",
          icon: "flower",
          items: ["flower", "heart", "star", "sparkle", "rainbow", "bunny", "cat", "mushroom", "coffee", "moon", "leaf", "peach"],
        }],
      });
      state.target = target;
      state.currentPath = path;
      watchChiikawaAvatars();
      watchWalineReady(target);
    })
    .catch((error) => {
      setWalineStatus(target, "The comments could not load. Please refresh the page to try again.", true);
      console.error("[Waline] The comment form could not be initialized.", error);
    })
    .finally(() => {
      if (state.pendingKey === target && state.pendingPath === path) {
        state.pendingKey = null;
        state.pendingPath = null;
      }
    });
}

// The nav event is Quartz's SPA lifecycle hook. The observer is a fallback for
// DOM swaps and ensures the comment mount is initialized as soon as it exists.
if (!state.handler) {
  state.handler = () => mountWaline();
  document.addEventListener("nav", state.handler);
}

if (!state.mountObserver && document.documentElement) {
  state.mountObserver = new MutationObserver(() => {
    const target = document.getElementById("waline-comments-mount");
    if (target !== state.target || window.location.pathname !== state.currentPath) {
      mountWaline();
    }
  });
  state.mountObserver.observe(document.documentElement, { childList: true, subtree: true });
}

mountWaline();`
  : ""

const WalineComments: QuartzComponent = (_props: QuartzComponentProps) => {
  // Render the comment section on every page type, including the 404 page.
  return (
    <section class="waline-comments" aria-labelledby="waline-comments-title">
      <h2 id="waline-comments-title">Comments</h2>
      <p class="waline-comments-intro">
        A little corner to leave a note, share an idea, or say hello.
      </p>
      <div class="waline-feeling-prompt" aria-label="A few feelings to inspire your comment">
        <p class="waline-feeling-title">How do you feel about this?</p>
        <div class="waline-feeling-chips">
          <button type="button" class="waline-feeling-chip waline-feeling-pink" data-waline-feeling="♡ Love it" aria-pressed="false">♡ Love it</button>
          <button type="button" class="waline-feeling-chip waline-feeling-peach" data-waline-feeling="✿ Enjoyed it" aria-pressed="false">✿ Enjoyed it</button>
          <button type="button" class="waline-feeling-chip waline-feeling-lilac" data-waline-feeling="✧ Interesting" aria-pressed="false">✧ Interesting</button>
          <button type="button" class="waline-feeling-chip waline-feeling-mint" data-waline-feeling="☁ Still thinking" aria-pressed="false">☁ Still thinking</button>
        </div>
        <p class="waline-feeling-hint">Pick a feeling, then tell me what is on your mind.</p>
      </div>
      {WALINE_SERVER_URL ? (
        <>
          <link rel="stylesheet" href={WALINE_CLIENT_CSS} />
          <p class="waline-loading-status" role="status" aria-live="polite">Loading comments… ♡</p>
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
  appearance: none;
  display: inline-flex;
  align-items: center;
  gap: .3rem;
  padding: .38rem .72rem;
  border: 1.5px solid currentColor;
  border-radius: 0;
  cursor: pointer;
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
.waline-feeling-chip[aria-pressed="true"] {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}
.waline-feeling-chip:focus-visible {
  outline: 2px solid #8f78b5;
  outline-offset: 3px;
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
.waline-loading-status {
  margin: .75rem 0;
  padding: .65rem .85rem;
  border: 1px dashed #d9c5e8;
  background: #fbf8ff;
  color: #75658a;
  font-family: "Nunito", "Trebuchet MS", sans-serif;
  font-size: .9rem;
}
.waline-loading-status[hidden] {
  display: none !important;
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
  --waline-avatar-radius: 0px;
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
  margin: 0 !important;
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
  border-radius: 0 !important;
  margin: .35rem 0 .8rem !important;
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
  border-radius: 0 !important;
  background: #f8eaf2 !important;
  color: #76566f !important;
  font-weight: 800;
  letter-spacing: .01em;
  box-shadow: none !important;
  cursor: pointer;
  image-rendering: pixelated;
  transition: background-color .12s ease, border-color .12s ease, transform .12s ease;
}
.waline-comments #waline-comments-mount .wl-btn:hover,
.waline-comments #waline-comments-mount .wl-btn.primary:hover {
  border-color: #b9d8c3 !important;
  background: #edf8f0 !important;
  color: #4f725d !important;
  transform: translate(-1px, -1px);
}
.waline-comments #waline-comments-mount .wl-btn:active,
.waline-comments #waline-comments-mount .wl-btn.primary:active {
  transform: translate(1px, 1px);
}
.waline-comments #waline-comments-mount .wl-btn:focus-visible {
  outline: 3px solid #cbb7e4;
  outline-offset: 2px;
}
.waline-comments #waline-comments-mount .wl-card {
  border-radius: 10px;
  background: #fffdfd;
}

/* Replies use a single soft left rail instead of a full card border. */
.waline-comments #waline-comments-mount .wl-quote > .wl-card-item > .wl-card {
  border: 0 !important;
  border-left: 3px solid #d9c5e8 !important;
  border-radius: 0 !important;
  margin: .7rem 0 .7rem .65rem;
  padding: .25rem .8rem .35rem 1rem;
  background: transparent !important;
  box-shadow: none !important;
}
.waline-comments #waline-comments-mount .wl-quote {
  margin-top: .6rem;
  padding-left: .25rem;
}


/* Make the nickname, optional email / website, and message fields fill
   the available width of the Waline panel without overflowing it. */
.waline-comments #waline-comments-mount .wl-panel,
.waline-comments #waline-comments-mount .wl-header,
.waline-comments #waline-comments-mount .wl-header-item,
.waline-comments #waline-comments-mount .wl-editor,
.waline-comments #waline-comments-mount .wl-textarea-wrapper {
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
}
.waline-comments #waline-comments-mount .wl-header {
  padding: 0 !important;
  display: flex;
  flex-wrap: wrap;
  gap: .75rem;
  width: 100%;
}
.waline-comments #waline-comments-mount .wl-header-item {
  flex: 1 1 14rem;
  width: 100%;
}
.waline-comments #waline-comments-mount .wl-header-item input,
.waline-comments #waline-comments-mount .wl-input,
.waline-comments #waline-comments-mount input[type="text"],
.waline-comments #waline-comments-mount input[type="email"],
.waline-comments #waline-comments-mount input[type="url"],
.waline-comments #waline-comments-mount textarea,
.waline-comments #waline-comments-mount .wl-textarea {
  display: block;
  width: 100% !important;
  max-width: 100% !important;
  min-width: 0 !important;
  box-sizing: border-box !important;
}
.waline-comments #waline-comments-mount .wl-editor,
.waline-comments #waline-comments-mount textarea {
  width: 100% !important;
}

.waline-comments #waline-comments-mount .wl-content {
  line-height: 1.7;
}
.waline-comments #waline-comments-mount .wl-meta {
  color: #8b7c91;
}
.waline-comments #waline-comments-mount img.wl-avatar,
.waline-comments #waline-comments-mount .wl-avatar img,
.waline-comments #waline-comments-mount .wl-user img {
  width: 2.7rem;
  height: 2.7rem;
  object-fit: contain;
  image-rendering: pixelated;
  border: 2px solid #efdce9;
  border-radius: 0 !important;
  background: #fff8fc;
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
