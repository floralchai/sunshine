import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const HYVOR_WEBSITE_ID = "16849"

const lightPalette = {
  text: "#54595d",
  accent: "#7965aa",
  accent_text: "#ffffff",
  box: "#ffffff",
  box_text: "#54595d",
  box_text_light: "#77717f",
  input: "#fbf9fd",
}

const darkPalette = {
  text: "#ece6f0",
  accent: "#aaa6df",
  accent_text: "#17161c",
  box: "#211e27",
  box_text: "#ece6f0",
  box_text_light: "#c8c0d0",
  input: "#17161c",
}

const settings = JSON.stringify({
  profiles: {
    color_theme: "os",
    pictures: true,
    profiles: true,
  },
  comments_view: {
    nested_levels: 3,
  },
  light_palette: lightPalette,
  dark_palette: darkPalette,
  custom_css: `
    body {
      font-family: "Source Serif 4", Georgia, serif;
    }
    button, input, textarea, select {
      font-family: "Nunito", "Trebuchet MS", sans-serif;
    }
  `,
})

const HyvorComments: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
  const pageId = String(fileData.slug ?? "")

  return (
    <section class="hyvor-comments" aria-labelledby="hyvor-comments-title">
      <h2 id="hyvor-comments-title">Comments</h2>
      <script
        async
        type="module"
        src="https://talk.hyvor.com/embed/embed.js"
      />
      <hyvor-talk-comments
        website-id={HYVOR_WEBSITE_ID}
        page-id={pageId}
        settings={settings}
        loading="lazy"
      />
    </section>
  )
}

HyvorComments.css = `
.hyvor-comments {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  margin-block: 2rem 1.5rem;
  padding-top: 1rem;
  border-top: 2px solid #ded5e8;
}
.hyvor-comments h2 {
  margin-top: 0;
  padding-bottom: .45rem;
  border-bottom: 2px solid transparent;
  border-image: linear-gradient(90deg, #e7a0aa, #efbd91, #f1d98b, #a5cfb4, #9fc7e9, #aaa6df, #c5a5dc) 1;
  font-family: "Nunito", "Trebuchet MS", sans-serif;
}
.hyvor-comments hyvor-talk-comments {
  display: block;
  width: 100%;
  max-width: 100%;
  min-width: 0;
}
`

export default (() => HyvorComments) satisfies QuartzComponentConstructor
