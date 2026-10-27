#!/usr/bin/env python3
"""Check page translations and relative resources with only the Python standard library."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import argparse
import json

ROOT = Path(__file__).resolve().parent.parent
PAGES = ['index.html', 'research.html', 'papers.html', 'people.html', 'contact.html',
         'showcase.html', 'news-chinamm.html', 'news-csig.html']

class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.elements = []
    def handle_starttag(self, tag, attrs):
        self.elements.append((tag, dict(attrs)))

parser = argparse.ArgumentParser()
parser.add_argument('--base-manifest', type=Path, help='Optional existing repository paths for a patch-only checkout')
args = parser.parse_args()
known = set(json.loads(args.base_manifest.read_text())) if args.base_manifest else set()
errors = []
for name in PAGES:
    page = Page()
    text = (ROOT / name).read_text()
    page.feed(text)
    for tag, attrs in page.elements:
        if 'data-zh' in attrs and 'data-en' not in attrs:
            errors.append(f'{name}: untranslated {tag}')
        if tag == 'body' and ('data-title-zh' not in attrs or 'data-title-en' not in attrs):
            errors.append(f'{name}: missing localized document title')
        for field in ('href', 'src', 'poster'):
            url = urlsplit(attrs.get(field, ''))
            if url.scheme or url.netloc or not url.path:
                continue
            path = unquote(url.path)
            if path.startswith('/'):
                errors.append(f'{name}: absolute path {path} breaks project deployments')
            elif not (ROOT / path).is_file() and path not in known:
                errors.append(f'{name}: missing resource {path}')
    for required in ('data-theme-choice="system"', 'data-theme-choice="light"',
                     'data-theme-choice="dark"', 'theme-init.js', 'data-lang="en"'):
        if required not in text:
            errors.append(f'{name}: missing {required}')
    if any(symbol in text for symbol in ('↗', '↓', '→')):
        errors.append(f'{name}: decorative arrow')

publication_page = Page()
publication_page.feed((ROOT / 'papers.html').read_text())
count = sum(tag == 'article' and 'paper' in attrs.get('class', '').split()
            for tag, attrs in publication_page.elements)
if count != 18:
    errors.append(f'Expected 18 original publications, got {count}')
if errors:
    raise SystemExit('\n'.join(errors))
print(f'PASS: {len(PAGES)} bilingual pages, shared appearance controls, relative assets, and 18 publications.')
