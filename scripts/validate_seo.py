#!/usr/bin/env python3
"""Validate generated SEO pages and sitemap without external dependencies."""
import json
import sys
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://junjharsingh2038-png.github.io/private-job-alert"
NS = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}

class HeadParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.canonicals = []
        self.jsonld = []
        self._jsonld = False
        self._buffer = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "link" and attrs.get("rel", "").lower() == "canonical":
            self.canonicals.append(attrs.get("href", ""))
        if tag == "script" and attrs.get("type", "").lower() == "application/ld+json":
            self._jsonld = True
            self._buffer = []

    def handle_data(self, data):
        if self._jsonld:
            self._buffer.append(data)

    def handle_endtag(self, tag):
        if tag == "script" and self._jsonld:
            self.jsonld.append("".join(self._buffer))
            self._jsonld = False
            self._buffer = []

def fail(message):
    print(f"ERROR: {message}", file=sys.stderr)
    raise SystemExit(1)

sitemap_path = ROOT / "sitemap.xml"
if not sitemap_path.is_file():
    fail("sitemap.xml is missing")
try:
    tree = ET.parse(sitemap_path)
except ET.ParseError as exc:
    fail(f"sitemap.xml is invalid XML: {exc}")

locations = [node.text or "" for node in tree.findall(".//sm:loc", NS)]
if not locations:
    fail("sitemap.xml contains no URLs")
if len(locations) != len(set(locations)):
    fail("sitemap.xml contains duplicate URLs")

for url in locations:
    if not url.startswith(BASE + "/") and url != BASE + "/":
        fail(f"URL is outside the configured site: {url}")
    path = url[len(BASE):].lstrip("/")
    target = ROOT / path / "index.html" if path.endswith("/") or not path else ROOT / path
    if url == BASE + "/":
        target = ROOT / "index.html"
    if not target.is_file():
        fail(f"sitemap URL has no matching published file: {url}")

job_pages = sorted(p for p in (ROOT / "jobs").glob("*/index.html") if p.parent != ROOT / "jobs")
if not job_pages:
    fail("No generated individual job pages were found")

for page in job_pages:
    html = page.read_text(encoding="utf-8")
    parser = HeadParser()
    parser.feed(html)
    expected = f"{BASE}/jobs/{page.parent.name}/"
    if expected not in parser.canonicals:
        fail(f"{page.relative_to(ROOT)} has missing or incorrect canonical URL")
    schemas = []
    for raw in parser.jsonld:
        try:
            schemas.append(json.loads(raw))
        except json.JSONDecodeError as exc:
            fail(f"{page.relative_to(ROOT)} has invalid JSON-LD: {exc}")
    postings = [s for s in schemas if s.get("@type") == "JobPosting"]
    if len(postings) != 1:
        fail(f"{page.relative_to(ROOT)} must contain exactly one JobPosting schema")
    posting = postings[0]
    for field in ("title", "description", "datePosted", "hiringOrganization", "url"):
        if not posting.get(field):
            fail(f"{page.relative_to(ROOT)} JobPosting is missing {field}")
    if posting["url"] != expected:
        fail(f"{page.relative_to(ROOT)} JobPosting URL does not match its canonical URL")

print(f"SEO validation passed: {len(job_pages)} job pages, {len(locations)} unique sitemap URLs.")
