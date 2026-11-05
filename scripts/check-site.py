#!/usr/bin/env python3
"""Check page translations and relative resources with only the Python standard library."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import argparse
import json
import re

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

papers = (ROOT / 'papers.html').read_text()
article_pattern = r'<article class="paper">'
count = len(re.findall(article_pattern, papers))
if (f'data-zh="{count} 篇研究成果" data-en="{count} publications">{count} 篇研究成果' not in papers):
    errors.append(f'papers.html: the bilingual publication count must match the {count} articles')

groups = re.findall(r'<section class="paper-group" id="(\d{4})">(.*?)</section>', papers, re.S)
sidebar = re.findall(r'<a href="#(\d{4})">\1<span>(\d+)</span>', papers)
expected_sidebar = []
for year, body in groups:
    group_count = len(re.findall(article_pattern, body))
    expected_sidebar.append((year, f'{group_count:02}'))
    if not group_count or f'<h2>{year}</h2>\n<span>{group_count:02}</span>' not in body:
        errors.append(f'papers.html: incorrect heading or count for {year}')
if (not count or sum(int(number) for _, number in expected_sidebar) != count
        or sidebar != expected_sidebar or len({year for year, _ in groups}) != len(groups)):
    errors.append('papers.html: publication groups and year navigation must match')
if errors:
    raise SystemExit('\n'.join(errors))
print(f'PASS: {len(PAGES)} bilingual pages, shared appearance controls, relative assets, and {count} publications with matching year counts.')
