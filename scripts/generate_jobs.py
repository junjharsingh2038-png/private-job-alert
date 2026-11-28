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

def salary_schema(value):
    """Return conservative INR salary markup only when amount and pay period are explicit."""
    raw = str(value or '').strip()
    low = raw.lower()
    unit = None
    for terms, unit_name in [
        (('per month', '/month', 'monthly', 'month'), 'MONTH'),
        (('per year', '/year', 'annum', 'annual', 'yearly'), 'YEAR'),
        (('per hour', '/hour', 'hourly'), 'HOUR'),
        (('per week', '/week', 'weekly'), 'WEEK'),
        (('per day', '/day', 'daily'), 'DAY'),
    ]:
        if any(term in low for term in terms):
            unit = unit_name
            break
    if not unit or ('₹' not in raw and 'inr' not in low and 'rs.' not in low and 'rs ' not in low):
        return None
    amounts = re.findall(r'(?<![A-Za-z])(?:₹\s*)?(\d[\d,]*(?:\.\d+)?)', raw)
    values = []
    for item in amounts:
        try:
            number = float(item.replace(',', ''))
            if number > 0:
                values.append(number)
        except ValueError:
            pass
    if not values:
        return None
    qv = {'@type': 'QuantitativeValue', 'unitText': unit}
    if len(values) >= 2:
        qv['minValue'], qv['maxValue'] = min(values), max(values)
    else:
        qv['value'] = values[0]
    return {'@type': 'MonetaryAmount', 'currency': 'INR', 'value': qv}

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

def seo_exclusion_reason(job):
    """Keep incomplete listings and candidate CVs out of public JobPosting SEO pages."""
    description = clean_description(job.get('description'))
    lowered = description.lower()
    candidate_signals = (
        'looking for a job opportunity',
        'looking for job opportunity',
        'currently looking for a job',
        'seeking a job opportunity',
        'open to work',
        '#opentowork',
        'preferred role',
        'notice period',
        'current organisation',
        'current organization',
        'currently working at',
    )
    if any(signal in lowered for signal in candidate_signals):
        return 'candidate profile or job-seeker CV, not a vacancy'
    words = re.findall(r"[A-Za-z0-9]+", description)
    if len(words) < 30:
        return f'incomplete vacancy description ({len(words)} words; minimum 30 for SEO publication)'
    if not clean_text(job.get('title')) or not clean_text(job.get('company')):
        return 'missing job title or employer'
    return None

seo_excluded = []
seo_eligible = []
for job in jobs:
    reason = seo_exclusion_reason(job)
    if reason:
        seo_excluded.append((job, reason))
    else:
        seo_eligible.append(job)
jobs = seo_eligible
print(f'SEO eligibility: {len(jobs)} publishable vacancies; {len(seo_excluded)} excluded from Google JobPosting pages.')
for excluded_job, reason in seo_excluded:
    print(f"SEO EXCLUDED: {clean_text(excluded_job.get('title'), 'Untitled')} at {clean_text(excluded_job.get('company'), 'Unknown employer')}: {reason}")

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
    date_posted = str(job.get('created_at') or datetime.now(timezone.utc).date().isoformat())[:10]
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
    meta_text = f'{raw_title} at {raw_company} in {raw_location}. Qualification: {raw_qualification}. Salary: {raw_salary}. Apply online for this private job in India.'
    if len(meta_text) > 155:
        meta_text = meta_text[:152].rsplit(' ', 1)[0].rstrip(' ,.;:-') + '...'
    meta_description = escape(meta_text, quote=True)
    safe_url = escape(url, quote=True)
    safe_logo = escape(logo_url, quote=True)
    location_context = ' '.join(str(job.get(k) or '') for k in ('job_type', 'type', 'location', 'city', 'state')).lower()
    description_context = clean_description(job.get('description')).lower()
    remote_terms = ('work from home', 'work-from-home', 'remote job', 'remote position', 'work remotely', 'telecommute', 'wfh')
    is_remote = any(term in location_context or term in description_context for term in remote_terms)
    job_schema = {'@context': 'https://schema.org','@type': 'JobPosting','title': raw_title,'description': schema_description,'identifier': {'@type': 'PropertyValue','name': raw_company,'value': jid},'datePosted': date_posted,'hiringOrganization': {'@type': 'Organization','name': raw_company, **({'logo': logo_url} if logo_url else {})},**({'jobLocationType': 'TELECOMMUTE','applicantLocationRequirements': {'@type': 'Country','name': 'India'}} if is_remote else {'jobLocation': {'@type': 'Place','address': address}}),**({'employmentType': employment_type(raw_type)} if employment_type(raw_type) else {}),'directApply': True,'url': url}
    if valid_through:
        job_schema['validThrough'] = valid_through
    salary_data = salary_schema(raw_salary)
    if salary_data:
        job_schema['baseSalary'] = salary_data
    schema = json.dumps(job_schema, ensure_ascii=False).replace('</', '<\\/')
    breadcrumb = json.dumps({'@context': 'https://schema.org','@type': 'BreadcrumbList','itemListElement': [{'@type': 'ListItem','position': 1,'name': 'Home','item': f'{BASE}/'},{'@type': 'ListItem','position': 2,'name': 'Latest Jobs','item': f'{BASE}/jobs/'},{'@type': 'ListItem','position': 3,'name': raw_title,'item': url}]}, ensure_ascii=False).replace('</', '<\\/')
    related_html = ''.join(f'<li><a href="{escape(rurl)}">{escape(rtitle)} – {escape(rcompany)}</a></li>' for rurl,rtitle,rcompany,_,_ in related_links if rurl != url)
    related_section = f'<section><h3>More Private Jobs in India</h3><ul>{related_html}</ul><p><a href="../../jobs/">View all latest private jobs in India →</a></p></section>' if related_html else '<p><a href="../../jobs/">View all latest private jobs in India →</a></p>'
    html = '''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>__TITLE__ | __COMPANY__ | Private Jobs India</title><meta name="description" content="__META_DESCRIPTION__"><meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="__URL__"><meta property="og:type" content="website"><meta property="og:title" content="__TITLE__ | __COMPANY__ | Private Jobs India"><meta property="og:description" content="__META_DESCRIPTION__"><meta property="og:url" content="__URL__"><meta property="og:image" content="__LOGO__"><meta property="og:image:alt" content="__COMPANY__ logo"><meta name="twitter:card" content="summary"><meta name="twitter:title" content="__TITLE__ | __COMPANY__"><meta name="twitter:description" content="__META_DESCRIPTION__"><meta name="twitter:image" content="__LOGO__"><link rel="icon" href="__LOGO__"><link rel="apple-touch-icon" href="__LOGO__"><link rel="stylesheet" href="../../style.css"><script defer src="../../analytics.js"></script><script type="application/ld+json">__SCHEMA__</script><script type="application/ld+json">__BREADCRUMB__</script></head><body><header><div class="brand">💼 PRIVATE JOB ALERT INDIA</div><nav><a href="../../">Home</a><a href="../../#jobs">Latest Jobs</a><a href="../../categories/">Job Categories</a></nav></header><main><article class="job" style="max-width:900px;margin:30px auto"><p class="muted"><a href="../../">Home</a> › <a href="../../#jobs">Latest Jobs</a> › __TITLE__</p><h1>__TITLE__</h1><h2>__COMPANY__</h2><p class="muted">📍 __LOCATION__ &nbsp; 🎓 __QUALIFICATION__ &nbsp; 💰 __SALARY__ &nbsp; 🕒 __JOB_TYPE__</p><hr><h3>Job Description</h3>__DESCRIPTION__<h3>How to Apply</h3><p>Click Apply Now and submit your candidate details and resume. Your application will be sent to the HR email configured for this vacancy.</p><button class="apply" id="applyButton">Apply Now →</button><a class="apply" style="margin-left:10px;background:#ff6b1a" href="__POSTER_URL__">Share Job Poster ↗</a>__RELATED_SECTION__</article></main><div id="modal" class="modal hidden"><div class="box"><button class="close" onclick="closeModal()">×</button><div id="modalContent"></div></div></div><script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script><script src="../../app.js"></script><script>document.getElementById("applyButton").addEventListener("click", async function () {const r = await sb.from("jobs").select("id,title,company,location,qualification,salary,job_type,description,hr_email,created_at").eq("id", __JOB_ID__).eq("is_active", true).single();if (r.error || !r.data) { alert("This job is no longer available."); return; }openApply(r.data);});</script></body></html>'''
    return html.replace('__TITLE__', title).replace('__COMPANY__', company).replace('__LOCATION__', location).replace('__QUALIFICATION__', qualification).replace('__SALARY__', salary).replace('__JOB_TYPE__', job_type).replace('__DESCRIPTION__', schema_description).replace('__META_DESCRIPTION__', meta_description).replace('__URL__', safe_url).replace('__LOGO__', safe_logo).replace('__SCHEMA__', schema).replace('__BREADCRUMB__', breadcrumb).replace('__JOB_ID__', json.dumps(jid)).replace('__POSTER_URL__', escape(f'{BASE}/jobs/view.html?id={urllib.parse.quote(jid)}&share=1', quote=True)).replace('__RELATED_SECTION__', related_section)

urls = [f'{BASE}/', f'{BASE}/categories/', f'{BASE}/jobs/']
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
    rajasthan_html = f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Rajasthan Private Jobs 2026 | Latest Vacancies in Jaipur, Jodhpur & Barmer</title><meta name="description" content="Find current private jobs in Rajasthan. Browse verified active listings by company, city and qualification, including Jaipur, Jodhpur and Barmer where available."><meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="{BASE}/categories/rajasthan-private-jobs/"><link rel="stylesheet" href="../../style.css"><script defer src="../../analytics.js"></script></head><body><header><a href="../../">Private Job Alert</a><nav><a href="../../">Home</a> <a href="../../jobs/">Latest Jobs</a> <a href="../">Categories</a></nav></header><main><section><h1>Latest Private Jobs in Rajasthan 2026</h1><p>Explore currently listed private-sector vacancies in Rajasthan. Review the employer, job location, qualification and application details on each vacancy page before applying. Listings are included here only when their location information identifies Rajasthan or a Rajasthan city.</p></section><section><h2>Current Rajasthan Vacancies</h2>{rajasthan_items}</section><section><h2>Job Search Tips</h2><p>Check the job location and eligibility carefully. Apply through the vacancy details page and verify the employer and application contact before sharing personal information.</p><p><a href="../../jobs/">Browse all latest private jobs in India →</a></p></section></main><footer>© 2026 Private Job Alert India</footer></body></html>'''
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
    # Use the structured city field only. Free-text location values can contain
    # districts, nearby areas, state names or multiple cities and create thin pages.
    city_value = clean_text(job.get('city'), '')
    city_value = re.sub(r'\s+', ' ', city_value).strip(' ,.-')
    if not city_value or city_value.lower() in generic_locations:
        continue
    if any(token in city_value.lower() for token in (',', '/', ';', ' near ', ' nearby', 'district', 'all india', 'pan india')):
        continue
    if city_value.lower() in {'rajasthan', 'gujarat', 'delhi', 'maharashtra', 'haryana', 'punjab', 'uttar pradesh', 'madhya pradesh'}:
        continue
    city_groups.setdefault(city_value, []).append(link)

# Avoid thin city landing pages: publish only when at least three active vacancies exist.
MIN_CITY_JOBS = 3
city_groups = {name: listings for name, listings in city_groups.items() if len(listings) >= MIN_CITY_JOBS}

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
    city_breadcrumb = json.dumps({'@context': 'https://schema.org', '@type': 'BreadcrumbList', 'itemListElement': [{'@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': f'{BASE}/'}, {'@type': 'ListItem', 'position': 2, 'name': 'Latest Jobs', 'item': f'{BASE}/jobs/'}, {'@type': 'ListItem', 'position': 3, 'name': f'Jobs in {city_name}', 'item': city_url}]}, ensure_ascii=False).replace('</', '<\\/')
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
    city_html = f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Latest Private Jobs in {city_title} | Private Job Alert</title><meta name="description" content="{city_desc}"><meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="{city_url}"><meta property="og:type" content="website"><meta property="og:title" content="Latest Private Jobs in {city_title}"><meta property="og:description" content="{city_desc}"><meta property="og:url" content="{city_url}"><script type="application/ld+json">{city_schema}</script><script type="application/ld+json">{city_breadcrumb}</script><link rel="stylesheet" href="../../style.css"><script defer src="../../analytics.js"></script></head><body><header><a class="brand" href="../../">💼 PRIVATE JOB ALERT INDIA</a><nav><a href="../../">Home</a><a href="../../jobs/">Latest Jobs</a><a href="../../categories/">Categories</a></nav></header><main><section class="hero"><span>✓ CITY-WISE VACANCIES</span><h1>Latest Private Jobs in {city_title}</h1><p>Browse currently active private-sector vacancies listed for {city_title}. Check each employer, job location, qualification and application details before applying. This page updates automatically when new active jobs are listed for this city.</p></section><section><h2>Current Jobs in {city_title} ({len(listings)})</h2>{city_items}</section><section><p><a href="../../jobs/">Browse all latest private jobs in India →</a></p></section></main><footer>© 2026 Private Job Alert India</footer></body></html>'''
    folder = CITIES_DIR / city_slug
    folder.mkdir(parents=True, exist_ok=True)
    (folder / 'index.html').write_text(city_html, encoding='utf-8')
    urls.append(city_url)

for folder in CITIES_DIR.iterdir():
    if folder.is_dir() and folder.name not in active_city_slugs:
        shutil.rmtree(folder)


# Generate qualification and work-mode landing pages only when enough real active jobs exist.
# This prevents empty/thin SEO pages from being submitted to Google.
category_rules = [
    ('10th-pass-private-jobs', 'Private Jobs for 10th Pass Candidates', lambda j: '10th' in str(j.get('qualification') or '').lower() or 'matric' in str(j.get('qualification') or '').lower()),
    ('12th-pass-private-jobs', 'Private Jobs for 12th Pass Candidates', lambda j: '12th' in str(j.get('qualification') or '').lower() or 'senior secondary' in str(j.get('qualification') or '').lower()),
    ('graduate-private-jobs', 'Graduate Private Jobs in India', lambda j: any(x in str(j.get('qualification') or '').lower() for x in ('graduate', 'bachelor', 'degree', 'any stream'))),
    ('iti-private-jobs', 'ITI Private Jobs in India', lambda j: 'iti' in str(j.get('qualification') or '').lower()),
    ('fresher-private-jobs', 'Fresher Private Jobs in India', lambda j: any(x in (' '.join(str(j.get(k) or '') for k in ('title','qualification','description','experience'))).lower() for x in ('fresher', 'no experience', '0-1 year', '0-2 year', 'entry level'))),
    ('work-from-home-jobs', 'Work From Home Private Jobs in India', lambda j: any(x in (' '.join(str(j.get(k) or '') for k in ('job_type','type','location','city','state','description'))).lower() for x in ('work from home','work-from-home','remote job','remote position','work remotely','telecommute','wfh'))),
]
category_nav = []
MIN_CATEGORY_JOBS = 3
for category_slug, category_name, predicate in category_rules:
    matches = [(job, link) for job, link in zip(jobs, job_links) if predicate(job)]
    if len(matches) < MIN_CATEGORY_JOBS:
        continue
    category_url = f'{BASE}/categories/{category_slug}/'
    category_nav.append((category_name, category_url))
    listing_html = ''.join(
        f'<article><h2><a href="{escape(link[0])}">{escape(link[1])}</a></h2><p><strong>{escape(link[2])}</strong> · {escape(link[3])} · {escape(link[4])}</p><p><a href="{escape(link[0])}">View job details and apply →</a></p></article>'
        for job, link in matches
    )
    category_desc = escape(f'Browse {len(matches)} current active vacancies: {category_name.lower()}. Review each employer, eligibility, location and application details before applying.', quote=True)
    category_title = escape(category_name, quote=True)
    category_schema = json.dumps({'@context':'https://schema.org','@type':'ItemList','name':category_name,'numberOfItems':len(matches),'itemListElement':[{'@type':'ListItem','position':i,'url':link[0],'name':link[1]} for i, (job, link) in enumerate(matches, 1)]}, ensure_ascii=False).replace('</','<\\/')
    category_html = f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{category_title} | Private Job Alert</title><meta name="description" content="{category_desc}"><meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="{category_url}"><script type="application/ld+json">{category_schema}</script><link rel="stylesheet" href="../../style.css"><script defer src="../../analytics.js"></script></head><body><header><a href="../../">Private Job Alert India</a><nav><a href="../../">Home</a><a href="../../jobs/">Latest Jobs</a><a href="../">Categories</a></nav></header><main><section><h1>{category_title}</h1><p>Explore active vacancies matched to this qualification or work preference. Listings are generated from current employer-posted jobs. Check the full job details and verify the employer before applying.</p></section><section><h2>Current matching vacancies ({len(matches)})</h2>{listing_html}</section><section><h2>Before you apply</h2><p>Read the eligibility, location, salary and application instructions on each vacancy page. Never pay an unverified person for a job offer.</p><p><a href="../../jobs/">Browse all current private jobs in India →</a></p></section></main><footer>© 2026 Private Job Alert India</footer></body></html>'''
    folder = ROOT / 'categories' / category_slug
    folder.mkdir(parents=True, exist_ok=True)
    (folder / 'index.html').write_text(category_html, encoding='utf-8')
    urls.append(category_url)

# Add active-state landing pages only where at least three distinct current vacancies exist.
state_groups = {}
for job, link in zip(jobs, job_links):
    state_name = clean_text(job.get('state'), '')
    if state_name and state_name.lower() not in generic_locations:
        state_groups.setdefault(state_name, []).append(link)
state_nav = []
for state_name, listings in sorted(state_groups.items(), key=lambda item: item[0].lower()):
    if len(listings) < 3:
        continue
    state_slug = slug(state_name) + '-private-jobs'
    state_url = f'{BASE}/states/{state_slug}/'
    state_nav.append((state_name, state_url))
    state_items = ''.join(f'<article><h2><a href="{escape(u)}">{escape(t)}</a></h2><p><strong>{escape(co)}</strong> · {escape(loc)} · {escape(q)}</p><p><a href="{escape(u)}">View job details and apply →</a></p></article>' for u,t,co,loc,q in listings)
    state_desc = escape(f'Find {len(listings)} active private job vacancies in {state_name}. Review company, qualification, job location and application details.', quote=True)
    state_title = escape(state_name, quote=True)
    state_html = f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Private Jobs in {state_title} | Latest Vacancies</title><meta name="description" content="{state_desc}"><meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="{state_url}"><link rel="stylesheet" href="../../style.css"><script defer src="../../analytics.js"></script></head><body><header><a href="../../">Private Job Alert India</a><nav><a href="../../">Home</a><a href="../../jobs/">Latest Jobs</a></nav></header><main><h1>Latest Private Jobs in {state_title}</h1><p>Browse currently active employer-posted private vacancies in {state_title}. Review job eligibility, employer and application instructions before applying.</p><h2>Current vacancies ({len(listings)})</h2>{state_items}<p><a href="../../jobs/">Browse all private jobs in India →</a></p></main><footer>© 2026 Private Job Alert India</footer></body></html>'''
    folder = ROOT / 'states' / state_slug
    folder.mkdir(parents=True, exist_ok=True)
    (folder / 'index.html').write_text(state_html, encoding='utf-8')
    urls.append(state_url)


items = ''.join(f'<article><h2><a href="{escape(url)}">{escape(title)}</a></h2><p><strong>{escape(company)}</strong> · 📍 {escape(location)} · 🎓 {escape(qualification)}</p><p><a href="{escape(url)}">View job details & Apply →</a></p></article>' for url,title,company,location,qualification in job_links)
item_schema = json.dumps({'@context':'https://schema.org','@type':'ItemList','name':'Latest Private Jobs in India','itemListElement':[{'@type':'ListItem','position':i,'url':url,'name':title} for i,(url,title,company,location,qualification) in enumerate(job_links,1)]}, ensure_ascii=False).replace('</', '<\\/')
city_links_html = ''.join(f'<li><a href="{escape(url)}">Jobs in {escape(city_name)}</a></li>' for city_name, url in city_nav)
city_links_section = f'<section><h2>Jobs by City</h2><ul>{city_links_html}</ul></section>' if city_links_html else ''
category_links_html = ''.join(f'<li><a href="{escape(url)}">{escape(name)}</a></li>' for name, url in category_nav)
state_links_html = ''.join(f'<li><a href="{escape(url)}">Private Jobs in {escape(name)}</a></li>' for name, url in state_nav)
extra_nav_sections = (f'<section><h2>Jobs by Qualification and Work Preference</h2><ul>{category_links_html}</ul></section>' if category_links_html else '') + (f'<section><h2>Jobs by State</h2><ul>{state_links_html}</ul></section>' if state_links_html else '')
jobs_html = f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Latest Private Jobs in India 2026 | Private Job Alert</title><meta name="description" content="Latest private jobs in India 2026. Find current vacancies across states and cities by qualification, company, experience and job type."><meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="{BASE}/jobs/"><script type="application/ld+json">{item_schema}</script><link rel="stylesheet" href="../style.css"><script defer src="../analytics.js"></script></head><body><header><a class="brand" href="../">💼 <span>PRIVATE JOB ALERT</span><small>INDIA</small></a><nav><a href="../">Home</a><a href="../categories/">Job Categories</a><a href="../hr.html">For HR</a></nav></header><main><section class="hero"><span>✓ LATEST PRIVATE JOBS</span><h1>Latest Private Jobs in India 2026</h1><p>Browse current private-sector vacancies across India by job title, company, location, qualification, experience and job type.</p></section><section><h2>Current Vacancies Across India</h2>{items or '<p>No active vacancies are currently available. Please check again soon.</p>'}</section>{city_links_section}{extra_nav_sections}<section><h2>Popular Job Searches</h2><p><a href="../categories/10th-pass-private-jobs/">10th Pass Jobs</a> · <a href="../categories/12th-pass-private-jobs/">12th Pass Jobs</a> · <a href="../categories/graduate-private-jobs/">Graduate Jobs</a> · <a href="../categories/fresher-private-jobs/">Fresher Jobs</a> · <a href="../categories/work-from-home-jobs/">Work From Home Jobs</a></p></section><section><h2>Private Jobs Across India</h2><p>Private Job Alert helps job seekers find private-sector vacancies across India, including opportunities for freshers and experienced candidates. Check this page regularly for newly published jobs and use the job details pages to review eligibility, location, salary and application information.</p></section></main><footer>© 2026 Private Job Alert India</footer></body></html>'''
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
