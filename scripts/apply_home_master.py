from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
SKIP = {"mark-attendance.html", "admin-login.html"}

def rel_prefix(path: Path) -> str:
    return "../" * len(path.parent.parts)

def shared_header(prefix: str) -> str:
    home, seeker, hr = prefix + "index.html", prefix + "seeker.html", prefix + "hr.html"
    return f"""<header class="site-header">
<a class="brand" href="{home}"><img class="brand-mark" src="{prefix}pja-logo.svg" alt="Private Job Alert logo"><span class="brand-copy"><strong>Private<span>Job</span>Alert</strong><small>LATEST JOBS <i>•</i> RIGHT OPPORTUNITIES <i>•</i> BRIGHT FUTURE</small></span></a>
<nav class="main-nav"><a href="{home}">⌂ <span>Home</span></a><a href="{seeker}">▣ <span>Job Seekers</span></a><a href="{hr}">♟ <span>HR Portal</span></a><a href="{prefix}jobs/">▤ <span>Latest Jobs</span></a><a href="{home}#about">● <span>About Us</span></a><a href="{home}#contact">☎ <span>Contact</span></a></nav>
<div class="header-actions"><a class="login-link" href="{seeker}">♙ Login</a><a class="register-link" href="{seeker}">♟ Register</a></div>
</header>"""

def transform(path: Path):
    if path.name in SKIP or (path.name == "index.html" and path.parent == ROOT):
        return False
    try:
        html = path.read_text(encoding="utf-8")
    except (UnicodeDecodeError, OSError):
        return False
    if "<html" not in html.lower() or "<head" not in html.lower():
        return False
    prefix = rel_prefix(path)
    header = shared_header(prefix)
    if re.search(r"<header\b[\s\S]*?</header>", html, re.I):
        html = re.sub(r"<header\b[\s\S]*?</header>", lambda _: header, html, count=1, flags=re.I)
    elif re.search(r"<body[^>]*>", html, re.I):
        html = re.sub(r"<body[^>]*>", lambda m: m.group(0) + header, html, count=1, flags=re.I)
    else:
        return False
    for name in ("style.css", "homepage-overrides.css"):
        href = prefix + name + "?v=home-master-20261118"
        pattern = r'<link\b[^>]*href=["\'][^"\']*' + re.escape(name) + r'(?:\?[^"\']*)?["\'][^>]*>\s*'
        html = re.sub(pattern, "", html, flags=re.I)
        html = re.sub(r"</head>", f'<link rel="stylesheet" href="{href}"></head>', html, count=1, flags=re.I)
    path.write_text(html, encoding="utf-8")
    return True

changed = []
for path in ROOT.rglob("*.html"):
    if ".git" not in path.parts and transform(path):
        changed.append(str(path.relative_to(ROOT)))
print(f"Applied homepage master design to {len(changed)} pages:")
print("\n".join(changed))
