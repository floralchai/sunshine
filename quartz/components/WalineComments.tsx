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

    const walineRoot = target.querySelector("[data-waline]");
    if (!walineRoot) return false;

    // Waline renders this button only when its comment request fails.
    // Remove only the Refresh retry control; never remove Load More or Submit.
    const refreshButton = [...walineRoot.querySelectorAll(".wl-operation > .wl-btn")]
      .find((button) => {
        const label = button.textContent?.trim().toLowerCase() ?? "";
        return label === "refresh" || label === "";
      });

    if (refreshButton) {
      refreshButton.remove();
      setWalineStatus(target, "Comments are temporarily unavailable. Please try again later.", true);
      return false;
    }

    // A comment card or the empty-state message means the request completed.
    if (walineRoot.querySelector(".wl-card, .wl-empty")) {
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
        // Use one shared Waline thread across every page of tawnyflor.neocities.org.
        path: "/",
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
        // au by KDDI Type F (2012) reaction artwork.
        reaction: [
          "https://em-content.zobj.net/source/au-kddi/190/sparkles_2728.png",
          "https://em-content.zobj.net/source/au-kddi/190/heavy-black-heart_2764.png",
          "https://em-content.zobj.net/source/au-kddi/190/astonished-face_1f632.png",
          "https://em-content.zobj.net/source/au-kddi/190/crying-face_1f622.png",
          "https://em-content.zobj.net/source/au-kddi/190/face-with-tears-of-joy_1f602.png",
        ],
        locale: {
          // Keep the error state quiet; the page-level status handles the message.
          refresh: "",
          reactionTitle: "How does this page make you feel?",
          reaction0: "Superb",
          reaction1: "Love",
          reaction2: "Wow",
          reaction3: "Sad",
          reaction4: "Laugh",
        },
      });
      state.target = target;
      state.currentPath = path;
      watchChiikawaAvatars();
      watchWalineReady(target);
    })
    .catch((error) => {
      setWalineStatus(target, "Comments are temporarily unavailable.", true);
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
          <button type="button" class="waline-feeling-chip waline-feeling-lilac" data-waline-feeling="☆ Interesting" aria-pressed="false">☆ Interesting</button>
          <button type="button" class="waline-feeling-chip waline-feeling-mint" data-waline-feeling="↻ Still thinking" aria-pressed="false">↻ Still thinking</button>
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
  border-image: linear-gradient(90deg, #c7a6ef, #e7a6dc, #f0c4e8, #c9b5f2, #a9a5ee, #bda7ee, #d7a8e8) 1;
}
.waline-comments h2 {
  margin: 0 0 .35rem;
  padding-bottom: .45rem;
  border-bottom: 2px solid transparent;
  border-image: linear-gradient(90deg, #c7a6ef, #e7a6dc, #f0c4e8, #c9b5f2, #a9a5ee, #bda7ee, #d7a8e8) 1;
  font-family: "Nunito", "Trebuchet MS", sans-serif;
  color: #563a86;
}
.waline-comments-intro {
  margin: .25rem 0 1rem;
  color: #766b86;
  font-size: .95rem;
}
.waline-feeling-prompt {
  margin: 1rem 0 1.15rem;
  padding: 1rem 1.1rem;
  border: 2px solid transparent;
  border-radius: 14px;
  background:
    linear-gradient(120deg, #fff8fb 0%, #fff9f0 17%, #fbfff2 34%, #f1fffb 51%, #f2f7ff 68%, #f8f2ff 84%, #fff4fb 100%) padding-box,
    linear-gradient(90deg, #f3b8c9, #f7d2a7, #f4e7a6, #c8e7bd, #b9e2e5, #c6c5f1, #e1c1ec) border-box;
  box-shadow: 0 2px 10px rgba(190, 160, 205, .08);
}
.waline-feeling-title {
  margin: 0 0 .7rem;
  width: fit-content;
  color: #8a6a9d;
  background: linear-gradient(90deg, #d783a7, #d99a65, #b7a34f, #79a978, #68a6ad, #8585c2, #ad7dbb);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
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
  padding: .4rem .76rem;
  border: 1.5px solid currentColor;
  border-radius: 999px;
  cursor: pointer;
  font-family: "Nunito", "Trebuchet MS", sans-serif;
  font-size: .88rem;
  font-weight: 700;
  line-height: 1.35;
}
.waline-feeling-pink {
  color: #a65f83;
  background: #fff0f5;
  border-color: #efbfd0;
}
.waline-feeling-peach {
  color: #a8754f;
  background: #fff4e9;
  border-color: #f1d0b1;
}
.waline-feeling-lilac {
  color: #7765a8;
  background: #f3efff;
  border-color: #d2c7f0;
}
.waline-feeling-mint {
  color: #638d78;
  background: #effaf2;
  border-color: #c6e5cd;
}
.waline-feeling-chip[aria-pressed="true"] {
  outline: 2px solid currentColor;
  outline-offset: 2px;
  box-shadow: 0 2px 8px rgba(150, 120, 170, .12);
}
.waline-feeling-chip:focus-visible {
  outline: 2px solid #9c78b5;
  outline-offset: 3px;
}
.waline-feeling-hint {
  margin: .7rem 0 0;
  color: #8c7d98;
  font-size: .82rem;
}
.waline-setup-notice {
  display: flex;
  align-items: center;
  gap: .8rem;
  padding: 1rem 1.1rem;
  border: 1px dashed #d7a8e8;
  border-radius: 8px;
  background: linear-gradient(110deg, #fff8fb, #f4edff, #f1eaff);
  color: #634b83;
}
.waline-setup-notice p {
  margin: 0;
}
.waline-setup-flower {
  flex: 0 0 auto;
  color: #9564c2;
  font-size: 1.5rem;
}
.waline-loading-status {
  margin: .75rem 0;
  padding: .65rem .85rem;
  border: 1px dashed #cbb5e8;
  background: #f7f1ff;
  color: #70548f;
  font-family: "Nunito", "Trebuchet MS", sans-serif;
  font-size: .9rem;
}
.waline-loading-status[hidden] {
  display: none !important;
}
.waline-comments #waline-comments-mount {
  --waline-font-size: 15px;
  --waline-theme-color: #9b83c9;
  --waline-active-color: #6941a0;
  --waline-color: #554b62;
  --waline-bg-color: #fffaff;
  --waline-bg-color-light: #f8f3ff;
  --waline-bg-color-hover: #eee5fa;
  --waline-border-color: #d9c9ed;
  --waline-disable-bg-color: #f3edfa;
  --waline-disable-color: #9b8ba9;
  --waline-bq-color: #eee6fa;
  --waline-badge-color: #a9a5ee;
  --waline-info-bg-color: #f5efff;
  --waline-info-color: #796b8c;
  --waline-border: 2px solid var(--waline-border-color);
  --waline-avatar-radius: 0px;
  --waline-box-shadow: none;
  color: #554b62;
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
  border: 2px solid #e2d2f3 !important;
  border-radius: 12px;
  background: linear-gradient(145deg, #faf6ff 0%, #fbf9ff 58%, #f2edff 100%);
}
.waline-comments #waline-comments-mount .wl-header {
  border-bottom: 1px dashed #e8d8e9;
}
.waline-comments #waline-comments-mount .wl-input,
.waline-comments #waline-comments-mount .wl-textarea,
.waline-comments #waline-comments-mount textarea,
.waline-comments #waline-comments-mount input {
  border: 2px solid #dfd0f0 !important;
  border-radius: .5rem !important;
  margin: .35rem 0 .8rem !important;
  background: #fdfaff !important;
  color: #58466d;
}
.waline-comments #waline-comments-mount .wl-input:focus,
.waline-comments #waline-comments-mount .wl-textarea:focus,
.waline-comments #waline-comments-mount textarea:focus,
.waline-comments #waline-comments-mount input:focus {
  border-color: #aa8bd6 !important;
  outline: 2px solid #e7d9f6;
  outline-offset: 1px;
  background: #fffaff !important;
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
  border: 2px solid #cbb5e8 !important;
  border-radius: 0 !important;
  background: #eee5fb !important;
  color: #684c8a !important;
  font-weight: 800;
  letter-spacing: .01em;
  box-shadow: none !important;
  cursor: pointer;
}
.waline-comments #waline-comments-mount .wl-btn:hover,
.waline-comments #waline-comments-mount .wl-btn.primary:hover {
  border-color: #cbb5e8 !important;
  background: #f3edff !important;
  color: #694a91 !important;
  animation: none;
  transition: none;
}
.waline-comments #waline-comments-mount .wl-btn:active,
.waline-comments #waline-comments-mount .wl-btn.primary:active {
  transform: translate(1px, 1px);
}
.waline-comments #waline-comments-mount .wl-btn:focus-visible {
  outline: 3px solid #c7b2eb;
  outline-offset: 2px;
}
.waline-comments #waline-comments-mount .wl-card {
  border-radius: 10px;
  background: #fdfaff;
}

/* Replies use a single soft left rail instead of a full card border. */
.waline-comments #waline-comments-mount .wl-quote > .wl-card-item > .wl-card {
  border: 0 !important;
  border-left: 3px solid #cbb5e8 !important;
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
  color: #81708f;
}
.waline-comments #waline-comments-mount img.wl-avatar,
.waline-comments #waline-comments-mount .wl-avatar img,
.waline-comments #waline-comments-mount .wl-user img {
  width: 2.7rem;
  height: 2.7rem;
  object-fit: contain;
  border: 2px solid #e2d2f3;
  border-radius: 0 !important;
  background: #fff8fc;
}
/* Waline emoji assets are original SVGs with a 24×24 viewBox and
   crispEdges geometry. Target the image itself (Waline renders .wl-emoji
   as the <img>, not as a wrapper) so popup, preview and posted emojis stay
   sharp at every device-pixel ratio. */
.waline-comments #waline-comments-mount img.wl-emoji,
.waline-comments #waline-comments-mount img.wl-emoji-preview {
  display: inline-block;
  max-width: none;
  object-fit: contain;
  vertical-align: middle;
}
.waline-comments #waline-comments-mount img.wl-emoji {
  width: 1.5rem;
  height: 1.5rem;
}
.waline-comments #waline-comments-mount img.wl-emoji-preview {
  width: 3rem;
  height: 3rem;
}

/* Waline toolbar controls use inline SVG icons, so keep them vector-scaled
   instead of applying pixel-art raster scaling to the icon artwork. */
.waline-comments #waline-comments-mount .wl-action svg {
  display: block;
  width: 1.25rem;
  height: 1.25rem;
  max-width: none;
  shape-rendering: geometricPrecision;
}

/* Keep Waline's native reaction layout; soften only the numeric count chips. */
.waline-comments #waline-comments-mount .wl-reaction .wl-reaction-count,
.waline-comments #waline-comments-mount .wl-reaction-count,
.waline-comments #waline-comments-mount .wl-reaction-item .wl-reaction-count,
.waline-comments #waline-comments-mount .wl-reaction-vote {
  border-radius: 50% !important;
  border-color: #cbb5e8 !important;
  background-color: #f3edff !important;
  color: #684c8a !important;
}

/* Pastel rainbow finish: keep Waline's familiar, compact native form layout,
   while bringing soft colour into the borders, labels, buttons and text. */
.waline-comments #waline-comments-mount {
  --waline-theme-color: #c5a4e8;
  --waline-active-color: #9874c7;
  --waline-color: #62566f;
  --waline-bg-color: #fff;
  --waline-bg-color-light: #fffafd;
  --waline-bg-color-hover: #fff4fa;
  --waline-border-color: #e5d9ed;
  --waline-disable-bg-color: #faf6fc;
  --waline-disable-color: #b2a5bc;
  --waline-bq-color: #f8effa;
  --waline-badge-color: #c7b2e8;
  --waline-info-bg-color: #fff8fc;
  --waline-info-color: #8a7b91;
  color: #62566f;
  font-family: Georgia, "Times New Roman", serif;
}
.waline-comments #waline-comments-mount .wl-panel {
  border: 1px solid #ded7e5 !important;
  border-radius: 14px !important;
  padding: .65rem !important;
  background: #fff !important;
}
.waline-comments #waline-comments-mount .wl-header {
  border-bottom: 1px dashed #e7dfe9 !important;
  gap: .45rem;
}
.waline-comments #waline-comments-mount .wl-header-item,
.waline-comments #waline-comments-mount .wl-header-item label,
.waline-comments #waline-comments-mount .wl-header-item input,
.waline-comments #waline-comments-mount .wl-input,
.waline-comments #waline-comments-mount textarea,
.waline-comments #waline-comments-mount .wl-textarea {
  font-family: Georgia, "Times New Roman", serif !important;
  color: #6d5b7d !important;
}
.waline-comments #waline-comments-mount .wl-header-item:nth-child(1) label,
.waline-comments #waline-comments-mount .wl-header-item:nth-child(1) input {
  color: #a77fc8 !important;
}
.waline-comments #waline-comments-mount .wl-header-item:nth-child(2) label,
.waline-comments #waline-comments-mount .wl-header-item:nth-child(2) input {
  color: #d28eae !important;
}
.waline-comments #waline-comments-mount .wl-header-item:nth-child(3) label,
.waline-comments #waline-comments-mount .wl-header-item:nth-child(3) input {
  color: #8e9fc9 !important;
}
.waline-comments #waline-comments-mount .wl-header-item input,
.waline-comments #waline-comments-mount textarea,
.waline-comments #waline-comments-mount .wl-textarea {
  border-color: #e6dce9 !important;
  background: #fff !important;
}
.waline-comments #waline-comments-mount textarea::placeholder,
.waline-comments #waline-comments-mount input::placeholder {
  color: #b49ebd !important;
  opacity: 1;
}
.waline-comments #waline-comments-mount .wl-btn,
.waline-comments #waline-comments-mount .wl-btn.primary {
  border: 1px solid #d9c9eb !important;
  border-radius: 8px !important;
  background: #fff0f5 !important;
  color: #806493 !important;
  font-family: Georgia, "Times New Roman", serif !important;
  font-weight: 600;
}
.waline-comments #waline-comments-mount .wl-btn:hover,
.waline-comments #waline-comments-mount .wl-btn.primary:hover {
  border-color: #c8addf !important;
  background: #e2f1ff !important;
  color: #76558f !important;
  animation: none;
  transition: none;
}
.waline-comments #waline-comments-mount .wl-count,
.waline-comments #waline-comments-mount .wl-meta,
.waline-comments #waline-comments-mount .wl-sort {
  color: #9a87a8 !important;
  font-family: Georgia, "Times New Roman", serif !important;
}
.waline-comments #waline-comments-mount .wl-nick {
  color: #9873b7 !important;
}
.waline-comments #waline-comments-mount .wl-content {
  color: #65576f !important;
  font-family: Georgia, "Times New Roman", serif !important;
}
.waline-comments #waline-comments-mount .wl-reaction-count,
.waline-comments #waline-comments-mount .wl-reaction-vote,
.waline-comments #waline-comments-mount .wl-reaction-list .wl-reaction-votes {
  border: 1px solid #e2d3ed !important;
  border-radius: .5rem !important;
  background: linear-gradient(110deg, #f5edff, #fff0f6, #edf6ff) !important;
  color: #8a6ca4 !important;
}
.waline-comments #waline-comments-mount .wl-card {
  border-color: #e8deed !important;
  background: #fff !important;
  border-radius: .5rem !important;
  padding: .75rem !important; 
}
.waline-comments #waline-comments-mount .wl-quote > .wl-card-item > .wl-card {
  border-left-color: #d8c2eb !important;
}
.waline-comments #waline-comments-mount .wl-avatar img,
.waline-comments #waline-comments-mount img.wl-avatar,
.waline-comments #waline-comments-mount .wl-user img {
  border-color: #eadced !important;
  background: linear-gradient(135deg, #fff2f7, #f1edff, #edf7ff) !important;
}

/* Pastel feeling panel and its outline use matching soft corners. */
.waline-comments .waline-feeling-prompt {
  border-radius: .5rem !important;
}
.waline-comments .waline-feeling-chip {
  border-radius: .5rem !important;
}

/* Disable easing and transitions anywhere inside the comment box while hovered. */
.waline-comments #waline-comments-mount:hover,
.waline-comments #waline-comments-mount:hover * {
  transition: none !important;
  animation: none !important;
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
