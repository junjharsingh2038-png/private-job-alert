import json
import re
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

params = urllib.parse.urlencode({'select':'id,title,company,location,qualification,salary,job_type,description,hr_email,created_at','is_active':'eq.true','order':'created_at.desc','limit':'1000'})
request = urllib.request.Request(f'{SUPABASE_URL}/rest/v1/jobs?{params}', headers={'apikey':SUPABASE_KEY,'Authorization':f'Bearer {SUPABASE_KEY}'})
with urllib.request.urlopen(request, timeout=30) as response:
    jobs = json.loads(response.read().decode('utf-8'))

def slug(value):
    return re.sub(r'[^a-zA-Z0-9]+','-',str(value or '').strip().lower()).strip('-') or 'job'

def job_slug(job):
    return f"{slug(job.get('title'))}-{slug(job.get('company'))}-{str(job.get('id'))[:8]}"

def page(job):
    raw_title=job.get('title') or 'Private Job'
    raw_company=job.get('company') or 'Employer'
    raw_location=job.get('location') or 'Rajasthan'
    raw_qualification=job.get('qualification') or 'Any qualification'
    raw_salary=job.get('salary') or 'As per company'
    raw_type=job.get('job_type') or 'Full Time'
    raw_description=job.get('description') or f'Apply for {raw_title} at {raw_company} in {raw_location}.'
    jid=str(job.get('id'))
    url=f'{BASE}/jobs/{job_slug(job)}/'
    title,company,location,qualification,salary,job_type,description=map(escape,[raw_title,raw_company,raw_location,raw_qualification,raw_salary,raw_type,raw_description])
    schema=json.dumps({'@context':'https://schema.org','@type':'JobPosting','title':raw_title,'description':re.sub(r'<[^>]+>',' ',raw_description),'datePosted':str(job.get('created_at') or '')[:10],'hiringOrganization':{'@type':'Organization','name':raw_company},'jobLocation':{'@type':'Place','address':{'@type':'PostalAddress','addressLocality':raw_location,'addressCountry':'IN'}},'employmentType':raw_type.upper().replace(' ','_'),'url':url},ensure_ascii=False).replace('</','<\\/')
    return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+f'<title>{title} | {company} | Private Jobs Rajasthan</title>'+f'<meta name="description" content="{title} at {company} in {location}. Qualification: {qualification}. Salary: {salary}. Apply online."><meta name="robots" content="index,follow"><link rel="canonical" href="{url}"><link rel="stylesheet" href="../../style.css"><script type="application/ld+json">{schema}</script></head><body><header><div class="brand">💼 PRIVATE JOB ALERT RAJASTHAN</div><nav><a href="../../">Home</a> <a href="../../#jobs">Latest Jobs</a></nav></header><main><article class="job" style="max-width:900px;margin:30px auto"><h1>{title}</h1><h2>{company}</h2><p class="muted">📍 {location} &nbsp; 🎓 {qualification} &nbsp; 💰 {salary} &nbsp; 🕒 {job_type}</p><hr><h3>Job Description</h3><p>{description}</p><h3>How to Apply</h3><p>Click Apply Now and submit your candidate details and resume. Your application will be sent to the HR email configured for this vacancy.</p><button class="apply" id="applyButton">Apply Now →</button><p><a href="../../">← View Latest Private Jobs</a></p></article></main><div id="modal" class="modal hidden"><div class="box"><button class="close" onclick="closeModal()">×</button><div id="modalContent"></div></div></div><script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script><script src="../../app.js"></script><script>document.getElementById("applyButton").addEventListener("click",async function(){const r=await sb.from("jobs").select("id,title,company,location,qualification,salary,job_type,description,hr_email,created_at").eq("id",'+json.dumps(jid)+').eq("is_active",true).single();if(r.error||!r.data){alert("This job is no longer available.");return;}openApply(r.data);});</script></body></html>'

urls=[f'{BASE}/']
active=set()
for job in jobs:
    name=job_slug(job); active.add(name); folder=JOBS_DIR/name; folder.mkdir(parents=True,exist_ok=True); (folder/'index.html').write_text(page(job),encoding='utf-8'); urls.append(f'{BASE}/jobs/{name}/')
for folder in JOBS_DIR.iterdir():
    if folder.is_dir() and folder.name not in active:
        import shutil; shutil.rmtree(folder)
lastmod=datetime.now(timezone.utc).date().isoformat()
lines=['<?xml version="1.0" encoding="UTF-8"?>','<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
for url in urls:
    lines.append(f'<url><loc>{escape(url)}</loc><lastmod>{lastmod}</lastmod><changefreq>daily</changefreq><priority>{"1.0" if url==BASE+"/" else "0.8"}</priority></url>')
lines.append('</urlset>')
(ROOT/'sitemap.xml').write_text('\n'.join(lines)+'\n',encoding='utf-8')
print(f'Generated {len(jobs)} job pages and {len(urls)} sitemap URLs.')
