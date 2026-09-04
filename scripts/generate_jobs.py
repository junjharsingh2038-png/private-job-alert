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

def company_domain(company):
    c = str(company or '').strip().lower()
    if 'genus power infrastructure' in c:
        return 'genuspower.com'
    n = re.sub(r'\b(pvt|private|limited|ltd|llp|inc|india|company|corporation|corp|industries|industry)\b', ' ', c)
    n = re.sub(r'[^a-z0-9]+', ' ', n).strip().split()
    return ''.join(n) + '.com' if n else ''

def company_logo_url(company):
    d = company_domain(company)
    return f'https://www.google.com/s2/favicons?domain={urllib.parse.quote(d)}&sz=256' if d else ''

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

def page(job, related_links):
    raw_title = clean_text(job.get('title'), 'Private Job')
    raw_company = clean_text(job.get('company'), 'Employer')
    raw_location = clean_text(job.get('location'), 'India')
    raw_qualification = clean_text(job.get('qualification'), 'Any qualification')
    raw_salary = clean_text(job.get('salary'), 'As per company')
    raw_type = clean_text(job.get('job_type'), 'Full Time')
    raw_description = clean_text(job.get('description'), f'Apply for {raw_title} at {raw_company} in {raw_location}.')
    jid = str(job.get('id'))
    url = f'{BASE}/jobs/{job_slug(job)}/'
    logo_url = company_logo_url(raw_company)
    date_posted = str(job.get('created_at') or '')[:10]
    title = escape(raw_title); company = escape(raw_company); location = escape(raw_location); qualification = escape(raw_qualification); salary = escape(raw_salary); job_type = escape(raw_type); description = escape(raw_description)
    schema_description = html_description(raw_description)
    meta_description = escape((f'{raw_title} at {raw_company} in {raw_location}. Qualification: {raw_qualification}. Salary: {raw_salary}. Apply online for this private job in India.')[:158], quote=True)
    safe_url = escape(url, quote=True)
    safe_logo = escape(logo_url, quote=True)
    schema = json.dumps({'@context': 'https://schema.org','@type': 'JobPosting','title': raw_title,'description': schema_description,'identifier': {'@type': 'PropertyValue','name': raw_company,'value': jid},'datePosted': date_posted,'hiringOrganization': {'@type': 'Organization','name': raw_company,'logo': logo_url},'jobLocation': {'@type': 'Place','address': {'@type': 'PostalAddress','addressLocality': raw_location,'addressCountry': 'IN'}},'employmentType': employment_type(raw_type),'url': url}, ensure_ascii=False).replace('</', '<\\/')
    breadcrumb = json.dumps({'@context': 'https://schema.org','@type': 'BreadcrumbList','itemListElement': [{'@type': 'ListItem','position': 1,'name': 'Home','item': f'{BASE}/'},{'@type': 'ListItem','position': 2,'name': 'Latest Jobs','item': f'{BASE}/jobs/'},{'@type': 'ListItem','position': 3,'name': raw_title,'item': url}]}, ensure_ascii=False).replace('</', '<\\/')
    related_html = ''.join(f'<li><a href="{escape(rurl)}">{escape(rtitle)} – {escape(rcompany)}</a></li>' for rurl,rtitle,rcompany in related_links if rurl != url)
    related_section = f'<section><h3>More Private Jobs in India</h3><ul>{related_html}</ul><p><a href="../../jobs/">View all latest private jobs in India →</a></p></section>' if related_html else '<p><a href="../../jobs/">View all latest private jobs in India →</a></p>'
    html = '''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>__TITLE__ | __COMPANY__ | Private Jobs India</title><meta name="description" content="__META_DESCRIPTION__"><meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="__URL__"><meta property="og:type" content="website"><meta property="og:title" content="__TITLE__ | __COMPANY__ | Private Jobs India"><meta property="og:description" content="__META_DESCRIPTION__"><meta property="og:url" content="__URL__"><meta property="og:image" content="__LOGO__"><meta property="og:image:alt" content="__COMPANY__ logo"><meta name="twitter:card" content="summary"><meta name="twitter:title" content="__TITLE__ | __COMPANY__"><meta name="twitter:description" content="__META_DESCRIPTION__"><meta name="twitter:image" content="__LOGO__"><link rel="icon" href="__LOGO__"><link rel="apple-touch-icon" href="__LOGO__"><link rel="stylesheet" href="../../style.css"><script type="application/ld+json">__SCHEMA__</script><script type="application/ld+json">__BREADCRUMB__</script></head><body><header><div class="brand">💼 PRIVATE JOB ALERT INDIA</div><nav><a href="../../">Home</a><a href="../../#jobs">Latest Jobs</a><a href="../../categories/">Job Categories</a></nav></header><main><article class="job" style="max-width:900px;margin:30px auto"><p class="muted"><a href="../../">Home</a> › <a href="../../#jobs">Latest Jobs</a> › __TITLE__</p><h1>__TITLE__</h1><h2>__COMPANY__</h2><p class="muted">📍 __LOCATION__ &nbsp; 🎓 __QUALIFICATION__ &nbsp; 💰 __SALARY__ &nbsp; 🕒 __JOB_TYPE__</p><hr><h3>Job Description</h3><p>__DESCRIPTION__</p><h3>How to Apply</h3><p>Click Apply Now and submit your candidate details and resume. Your application will be sent to the HR email configured for this vacancy.</p><button class="apply" id="applyButton">Apply Now →</button>__RELATED_SECTION__</article></main><div id="modal" class="modal hidden"><div class="box"><button class="close" onclick="closeModal()">×</button><div id="modalContent"></div></div></div><script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script><script src="../../app.js"></script><script>document.getElementById("applyButton").addEventListener("click", async function () {const r = await sb.from("jobs").select("id,title,company,location,qualification,salary,job_type,description,hr_email,created_at").eq("id", __JOB_ID__).eq("is_active", true).single();if (r.error || !r.data) { alert("This job is no longer available."); return; }openApply(r.data);});</script></body></html>'''
    return html.replace('__TITLE__', title).replace('__COMPANY__', company).replace('__LOCATION__', location).replace('__QUALIFICATION__', qualification).replace('__SALARY__', salary).replace('__JOB_TYPE__', job_type).replace('__DESCRIPTION__', description).replace('__META_DESCRIPTION__', meta_description).replace('__URL__', safe_url).replace('__LOGO__', safe_logo).replace('__SCHEMA__', schema).replace('__BREADCRUMB__', breadcrumb).replace('__JOB_ID__', json.dumps(jid)).replace('__RELATED_SECTION__', related_section)

urls = [f'{BASE}/']
urls.append(f'{BASE}/categories/')
urls.append(f'{BASE}/hr/')
urls.append(f'{BASE}/jobs/')
active = set(); job_links = []
for job in jobs:
    name = job_slug(job); active.add(name); url = f'{BASE}/jobs/{name}/'; job_links.append((url, clean_text(job.get('title'), 'Private Job'), clean_text(job.get('company'), 'Employer'), clean_text(job.get('location'), 'India'), clean_text(job.get('qualification'), 'Any qualification')))
for job in jobs:
    name = job_slug(job); url = f'{BASE}/jobs/{name}/'; folder = JOBS_DIR / name; folder.mkdir(parents=True, exist_ok=True); (folder / 'index.html').write_text(page(job, job_links[:6]), encoding='utf-8'); urls.append(url)
for folder in JOBS_DIR.iterdir():
    if folder.is_dir() and folder.name not in active: shutil.rmtree(folder)

items = ''.join(f'<article><h2><a href="{escape(url)}">{escape(title)}</a></h2><p><strong>{escape(company)}</strong> · 📍 {escape(location)} · 🎓 {escape(qualification)}</p><p><a href="{escape(url)}">View job details & Apply →</a></p></article>' for url,title,company,location,qualification in job_links)
item_schema = json.dumps({'@context':'https://schema.org','@type':'ItemList','name':'Latest Private Jobs in India','itemListElement':[{'@type':'ListItem','position':i,'url':url,'name':title} for i,(url,title,company,location,qualification) in enumerate(job_links,1)]}, ensure_ascii=False).replace('</', '<\\/')
jobs_html = f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Latest Private Jobs in India 2026 | Private Job Alert</title><meta name="description" content="Latest private jobs in India 2026. Find current vacancies across states and cities by qualification, company, experience and job type."><meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="{BASE}/jobs/"><script type="application/ld+json">{item_schema}</script><link rel="stylesheet" href="../style.css"></head><body><header><a class="brand" href="../">💼 <span>PRIVATE JOB ALERT</span><small>INDIA</small></a><nav><a href="../">Home</a><a href="../categories/">Job Categories</a><a href="../hr.html">For HR</a></nav></header><main><section class="hero"><span>✓ LATEST PRIVATE JOBS</span><h1>Latest Private Jobs in India 2026</h1><p>Browse current private-sector vacancies across India by job title, company, location, qualification, experience and job type.</p></section><section><h2>Current Vacancies Across India</h2>{items or '<p>No active vacancies are currently available. Please check again soon.</p>'}</section><section><h2>Popular Job Searches</h2><p><a href="../#jobs" onclick="setSearch('10th')">10th Pass Jobs</a> · <a href="../#jobs" onclick="setSearch('12th')">12th Pass Jobs</a> · <a href="../#jobs" onclick="setSearch('Graduate')">Graduate Jobs</a> · <a href="../#jobs" onclick="setSearch('Fresher')">Fresher Jobs</a> · <a href="../#jobs" onclick="setSearch('Work From Home')">Work From Home Jobs</a></p></section><section><h2>Private Jobs Across India</h2><p>Private Job Alert helps job seekers find private-sector vacancies across India, including opportunities for freshers and experienced candidates. Check this page regularly for newly published jobs and use the job details pages to review eligibility, location, salary and application information.</p></section></main><footer>© 2026 Private Job Alert India</footer></body></html>'''
(JOBS_DIR / 'index.html').write_text(jobs_html, encoding='utf-8')

lastmod = datetime.now(timezone.utc).date().isoformat()
lines = ['<?xml version="1.0" encoding="UTF-8"?>','<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
for url in urls:
    priority = '1.0' if url == BASE + '/' else ('0.9' if '/categories/' in url or url == BASE + '/hr/' or url == BASE + '/jobs/' else '0.8')
    lines.append(f'<url><loc>{escape(url)}</loc><lastmod>{lastmod}</lastmod><changefreq>daily</changefreq><priority>{priority}</priority></url>')
lines.append('</urlset>')
(ROOT / 'sitemap.xml').write_text('\n'.join(lines) + '\n', encoding='utf-8')
print(f'Generated {len(jobs)} job pages, latest-jobs index and {len(urls)} sitemap URLs.')
