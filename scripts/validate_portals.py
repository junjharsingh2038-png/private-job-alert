#!/usr/bin/env python3
"""Static regression checks for HR, employee and job application entry pages."""
from html.parser import HTMLParser
from pathlib import Path
import subprocess
import tempfile
import sys

ROOT = Path(__file__).resolve().parents[1]
PAGES = ("index.html", "hr.html", "seeker.html", "apply.html")

class Scripts(HTMLParser):
    def __init__(self):
        super().__init__()
        self.srcs = []
        self.inline = []
        self.active = False
        self.parts = []
    def handle_starttag(self, tag, attrs):
        if tag.lower() != "script":
            return
        attrs = dict(attrs)
        if attrs.get("src"):
            self.srcs.append(attrs["src"])
        elif attrs.get("type", "").lower() not in ("application/ld+json", "application/json"):
            self.active = True
            self.parts = []
    def handle_data(self, data):
        if self.active:
            self.parts.append(data)
    def handle_endtag(self, tag):
        if tag.lower() == "script" and self.active:
            self.inline.append("".join(self.parts))
            self.active = False
            self.parts = []

errors = []
checked_scripts = set()
for page in PAGES:
    path = ROOT / page
    if not path.is_file():
        errors.append(f"{page}: entry page missing")
        continue
    parser = Scripts()
    parser.feed(path.read_text(encoding="utf-8"))
    for src in parser.srcs:
        if src.startswith(("http://", "https://", "//", "data:")):
            continue
        local = src.split("?", 1)[0].split("#", 1)[0]
        target = (path.parent / local).resolve()
        if not target.is_file():
            errors.append(f"{page}: local script missing: {src}")
        else:
            checked_scripts.add(target)
    for i, code in enumerate(parser.inline, 1):
        if not code.strip():
            continue
        with tempfile.NamedTemporaryFile("w", suffix=".js", encoding="utf-8", delete=False) as tmp:
            tmp.write(code)
            temp_path = Path(tmp.name)
        result = subprocess.run(["node", "--check", str(temp_path)], text=True, capture_output=True)
        temp_path.unlink(missing_ok=True)
        if result.returncode:
            errors.append(f"{page}: inline script #{i} syntax error: {result.stderr.strip()}")

for path in sorted(checked_scripts):
    result = subprocess.run(["node", "--check", str(path)], text=True, capture_output=True)
    if result.returncode:
        errors.append(f"{path.relative_to(ROOT)}: JavaScript syntax error: {result.stderr.strip()}")

if errors:
    print("\n".join("ERROR: " + e for e in errors), file=sys.stderr)
    raise SystemExit(1)
print(f"Portal static checks passed: {len(PAGES)} entry pages, {len(checked_scripts)} linked local scripts and inline scripts.")
