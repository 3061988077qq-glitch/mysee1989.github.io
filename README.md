# AIMG website

Static Chinese–English website for the Affective Intelligence & Multimodal Group.

## Preview

Run from the repository root:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Then visit http://127.0.0.1:8765/. No build step or package installation is needed.
Relative paths work both at a domain root and under a GitHub Pages project path.

## Pages and preferences

- `index.html`: full-viewport research video, research overview, selected publications, news.
- `research.html`, `papers.html`, `people.html`, `contact.html`, `showcase.html`: bilingual sections.
- `news-chinamm.html`, `news-csig.html`: bilingual event details.
- `app.js`: shared language selection, theme controls, and video playback management.
- `theme-init.js`: resolves the saved appearance or system preference before styles load.
- `styles.css`: responsive typography and light/dark surfaces.

Language and appearance selections persist in localStorage and synchronize between tabs.
Appearance follows the system unless the visitor explicitly selects Light or Dark.
Original Chinese and English page paths redirect to the corresponding new page.
External academic profiles and third-party sites retain their own language settings.

## Assets and source documents

The video in `assets/hero-web.mp4` is a web-optimized copy of the original
`wp-content/uploads/2026/03/final2.mp4`: H.264, 1920×1070, 30 fps, 21.8 seconds,
no audio, approximately 8.4 MB. Its framing and duration are preserved. The
source video remains in the repository. The video contains original Chinese
text; changing the interface language does not translate burned-in video text.

Publication figures and the downloadable research PDF use the existing
`wp-content` assets. The research page provides an English summary; the source
slide deck and PDF remain Chinese. The model showcase is marked as coming soon.

Publication metadata follows the original site, including its original dates.

## Validation

```sh
node --check app.js
node --check theme-init.js
node tests/preferences.test.cjs
python3 scripts/check-site.py
```

Before deployment, review the Chinese and English pages, both appearance modes,
and video playback in the intended browsers. Merging a PR does not itself enable
GitHub Pages on a fork; configure Pages separately if a preview deployment is needed.
