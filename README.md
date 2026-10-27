# AIMG website

Static Chinese–English website for the Affective Intelligence & Multimodal Group.

## 在线访问 / Live site

**[打开网站 / Visit the website](https://3061988077qq-glitch.github.io/mysee1989.github.io/)**

网站已通过 GitHub Pages 发布，可以直接在浏览器中访问，无需下载仓库或启动本地服务。
The website is published on GitHub Pages and can be opened directly in a browser.

点击页面上的「中文 / English」切换语言；所选语言会在站内页面之间保持。
外观默认跟随系统，也可以手动选择日间或夜间模式。

## 发布 / Deployment

GitHub Pages 从本仓库的 `master` 分支、`/ (root)` 目录发布。
提交合并到 `master` 后，GitHub 会自动构建并更新线上网站；发布状态可在
[Actions](https://github.com/3061988077qq-glitch/mysee1989.github.io/actions) 中查看。

GitHub Pages publishes from `master` at `/ (root)`. Updates to `master` trigger
an automatic deployment. This fork has its own site URL, separate from the upstream site.

## 本地开发预览 / Local development preview

以下命令仅供修改代码时在本机预览；访问已发布的网站请使用上方在线链接。
The following steps are only for local development.

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

Before merging changes, review the Chinese and English pages, both appearance modes,
and video playback in the intended browsers. After deployment, verify the live site
using the GitHub Pages link above.
