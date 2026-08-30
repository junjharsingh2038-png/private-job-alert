(() => {
"use strict";

const DEFAULT_JOBS = [
 {id:"default-1",title:"Technician",company:"Genus Power Infrastructures Ltd",location:"Barmer / Jaisalmer",qualification:"ITI / Diploma",salary:"₹15,000+",type:"Full Time",tags:["Rajasthan","Fresher"],date:"30 Aug 2026",hrEmail:""},
 {id:"default-2",title:"Sales Executive",company:"Private Employer",location:"Jaipur",qualification:"12th Pass / Graduate",salary:"₹18,000+",type:"Full Time",tags:["Rajasthan","12th Pass","Graduate"],date:"30 Aug 2026",hrEmail:""},
 {id:"default-3",title:"Customer Support Executive",company:"Private Employer",location:"Work From Home",qualification:"12th Pass / Graduate",salary:"₹15,000–₹25,000",type:"Remote",tags:["Work From Home","Graduate","Fresher"],date:"30 Aug 2026",hrEmail:""}
];

let activeFilter="all", searchTerm="", selectedJob=null, currentHr=null;

const $ = id => document.getElementById(id);
const emailOK = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

function esc(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}
function loadJSON(key,fallback){try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback));}catch{return fallback;}}
function saveJSON(key,val){localStorage.setItem(key,JSON.stringify(val));}

function getJobs(){
 const saved=loadJSON("pja_jobs",[]);
 return [...saved,...DEFAULT_JOBS];
}

function renderJobs(){
 const all=getJobs();
 const jobs=all.filter(j=>{
  const text=[j.title,j.company,j.location,j.qualification,j.salary,j.type,...(j.tags||[])].join(" ").toLowerCase();
  return (!searchTerm || text.includes(searchTerm.toLowerCase())) &&
         (activeFilter==="all" || text.includes(activeFilter.toLowerCase()));
 });
 $("jobCount").textContent=all.length;
 $("resultText").textContent=`${jobs.length} Job${jobs.length===1?"":"s"}`;
 $("jobsGrid").innerHTML=jobs.map(j=>`
  <article class="job">
   <div class="jobtop"><span class="company">${esc(j.company)}</span><span class="badge">${esc(j.type)}</span></div>
   <h3>${esc(j.title)}</h3>
   <div class="meta"><span>📍 ${esc(j.location)}</span><span>🎓 ${esc(j.qualification)}</span><span>💰 ${esc(j.salary)}</span><span>📅 ${esc(j.date||"Latest")}</span></div>
   <div class="jobfoot"><span class="small">Direct application</span><button class="apply applyBtn" data-id="${esc(j.id)}" type="button">Apply Now →</button></div>
  </article>`).join("");
 $("emptyState").hidden=jobs.length!==0;
}

function openModal(id){$(id).classList.add("show");$(id).setAttribute("aria-hidden","false");}
function closeModal(id){$(id).classList.remove("show");$(id).setAttribute("aria-hidden","true");}

function openApply(job){
 selectedJob=job;
 $("applyJobTitle").textContent=job.title;
 $("applyJobCompany").textContent=job.company;
 $("applyHiddenTitle").value=job.title;
 $("applyHiddenCompany").value=job.company;
 $("applyHiddenHr").value=job.hrEmail;
 $("applySubject").value=`Job Application: ${job.title} - ${job.company}`;
 $("applyNotice").textContent="";
 $("applyNotice").style.color="#16804d";
 $("applyForm").reset();
 $("applyHiddenTitle").value=job.title;
 $("applyHiddenCompany").value=job.company;
 $("applyHiddenHr").value=job.hrEmail;
 $("applySubject").value=`Job Application: ${job.title} - ${job.company}`;
 openModal("applyModal");
}

function showHR(msg,ok=false){$("hrNotice").textContent=msg;$("hrNotice").style.color=ok?"#16804d":"#b42318";}

function showHrPanel(){
 $("hrPanel").hidden=!currentHr;
 $("logoutBtn").hidden=!currentHr;
 $("loginBtn").hidden=!!currentHr;
 $("registerBtn").hidden=!!currentHr;
 if(currentHr){$("hrEmail").value=currentHr.email; renderMyJobs();}
}

function renderMyJobs(){
 const jobs=getJobs().filter(j=>currentHr && j.hrEmail===currentHr.email);
 $("myJobs").innerHTML=jobs.length?jobs.map(j=>`<div class="myjob"><button type="button" data-delete-job="${esc(j.id)}">Delete</button><b>${esc(j.title)}</b><br><span class="small">${esc(j.company)} • ${esc(j.location)}</span></div>`).join(""):`<p class="small">No jobs posted by this HR yet.</p>`;
}

$("searchForm").addEventListener("submit",e=>{e.preventDefault();searchTerm=$("searchInput").value.trim();renderJobs();$("jobs").scrollIntoView({behavior:"smooth"});});
document.querySelectorAll(".filter").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));b.classList.add("active");activeFilter=b.dataset.filter;renderJobs();}));
document.querySelectorAll("[data-search]").forEach(a=>a.addEventListener("click",e=>{e.preventDefault();searchTerm=a.dataset.search;$("searchInput").value=searchTerm;activeFilter="all";document.querySelectorAll(".filter").forEach(x=>x.classList.toggle("active",x.dataset.filter==="all"));renderJobs();$("jobs").scrollIntoView({behavior:"smooth"});}));

document.addEventListener("click",e=>{
 const btn=e.target.closest(".applyBtn");
 if(btn){
  const job=getJobs().find(j=>String(j.id)===String(btn.dataset.id));
  if(!job)return;
  if(!emailOK(job.hrEmail)){selectedJob=job; $("applyJobTitle").textContent=job.title; $("applyJobCompany").textContent=job.company; $("applyNotice").textContent="This vacancy has no HR email configured yet. The HR must login and post/re-publish the job with their HR email."; $("applyNotice").style.color="#b42318"; $("applyForm").style.display="none"; openModal("applyModal");}
  else {$("applyForm").style.display="block";openApply(job);}
 }
 const del=e.target.closest("[data-delete-job]");
 if(del && currentHr){
  const jobs=loadJSON("pja_jobs",[]).filter(j=>String(j.id)!==String(del.dataset.deleteJob));
  saveJSON("pja_jobs",jobs);renderJobs();renderMyJobs();
 }
});

$("candidateResume").addEventListener("change",()=>{
 const f=$("candidateResume").files[0]; if(!f)return;
 if(!/\.(pdf|doc|docx)$/i.test(f.name)||f.size>5*1024*1024){$("candidateResume").value="";$("applyNotice").textContent="Resume must be PDF/DOC/DOCX and maximum 5 MB.";$("applyNotice").style.color="#b42318";}
 else{$("applyNotice").textContent="Resume selected successfully.";$("applyNotice").style.color="#16804d";}
});

$("applyForm").addEventListener("submit",e=>{
 if(!selectedJob||!emailOK(selectedJob.hrEmail)){e.preventDefault();return;}
 const f=$("candidateResume").files[0];
 if(!f||!/\.(pdf|doc|docx)$/i.test(f.name)||f.size>5*1024*1024){e.preventDefault();$("applyNotice").textContent="Please select a valid PDF/DOC/DOCX resume up to 5 MB.";$("applyNotice").style.color="#b42318";return;}
 $("applyForm").action="https://formsubmit.co/"+encodeURIComponent(selectedJob.hrEmail);
 $("submitApplication").disabled=true;$("submitApplication").textContent="Submitting...";
 $("applyNotice").textContent="Application is being submitted to the HR email…";$("applyNotice").style.color="#1267e8";
});

$("registerBtn").addEventListener("click",()=>{
 const email=$("hrEmail").value.trim(),pass=$("hrPassword").value;
 if(!emailOK(email)||pass.length<6){showHR("Enter a valid HR email and a password of at least 6 characters.");return;}
 const accounts=loadJSON("pja_hr_accounts",[]);
 if(accounts.some(a=>a.email===email)){showHR("This HR account already exists. Please Login.");return;}
 accounts.push({email,pass});saveJSON("pja_hr_accounts",accounts);currentHr={email};showHR("HR account created and logged in. You can now post a job.",true);showHrPanel();
});

$("loginBtn").addEventListener("click",()=>{
 const email=$("hrEmail").value.trim(),pass=$("hrPassword").value;
 const accounts=loadJSON("pja_hr_accounts",[]);
 const found=accounts.find(a=>a.email===email&&a.pass===pass);
 if(!found){showHR("Account not found or password incorrect. Create the HR account first.");return;}
 currentHr={email};showHR("Login successful. Applications for your posted jobs will use this HR email.",true);showHrPanel();
});

$("logoutBtn").addEventListener("click",()=>{currentHr=null;showHR("Logged out.",true);showHrPanel();});
$("jobForm").addEventListener("submit",e=>{
 e.preventDefault(); if(!currentHr)return;
 const job={id:"hr-"+Date.now(),title:$("jTitle").value.trim(),company:$("jCompany").value.trim(),location:$("jLocation").value.trim(),qualification:$("jQualification").value.trim(),salary:$("jSalary").value.trim(),type:$("jType").value,date:$("jDate").value.trim()||"Latest",tags:[$("jLocation").value,$("jQualification").value],hrEmail:currentHr.email};
 const jobs=loadJSON("pja_jobs",[]);jobs.unshift(job);saveJSON("pja_jobs",jobs);e.target.reset();renderJobs();renderMyJobs();showHR("Job published successfully. Apply Now will route applications to "+currentHr.email,true);
});

$("hrLoginBtn").addEventListener("click",()=>{openModal("hrModal");showHrPanel();});
$("createHrBtn").addEventListener("click",()=>{openModal("hrModal");showHrPanel();});
$("footerHrBtn").addEventListener("click",()=>{openModal("hrModal");showHrPanel();});
$("closeHr").addEventListener("click",()=>closeModal("hrModal"));
$("closeApply").addEventListener("click",()=>closeModal("applyModal"));
$("cancelApplication").addEventListener("click",()=>closeModal("applyModal"));
$("hrModal").addEventListener("click",e=>{if(e.target===$("hrModal"))closeModal("hrModal");});
$("applyModal").addEventListener("click",e=>{if(e.target===$("applyModal"))closeModal("applyModal");});
$("menuBtn").addEventListener("click",()=>{$("navLinks").classList.toggle("open");});
$("year").textContent=new Date().getFullYear();
renderJobs();
})();