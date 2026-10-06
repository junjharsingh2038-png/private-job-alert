const fs=require("fs"),path=require("path");

const SUPABASE_URL=process.env.SUPABASE_URL;
const KEY=process.env.SUPABASE_ANON_KEY;
const SITE=(process.env.SITE_URL||"").replace(/\/$/,"");

function esc(v){
  return String(v??"").replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[m]));
}
function text(v){
  return String(v??"").replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim();
}
function slug(v){
  return text(v).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,90);
}
function dateOnly(v){
  if(!v)return new Date().toISOString().slice(0,10);
  const d=new Date(v); return Number.isNaN(d.getTime())?String(v).slice(0,10):d.toISOString().slice(0,10);
}
function schemaDescription(v){const s=String(v??"").trim();if(!s)return "<p>Private job vacancy details and application information.</p>";const safe=esc(s).replace(/\r?\n\s*\r?\n/g,"</p><p>").replace(/\r?\n/g,"<br>");return "<p>"+safe+"</p>";}

async function main(){
  if(!SUPABASE_URL||!KEY||!SITE) throw new Error("Missing SEO environment configuration.");
  const url=SUPABASE_URL+"/rest/v1/jobs?select=*&is_active=eq.true&order=created_at.desc";
  const res=await fetch(url,{headers:{apikey:KEY,Authorization:"Bearer "+KEY}});
  if(!res.ok) throw new Error("Supabase jobs request failed: HTTP "+res.status);
  const jobs=await res.json();
  if(!Array.isArray(jobs)) throw new Error("Unexpected jobs response.");

  const urls=[
    {loc:SITE+"/",priority:"1.0"},
    {loc:SITE+"/categories/",priority:"0.8"},
    {loc:SITE+"/categories/private-jobs-india/",priority:"0.8"},
    {loc:SITE+"/categories/fresher-private-jobs/",priority:"0.7"},
    {loc:SITE+"/categories/graduate-private-jobs/",priority:"0.7"},
    {loc:SITE+"/categories/work-from-home-jobs/",priority:"0.7"},
    {loc:SITE+"/categories/10th-pass-private-jobs/",priority:"0.7"},
    {loc:SITE+"/categories/12th-pass-private-jobs/",priority:"0.7"},
    {loc:SITE+"/hr/",priority:"0.6"},
    {loc:SITE+"/jobs/",priority:"0.8"}
  ];

  for(const j of jobs){
    if(!j.id||!j.title) continue;
    const company=j.company||j.company_name||"Employer";
    const base=slug(j.title+"-"+company);
    const idShort=String(j.id).replace(/-/g,"").slice(0,8);
    const s=base+"-"+idShort;
    const dir=path.join("jobs",s);
    fs.mkdirSync(dir,{recursive:true});
    const pageUrl=SITE+"/jobs/"+s+"/"; const applyUrl=SITE+"/apply.html?job="+encodeURIComponent(String(j.id));
    const description=schemaDescription(j.description);
    const locationText=[j.city,j.state].filter(Boolean).join(", ")||j.location||"India"; const locationLocality=j.city||j.location||"India"; const locationRegion=j.state||"";
    const logo=j.company_logo||"";
    const jobSchema={
      "@context":"https://schema.org",
      "@type":"JobPosting",
      title:text(j.title),
      description,
      identifier:{"@type":"PropertyValue",name:company,value:String(j.id)},
      datePosted:dateOnly(j.created_at),
      hiringOrganization:{"@type":"Organization",name:company,...(logo?{logo}: {})},
      jobLocation:{"@type":"Place",address:{"@type":"PostalAddress",addressLocality:locationLocality,...(locationRegion?{addressRegion:locationRegion}:{}),addressCountry:"IN"}},
      employmentType:String(j.job_type||j.type||"FULL_TIME").toUpperCase().replace(/[^A-Z_]/g,"_"),
      url:pageUrl, directApply:true
    };
    if(j.lastdate) jobSchema.validThrough=String(j.lastdate).slice(0,10)+"T23:59:59+05:30";

    const related=jobs.filter(x=>x.id!==j.id).slice(0,5).map(x=>{
      const c=x.company||x.company_name||"Employer";
      const ss=slug((x.title||"job")+"-"+c)+"-"+String(x.id||"").replace(/-/g,"").slice(0,8);
      return '<li><a href="'+SITE+'/jobs/'+ss+'/">'+esc(x.title||"Job")+" – "+esc(c)+'</a></li>';
    }).join("");

    const html='<!doctype html><html lang="en-IN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+
      '<title>'+esc(j.title)+' – '+esc(company)+' | Private Job Alert</title>'+
      '<meta name="description" content="'+esc(text(j.title)+" at "+company+". Location: "+locationText+". Qualification: "+(j.qualification||"Not specified")+". Salary: "+(j.salary||"As per company")+"." )+'">'+
      '<meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="'+pageUrl+'">'+
      '<script type="application/ld+json">'+JSON.stringify(jobSchema).replace(/<\/script/gi,"<\\/script")+'</script>'+
      '<style>body{font-family:Arial,sans-serif;margin:0;background:#f5f8fc;color:#17243a}header{background:#fff;border-bottom:1px solid #e1e7ef;padding:18px 5%}header a{font-weight:800;color:#1264e8;text-decoration:none}main{max-width:900px;margin:35px auto;padding:0 18px}.card{background:#fff;border:1px solid #dce5f0;border-radius:18px;padding:30px;box-shadow:0 8px 25px #10264a12}h1{margin:8px 0 10px;font-size:32px}.company{font-size:19px;font-weight:700;color:#52647b}.meta{display:flex;flex-wrap:wrap;gap:10px;margin:24px 0}.meta span{background:#eef5ff;padding:9px 13px;border-radius:10px}.apply{display:inline-block;background:#1264e8;color:#fff;padding:13px 22px;border-radius:10px;text-decoration:none;font-weight:800}.note{margin-top:25px;color:#63728a;font-size:14px;line-height:1.6}a{color:#1264e8}</style></head><body><header><a href="'+SITE+'/">💼 PRIVATE JOB ALERT – INDIA</a></header><main><article class="card"><div class="company">'+esc(company)+'</div><h1>'+esc(j.title)+'</h1><div class="meta"><span>📍 '+esc(locationText)+'</span><span>💼 '+esc(j.job_type||j.type||"Full Time")+'</span><span>🎓 '+esc(j.qualification||"Any")+'</span><span>💰 '+esc(j.salary||"As per company")+'</span></div><h2>Job Description</h2><p>'+esc(description)+'</p><h2>How to Apply</h2><p>Open the latest jobs section to apply for this vacancy. Candidates should verify recruitment details with the employer before sharing personal information.</p><a class="apply" href="'+applyUrl+'" target="_blank" rel="noopener">Apply Now →</a><h2>More Private Jobs in India</h2><ul>'+related+'</ul><p class="note">Private Job Alert provides job information. Candidates should independently verify company and recruitment details before applying.</p></article></main></body></html>';

    fs.writeFileSync(path.join(dir,"index.html"),html);
    urls.push({loc:pageUrl,priority:"0.9",lastmod:dateOnly(j.created_at)});
  }

  const today=new Date().toISOString().slice(0,10);
  const xml='<?xml version="1.0" encoding="UTF-8"?>\n<!-- generated-by-sync-seo -->\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+
    urls.map(u=>'<url><loc>'+esc(u.loc)+'</loc><lastmod>'+esc(u.lastmod||today)+'</lastmod><changefreq>daily</changefreq><priority>'+u.priority+'</priority></url>').join("\n")+
    '\n</urlset>\n';
  fs.writeFileSync("sitemap.xml",xml);
  console.log("Generated "+jobs.length+" active job pages and sitemap with "+urls.length+" URLs.");
}
main().catch(e=>{console.error(e);process.exit(1);});
