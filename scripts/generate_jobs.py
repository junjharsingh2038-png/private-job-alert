import json
import re
import shutil
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from html import escape, unescape
from pathlib import Path

BASE = 'https://junjharsingh2038-png.github.io/private-job-alert'
SUPABASE_URL = 'https://rlidcatrwonemshwzafp.supabase.co'
SUPABASE_KEY = 'sb_publishable_ocJhWyfPg9rVhYROn_Vj0Q_DSSgxeuE'
ROOT = Path(__file__).resolve().parents[1]
JOBS_DIR = ROOT / 'jobs'
JOBS_DIR.mkdir(exist_ok=True)

params = urllib.parse.urlencode({'select': 'id,title,company,company_name,company_logo,location,city,state,qualification,salary,lastdate,job_type,type,description,hr_email,created_at','is_active': 'eq.true','order': 'created_at.desc','limit': '1000'})
request = urllib.request.Request(f'{SUPABASE_URL}/rest/v1/jobs?{params}', headers={'apikey': SUPABASE_KEY, 'Authorization': f'Bearer {SUPABASE_KEY}'})
with urllib.request.urlopen(request, timeout=30) as response:
    jobs = json.loads(response.read().decode('utf-8'))

# Do not publish expired vacancies as active JobPosting pages.
today = datetime.now(timezone.utc).date()
all_jobs = jobs
jobs = []
expired_jobs = []
for job in all_jobs:
    deadline = str(job.get('lastdate') or '').strip()[:10]
    try:
        expired = bool(deadline) and datetime.strptime(deadline, '%Y-%m-%d').date() < today
    except ValueError:
        expired = False
    (expired_jobs if expired else jobs).append(job)
print(f'Active SEO jobs: {len(jobs)}; expired jobs excluded: {len(expired_jobs)}.')

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
    return None

def clean_description(value):
    # Preserve paragraph and list boundaries from employer-entered HTML or plain text.
    text = str(value or '')
    text = re.sub(r'(?i)<br\s*/?>', '\n', text)
    text = re.sub(r'(?i)</(p|div|li|h[1-6])\s*>', '\n', text)
    text = re.sub(r'(?i)<li[^>]*>', '• ', text)
    text = re.sub(r'<[^>]+>', ' ', text)
    text = unescape(text).replace('\r', '')
    lines = [re.sub(r'[ \t]+', ' ', line).strip() for line in text.split('\n')]
    return '\n'.join(line for line in lines if line)

def html_description(text):
    parts = [p.strip() for p in text.split('\n') if p.strip()]
    return ''.join('<p>' + escape(p) + '</p>' for p in parts) or '<p>Job details available from the employer.</p>'

def page(job, related_links):
    raw_title = clean_text(job.get('title'), 'Private Job')
    raw_company = clean_text(job.get('company'), 'Employer')
    raw_location = clean_text(job.get('location'), 'India')
    raw_qualification = clean_text(job.get('qualification'), 'Any qualification')
    raw_salary = clean_text(job.get('salary'), 'As per company')
    raw_type = clean_text(job.get('job_type'), 'Full Time')
    raw_description = clean_description(job.get('description')) or f'Apply for {raw_title} at {raw_company} in {raw_location}.'
    jid = str(job.get('id'))
    url = f'{BASE}/jobs/{job_slug(job)}/'
    logo_url = str(job.get('company_logo') or '').strip() or company_logo_url(raw_company)
    date_posted = str(job.get('created_at') or '')[:10]
    last_date = str(job.get('lastdate') or '').strip()[:10]
    city = clean_text(job.get('city'), '')
    region = clean_text(job.get('state'), '')
    address = {'@type': 'PostalAddress', 'addressLocality': city or raw_location, 'addressCountry': 'IN'}
    if region:
        address['addressRegion'] = region
    valid_through = ''
    if last_date:
        try:
            parsed_deadline = datetime.strptime(last_date, '%Y-%m-%d')
            valid_through = parsed_deadline.strftime('%Y-%m-%dT23:59:59+05:30')
        except ValueError:
            valid_through = ''
    title = escape(raw_title); company = escape(raw_company); location = escape(raw_location); qualification = escape(raw_qualification); salary = escape(raw_salary); job_type = escape(raw_type); description = escape(raw_description)
    schema_description = html_description(raw_description)
    meta_description = escape((f'{raw_title} at {raw_company} in {raw_location}. Qualification: {raw_qualification}. Salary: {raw_salary}. Apply online for this private job in India.')[:158], quote=True)
    safe_url = escape(url, quote=True)
    safe_logo = escape(logo_url, quote=True)
    job_schema = {'@context': 'https://schema.org','@type': 'JobPosting','title': raw_title,'description': schema_description,'identifier': {'@type': 'PropertyValue','name': raw_company,'value': jid},'datePosted': date_posted,'hiringOrganization': {'@type': 'Organization','name': raw_company, **({'logo': logo_url} if logo_url else {})},'jobLocation': {'@type': 'Place','address': address},**({'employmentType': employment_type(raw_type)} if employment_type(raw_type) else {}),'url': url}
    if valid_through:
        job_schema['validThrough'] = valid_through
    schema = json.dumps(job_schema, ensure_ascii=False).replace('</', '<\\/')
    breadcrumb = json.dumps({'@context': 'https://schema.org','@type': 'BreadcrumbList','itemListElement': [{'@type': 'ListItem','position': 1,'name': 'Home','item': f'{BASE}/'},{'@type': 'ListItem','position': 2,'name': 'Latest Jobs','item': f'{BASE}/jobs/'},{'@type': 'ListItem','position': 3,'name': raw_title,'item': url}]}, ensure_ascii=False).replace('</', '<\\/')
    related_html = ''.join(f'<li><a href="{escape(rurl)}">{escape(rtitle)} – {escape(rcompany)}</a></li>' for rurl,rtitle,rcompany,_,_ in related_links if rurl != url)
    related_section = f'<section><h3>More Private Jobs in India</h3><ul>{related_html}</ul><p><a href="../../jobs/">View all latest private jobs in India →</a></p></section>' if related_html else '<p><a href="../../jobs/">View all latest private jobs in India →</a></p>'
    html = '''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>__TITLE__ | __COMPANY__ | Private Jobs India</title><meta name="description" content="__META_DESCRIPTION__"><meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="__URL__"><meta property="og:type" content="website"><meta property="og:title" content="__TITLE__ | __COMPANY__ | Private Jobs India"><meta property="og:description" content="__META_DESCRIPTION__"><meta property="og:url" content="__URL__"><meta property="og:image" content="__LOGO__"><meta property="og:image:alt" content="__COMPANY__ logo"><meta name="twitter:card" content="summary"><meta name="twitter:title" content="__TITLE__ | __COMPANY__"><meta name="twitter:description" content="__META_DESCRIPTION__"><meta name="twitter:image" content="__LOGO__"><link rel="icon" href="__LOGO__"><link rel="apple-touch-icon" href="__LOGO__"><link rel="stylesheet" href="../../style.css"><script type="application/ld+json">__SCHEMA__</script><script type="application/ld+json">__BREADCRUMB__</script></head><body><header><div class="brand">💼 PRIVATE JOB ALERT INDIA</div><nav><a href="../../">Home</a><a href="../../#jobs">Latest Jobs</a><a href="../../categories/">Job Categories</a></nav></header><main><article class="job" style="max-width:900px;margin:30px auto"><p class="muted"><a href="../../">Home</a> › <a href="../../#jobs">Latest Jobs</a> › __TITLE__</p><h1>__TITLE__</h1><h2>__COMPANY__</h2><p class="muted">📍 __LOCATION__ &nbsp; 🎓 __QUALIFICATION__ &nbsp; 💰 __SALARY__ &nbsp; 🕒 __JOB_TYPE__</p><hr><h3>Job Description</h3>__DESCRIPTION__<h3>How to Apply</h3><p>Click Apply Now and submit your candidate details and resume. Your application will be sent to the HR email configured for this vacancy.</p><button class="apply" id="applyButton">Apply Now →</button><a class="apply" style="margin-left:10px;background:#ff6b1a" href="__POSTER_URL__">Share Job Poster ↗</a>__RELATED_SECTION__</article></main><div id="modal" class="modal hidden"><div class="box"><button class="close" onclick="closeModal()">×</button><div id="modalContent"></div></div></div><script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script><script src="../../app.js"></script><script>document.getElementById("applyButton").addEventListener("click", async function () {const r = await sb.from("jobs").select("id,title,company,location,qualification,salary,job_type,description,hr_email,created_at").eq("id", __JOB_ID__).eq("is_active", true).single();if (r.error || !r.data) { alert("This job is no longer available."); return; }openApply(r.data);});</script></body></html>'''
    return html.replace('__TITLE__', title).replace('__COMPANY__', company).replace('__LOCATION__', location).replace('__QUALIFICATION__', qualification).replace('__SALARY__', salary).replace('__JOB_TYPE__', job_type).replace('__DESCRIPTION__', schema_description).replace('__META_DESCRIPTION__', meta_description).replace('__URL__', safe_url).replace('__LOGO__', safe_logo).replace('__SCHEMA__', schema).replace('__BREADCRUMB__', breadcrumb).replace('__JOB_ID__', json.dumps(jid)).replace('__POSTER_URL__', escape(f'{BASE}/jobs/view.html?id={urllib.parse.quote(jid)}&share=1', quote=True)).replace('__RELATED_SECTION__', related_section)

urls = [f'{BASE}/', f'{BASE}/categories/', f'{BASE}/categories/private-jobs-india/', f'{BASE}/categories/fresher-private-jobs/', f'{BASE}/categories/graduate-private-jobs/', f'{BASE}/categories/work-from-home-jobs/', f'{BASE}/categories/10th-pass-private-jobs/', f'{BASE}/categories/12th-pass-private-jobs/', f'{BASE}/hr/', f'{BASE}/jobs/']
active = set(); job_links = []
for job in jobs:
    name = job_slug(job); active.add(name); url = f'{BASE}/jobs/{name}/'; job_links.append((url, clean_text(job.get('title'), 'Private Job'), clean_text(job.get('company'), 'Employer'), clean_text(job.get('location'), 'India'), clean_text(job.get('qualification'), 'Any qualification')))
for job in jobs:
    name = job_slug(job); url = f'{BASE}/jobs/{name}/'; folder = JOBS_DIR / name; folder.mkdir(parents=True, exist_ok=True); (folder / 'index.html').write_text(page(job, job_links[:6]), encoding='utf-8'); urls.append(url)
for folder in JOBS_DIR.iterdir():
    if folder.is_dir() and folder.name not in active: shutil.rmtree(folder)

# Build a Rajasthan landing page only from real, currently active Rajasthan vacancies.
rajasthan_terms = ('rajasthan', 'jaipur', 'jodhpur', 'barmer', 'balotra', 'jaisalmer', 'jalore', 'bikaner', 'ajmer', 'udaipur', 'kota', 'sikar', 'alwar', 'pali', 'bhilwara', 'nagaur', 'churu', 'sri ganganagar')
rajasthan_jobs = []
for job, link in zip(jobs, job_links):
    location_text = ' '.join(str(job.get(k) or '') for k in ('location', 'city', 'state')).lower()
    if any(term in location_text for term in rajasthan_terms):
        rajasthan_jobs.append(link)
if rajasthan_jobs:
    rajasthan_items = ''.join(
        f'<article><h2><a href="{escape(url)}">{escape(title)}</a></h2><p><strong>{escape(company)}</strong> · {escape(location)} · {escape(qualification)}</p><p><a href="{escape(url)}">View job details and apply →</a></p></article>'
        for url, title, company, location, qualification in rajasthan_jobs
    )
    rajasthan_html = f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Rajasthan Private Jobs 2026 | Latest Vacancies in Jaipur, Jodhpur & Barmer</title><meta name="description" content="Find current private jobs in Rajasthan. Browse verified active listings by company, city and qualification, including Jaipur, Jodhpur and Barmer where available."><meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="{BASE}/categories/rajasthan-private-jobs/"><link rel="stylesheet" href="../../style.css"></head><body><header><a href="../../">Private Job Alert</a><nav><a href="../../">Home</a> <a href="../../jobs/">Latest Jobs</a> <a href="../">Categories</a></nav></header><main><section><h1>Latest Private Jobs in Rajasthan 2026</h1><p>Explore currently listed private-sector vacancies in Rajasthan. Review the employer, job location, qualification and application details on each vacancy page before applying. Listings are included here only when their location information identifies Rajasthan or a Rajasthan city.</p></section><section><h2>Current Rajasthan Vacancies</h2>{rajasthan_items}</section><section><h2>Job Search Tips</h2><p>Check the job location and eligibility carefully. Apply through the vacancy details page and verify the employer and application contact before sharing personal information.</p><p><a href="../../jobs/">Browse all latest private jobs in India →</a></p></section></main><footer>© 2026 Private Job Alert India</footer></body></html>'''
    folder = ROOT / 'categories' / 'rajasthan-private-jobs'
    folder.mkdir(parents=True, exist_ok=True)
    (folder / 'index.html').write_text(rajasthan_html, encoding='utf-8')
    urls.append(f'{BASE}/categories/rajasthan-private-jobs/')
else:
    stale_rajasthan = ROOT / 'categories' / 'rajasthan-private-jobs'
    if stale_rajasthan.exists():
        shutil.rmtree(stale_rajasthan)


# Generate one SEO landing page for every city with active vacancies.
CITIES_DIR = ROOT / 'cities'
CITIES_DIR.mkdir(exist_ok=True)
city_groups = {}
generic_locations = {'india', 'rajasthan', 'remote', 'work from home', 'pan india', 'anywhere', 'all india', 'not specified'}
for job, link in zip(jobs, job_links):
    city_value = clean_text(job.get('city'), '')
    if not city_value:
        location_value = clean_text(job.get('location'), '')
        city_value = location_value.split(',')[0].strip() if location_value else ''
    city_value = re.sub(r'\s+', ' ', city_value).strip(' ,.-')
    if not city_value or city_value.lower() in generic_locations:
        continue
    # Do not treat a state-only location as a city.
    if city_value.lower() in {'rajasthan', 'gujarat', 'delhi', 'maharashtra', 'haryana', 'punjab', 'uttar pradesh', 'madhya pradesh'}:
        continue
    city_groups.setdefault(city_value, []).append(link)

active_city_slugs = set()
city_nav = []
for city_name, listings in sorted(city_groups.items(), key=lambda item: item[0].lower()):
    city_slug = slug(city_name) + '-jobs'
    active_city_slugs.add(city_slug)
    city_url = f'{BASE}/cities/{city_slug}/'
    city_nav.append((city_name, city_url))
    city_items = ''.join(
        f'<article><h2><a href="{escape(url)}">{escape(title)}</a></h2><p><strong>{escape(company)}</strong> · {escape(location)} · {escape(qualification)}</p><p><a href="{escape(url)}">View job details and apply →</a></p></article>'
        for url, title, company, location, qualification in listings
    )
    city_schema = json.dumps({
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        'name': f'Latest Jobs in {city_name}',
        'numberOfItems': len(listings),
        'itemListElement': [
            {'@type': 'ListItem', 'position': i, 'url': url, 'name': title}
            for i, (url, title, company, location, qualification) in enumerate(listings, 1)
        ]
    }, ensure_ascii=False).replace('</', '<\\/')
    city_title = escape(city_name, quote=True)
    city_desc = escape(f'Find current private jobs in {city_name}. Browse active vacancies by company and qualification, and review job details before applying.', quote=True)
    city_html = f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Latest Private Jobs in {city_title} | Private Job Alert</title><meta name="description" content="{city_desc}"><meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="{city_url}"><meta property="og:type" content="website"><meta property="og:title" content="Latest Private Jobs in {city_title}"><meta property="og:description" content="{city_desc}"><meta property="og:url" content="{city_url}"><script type="application/ld+json">{city_schema}</script><link rel="stylesheet" href="../../style.css"></head><body><header><a class="brand" href="../../">💼 PRIVATE JOB ALERT INDIA</a><nav><a href="../../">Home</a><a href="../../jobs/">Latest Jobs</a><a href="../../categories/">Categories</a></nav></header><main><section class="hero"><span>✓ CITY-WISE VACANCIES</span><h1>Latest Private Jobs in {city_title}</h1><p>Browse currently active private-sector vacancies listed for {city_title}. Check each employer, job location, qualification and application details before applying. This page updates automatically when new active jobs are listed for this city.</p></section><section><h2>Current Jobs in {city_title} ({len(listings)})</h2>{city_items}</section><section><p><a href="../../jobs/">Browse all latest private jobs in India →</a></p></section></main><footer>© 2026 Private Job Alert India</footer></body></html>'''
    folder = CITIES_DIR / city_slug
    folder.mkdir(parents=True, exist_ok=True)
    (folder / 'index.html').write_text(city_html, encoding='utf-8')
    urls.append(city_url)

for folder in CITIES_DIR.iterdir():
    if folder.is_dir() and folder.name not in active_city_slugs:
        shutil.rmtree(folder)


items = ''.join(f'<article><h2><a href="{escape(url)}">{escape(title)}</a></h2><p><strong>{escape(company)}</strong> · 📍 {escape(location)} · 🎓 {escape(qualification)}</p><p><a href="{escape(url)}">View job details & Apply →</a></p></article>' for url,title,company,location,qualification in job_links)
item_schema = json.dumps({'@context':'https://schema.org','@type':'ItemList','name':'Latest Private Jobs in India','itemListElement':[{'@type':'ListItem','position':i,'url':url,'name':title} for i,(url,title,company,location,qualification) in enumerate(job_links,1)]}, ensure_ascii=False).replace('</', '<\\/')
city_links_html = ''.join(f'<li><a href="{escape(url)}">Jobs in {escape(city_name)}</a></li>' for city_name, url in city_nav)
city_links_section = f'<section><h2>Jobs by City</h2><ul>{city_links_html}</ul></section>' if city_links_html else ''
jobs_html = f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Latest Private Jobs in India 2026 | Private Job Alert</title><meta name="description" content="Latest private jobs in India 2026. Find current vacancies across states and cities by qualification, company, experience and job type."><meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="{BASE}/jobs/"><script type="application/ld+json">{item_schema}</script><link rel="stylesheet" href="../style.css"></head><body><header><a class="brand" href="../">💼 <span>PRIVATE JOB ALERT</span><small>INDIA</small></a><nav><a href="../">Home</a><a href="../categories/">Job Categories</a><a href="../hr.html">For HR</a></nav></header><main><section class="hero"><span>✓ LATEST PRIVATE JOBS</span><h1>Latest Private Jobs in India 2026</h1><p>Browse current private-sector vacancies across India by job title, company, location, qualification, experience and job type.</p></section><section><h2>Current Vacancies Across India</h2>{items or '<p>No active vacancies are currently available. Please check again soon.</p>'}</section>{city_links_section}<section><h2>Popular Job Searches</h2><p><a href="../categories/10th-pass-private-jobs/">10th Pass Jobs</a> · <a href="../categories/12th-pass-private-jobs/">12th Pass Jobs</a> · <a href="../categories/graduate-private-jobs/">Graduate Jobs</a> · <a href="../categories/fresher-private-jobs/">Fresher Jobs</a> · <a href="../categories/work-from-home-jobs/">Work From Home Jobs</a></p></section><section><h2>Private Jobs Across India</h2><p>Private Job Alert helps job seekers find private-sector vacancies across India, including opportunities for freshers and experienced candidates. Check this page regularly for newly published jobs and use the job details pages to review eligibility, location, salary and application information.</p></section></main><footer>© 2026 Private Job Alert India</footer></body></html>'''
(JOBS_DIR / 'index.html').write_text(jobs_html, encoding='utf-8')

lastmod = datetime.now(timezone.utc).date().isoformat()
lines = ['<?xml version="1.0" encoding="UTF-8"?>','<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
job_lastmods = {f'{BASE}/jobs/{job_slug(job)}/': str(job.get('created_at') or lastmod)[:10] for job in jobs}
for url in urls:
    priority = '1.0' if url == BASE + '/' else ('0.9' if any(x in url for x in ['/categories/','/hr/','/jobs/']) else '0.8')
    accurate_lastmod = job_lastmods.get(url, lastmod)
    lines.append(f'<url><loc>{escape(url)}</loc><lastmod>{accurate_lastmod}</lastmod><changefreq>daily</changefreq><priority>{priority}</priority></url>')
lines.append('</urlset>')
(ROOT / 'sitemap.xml').write_text('\n'.join(lines) + '\n', encoding='utf-8')
print(f'Generated {len(jobs)} job pages, latest-jobs index and {len(urls)} sitemap URLs.')
