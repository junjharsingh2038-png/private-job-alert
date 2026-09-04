import json
import re
import shutil
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from html import escape
from pathlib import Path

BASE = 'https://junjharsingh2038-png.github.io/private-job-alert'
SUPABASE_URL = 'https://rlidcatrwonemshwzafp.supabase.co'
SUPABASE_KEY = 'sb_publishable_ocJhWyfPg9rVhYROn_Vj0Q_DSSgxeuE'
ROOT = Path(__file__).resolve().parents[1]
JOBS_DIR = ROOT / 'jobs'
JOBS_DIR.mkdir(exist_ok=True)

params = urllib.parse.urlencode({'select': 'id,title,company,location,qualification,salary,job_type,description,hr_email,created_at','is_active': 'eq.true','order': 'created_at.desc','limit': '1000'})
request = urllib.request.Request(f'{SUPABASE_URL}/rest/v1/jobs?{params}', headers={'apikey': SUPABASE_KEY, 'Authorization': f'Bearer {SUPABASE_KEY}'})
with urllib.request.urlopen(request, timeout=30) as response:
    jobs = json.loads(response.read().decode('utf-8'))

def slug(value):
    return re.sub(r'[^a-zA-Z0-9]+', '-', str(value or '').strip().lower()).strip('-') or 'job'

def job_slug(job):
    return f"{slug(job.get('title'))}-{slug(job.get('company'))}-{str(job.get('id'))[:8]}"

def clean_text(value, fallback=''):
    text = re.sub(r'<[^>]+>', ' ', str(value or ''))
    text = re.sub(r'\s+', ' ', text).strip()
    return text or fallback

def employment_type(value):
    v = str(value or '').strip().lower()
    if 'intern' in v: return 'INTERN'
    if 'contract' in v: return 'CONTRACTOR'
    if 'part' in v: return 'PART_TIME'
    if 'temporary' in v or 'temp' in v: return 'TEMPORARY'
    if 'volunteer' in v: return 'VOLUNTEER'
    if 'per diem' in v: return 'PER_DIEM'
    if 'full' in v: return 'FULL_TIME'
    return 'OTHER'

def html_description(text):
    parts = [p.strip() for p in re.split(r'\n\s*\n|\n', text) if p.strip()]
    return ''.join('<p>' + escape(p) + '</p>' for p in parts) or '<p>Job details available from the employer.</p>'

def page(job):
    raw_title = clean_text(job.get('title'), 'Private Job')
    raw_company = clean_text(job.get('company'), 'Employer')
    raw_location = clean_text(job.get('location'), 'Rajasthan')
    raw_qualification = clean_text(job.get('qualification'), 'Any qualification')
    raw_salary = clean_text(job.get('salary'), 'As per company')
    raw_type = clean_text(job.get('job_type'), 'Full Time')
    raw_description = clean_text(job.get('description'), f'Apply for {raw_title} at {raw_company} in {raw_location}.')
    jid = str(job.get('id'))
    url = f'{BASE}/jobs/{job_slug(job)}/'
    date_posted = str(job.get('created_at') or '')[:10]
    title = escape(raw_title)
    company = escape(raw_company)
    location = escape(raw_location)
    qualification = escape(raw_qualification)
    salary = escape(raw_salary)
    job_type = escape(raw_type)
    description = escape(raw_description)
    schema_description = html_description(raw_description)
    meta_description = escape((f'{raw_title} at {raw_company} in {raw_location}. Qualification: {raw_qualification}. Salary: {raw_salary}. Apply online for this private job in Rajasthan.')[:158], quote=True)
    safe_url = escape(url, quote=True)
    schema = json.dumps({'@context': 'https://schema.org','@type': 'JobPosting','title': raw_title,'description': schema_description,'identifier': {'@type': 'PropertyValue','name': raw_company,'value': jid},'datePosted': date_posted,'hiringOrganization': {'@type': 'Organization','name': raw_company},'jobLocation': {'@type': 'Place','address': {'@type': 'PostalAddress','addressLocality': raw_location,'addressCountry': 'IN'}},'employmentType': employment_type(raw_type),'url': url}, ensure_ascii=False).replace('</', '<\\/')
    breadcrumb = json.dumps({'@context': 'https://schema.org','@type': 'BreadcrumbList','itemListElement': [{'@type': 'ListItem','position': 1,'name': 'Home','item': f'{BASE}/'},{'@type': 'ListItem','position': 2,'name': 'Latest Jobs','item': f'{BASE}/jobs/'},{'@type': 'ListItem','position': 3,'name': raw_title,'item': url}]}, ensure_ascii=False).replace('</', '<\\/')
    html = '''<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>__TITLE__ | __COMPANY__ | Private Jobs Rajasthan</title>
<meta name="description" content="__META_DESCRIPTION__"><meta name="robots" content="index,follow,max-image-preview:large">
<link rel="canonical" href="__URL__"><meta property="og:type" content="website"><meta property="og:title" content="__TITLE__ | __COMPANY__ | Private Jobs Rajasthan"><meta property="og:description" content="__META_DESCRIPTION__"><meta property="og:url" content="__URL__"><meta name="twitter:card" content="summary"><meta name="twitter:title" content="__TITLE__ | __COMPANY__"><meta name="twitter:description" content="__META_DESCRIPTION__">
<link rel="stylesheet" href="../../style.css"><script type="application/ld+json">__SCHEMA__</script><script type="application/ld+json">__BREADCRUMB__</script>
</head><body><header><div class="brand">💼 PRIVATE JOB ALERT RAJASTHAN</div><nav><a href="../../">Home</a> <a href="../../#jobs">Latest Jobs</a> <a href="../../categories/">Job Categories</a></nav></header>
<main><article class="job" style="max-width:900px;margin:30px auto"><p class="muted"><a href="../../">Home</a> › <a href="../../#jobs">Latest Jobs</a> › __TITLE__</p><h1>__TITLE__</h1><h2>__COMPANY__</h2><p class="muted">📍 __LOCATION__ &nbsp; 🎓 __QUALIFICATION__ &nbsp; 💰 __SALARY__ &nbsp; 🕒 __JOB_TYPE__</p><hr><h3>Job Description</h3><p>__DESCRIPTION__</p><h3>How to Apply</h3><p>Click Apply Now and submit your candidate details and resume. Your application will be sent to the HR email configured for this vacancy.</p><button class="apply" id="applyButton">Apply Now →</button><p><a href="../../">← View Latest Private Jobs in Rajasthan</a></p></article></main>
<div id="modal" class="modal hidden"><div class="box"><button class="close" onclick="closeModal()">×</button><div id="modalContent"></div></div></div><script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script><script src="../../app.js"></script><script>document.getElementById("applyButton").addEventListener("click", async function () {const r = await sb.from("jobs").select("id,title,company,location,qualification,salary,job_type,description,hr_email,created_at").eq("id", __JOB_ID__).eq("is_active", true).single();if (r.error || !r.data) { alert("This job is no longer available."); return; }openApply(r.data);});</script></body></html>'''
    return html.replace('__TITLE__', title).replace('__COMPANY__', company).replace('__LOCATION__', location).replace('__QUALIFICATION__', qualification).replace('__SALARY__', salary).replace('__JOB_TYPE__', job_type).replace('__DESCRIPTION__', description).replace('__META_DESCRIPTION__', meta_description).replace('__URL__', safe_url).replace('__SCHEMA__', schema).replace('__BREADCRUMB__', breadcrumb).replace('__JOB_ID__', json.dumps(jid))

urls = [f'{BASE}/']
CATEGORY_SLUGS = ['10th-pass-jobs-rajasthan','12th-pass-jobs-rajasthan','barmer-private-jobs','bikaner-private-jobs','fresher-jobs-rajasthan','graduate-jobs-rajasthan','jaipur-private-jobs','jaisalmer-private-jobs','jodhpur-private-jobs','work-from-home-jobs-rajasthan']
urls.append(f'{BASE}/categories/')
for category in CATEGORY_SLUGS: urls.append(f'{BASE}/categories/{category}/')
urls.append(f'{BASE}/hr/')
active = set()
for job in jobs:
    name = job_slug(job); active.add(name); folder = JOBS_DIR / name; folder.mkdir(parents=True, exist_ok=True); (folder / 'index.html').write_text(page(job), encoding='utf-8'); urls.append(f'{BASE}/jobs/{name}/')
for folder in JOBS_DIR.iterdir():
    if folder.is_dir() and folder.name not in active: shutil.rmtree(folder)
lastmod = datetime.now(timezone.utc).date().isoformat()
lines = ['<?xml version="1.0" encoding="UTF-8"?>','<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
for url in urls:
    priority = '1.0' if url == BASE + '/' else ('0.9' if '/categories/' in url or url == BASE + '/hr/' else '0.8')
    lines.append(f'<url><loc>{escape(url)}</loc><lastmod>{lastmod}</lastmod><changefreq>daily</changefreq><priority>{priority}</priority></url>')
lines.append('</urlset>')
(ROOT / 'sitemap.xml').write_text('\n'.join(lines) + '\n', encoding='utf-8')
print(f'Generated {len(jobs)} job pages and {len(urls)} sitemap URLs.')
