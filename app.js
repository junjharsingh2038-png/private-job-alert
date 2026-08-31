/* SUPABASE CONFIGURATION */
const SUPABASE_URL = "https://rlidcatrwonemshwzafp.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_ocJhWyfPg9rVhYROn_Vj0Q_DSSgxeuE";
const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzPKApblqhFj_qAAbDLMaa3k0vzkl9wkDmtKmk5SMTsbBIFuwNZzGLLAqhMRbMg3oa0/exec";
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const $ = id => document.getElementById(id);
let currentJob = null;
window.closeModal = function(){ $("modal").classList.add("hidden"); };
window.openModal = function(html){ $("modalContent").innerHTML=html; $("modal").classList.remove("hidden"); };
function esc(v){return String(v??"").replace(/[&<>\"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'\"':"&quot;","'":"&#39;"}[m]));}

/* HR pages use the page itself for login, signup, dashboard and job posting. */
function renderHrPage(html){
  const target=$("hrApp");
  if(!target)return openModal(html);
  target.innerHTML=html;
  target.classList.remove("hidden");
  target.scrollIntoView({behavior:"smooth",block:"start"});
}
window.renderHrPage=renderHrPage;

async function loadJobs(){
  const q = ($("search")?.value||"").trim();
  let query = sb.from("jobs").select("id,title,company,company_name,location,qualification,salary,job_type,type,description,hr_email,created_at,is_active").eq("is_active",true).order("created_at",{ascending:false});
  if(q) query=query.or(`title.ilike.%${q}%,company.ilike.%${q}%,company_name.ilike.%${q}%,location.ilike.%${q}%,qualification.ilike.%${q}%`);
  const {data,error}=await query;
  if(error){if($("jobsList"))$("jobsList").innerHTML="<p class='danger'>Jobs could not be loaded. Please try again.</p>";return;}
  if(!$("jobsList")) return;
  $("jobsList").innerHTML = data.length ? data.map(j=>`<article class="job"><button class="apply" onclick='openApply(${JSON.stringify(j).replace(/'/g,"&#39;")})'>Apply Now →</button><h3>${esc(j.title)}</h3><b>${esc(j.company||j.company_name||"")}</b><p class="muted">📍 ${esc(j.location||"Rajasthan")} &nbsp; 🎓 ${esc(j.qualification||"Any")} &nbsp; 💰 ${esc(j.salary||"As per company")}</p><p>${esc(j.description||"Official vacancy details available through the employer.")}</p></article>`).join("") : "<p>No jobs found.</p>";
}
window.loadJobs = loadJobs;

window.openApply = function(job){
  currentJob=job;
  openModal(`<h2>Apply for ${esc(job.title)}</h2><p><b>${esc(job.company||job.company_name||"")}</b> · ${esc(job.location||"Rajasthan")}</p><form id="applyForm" class="form"><label>Full Name<input name="name" required></label><label>Mobile Number<input name="mobile" required pattern="[0-9]{10}"></label><label>Email<input type="email" name="email" required></label><label>Current Location<input name="location" required></label><label>Qualification<input name="qualification" required></label><label>Experience<input name="experience" placeholder="Fresher / Years"></label><label>Resume (PDF/DOC/DOCX, max 5 MB)<input type="file" name="resume" accept=".pdf,.doc,.docx" required></label><button type="submit">Submit Application</button><p id="applyMsg"></p></form>`);
  $("applyForm").addEventListener("submit",submitApplication);
}
function fileToBase64(file){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(",")[1]||"");reader.onerror=()=>reject(new Error("Could not read resume"));reader.readAsDataURL(file);});}
async function submitApplication(e){
  e.preventDefault();
  const msg=$("applyMsg"), form=e.target, fd=new FormData(form), file=fd.get("resume");
  if(!file || file.size>5*1024*1024){msg.className="danger";msg.textContent="Resume must be PDF/DOC/DOCX and maximum 5 MB.";return;}
  if(!currentJob || !currentJob.hr_email){msg.className="danger";msg.textContent="This job has no HR email configured.";return;}
  msg.className="";msg.textContent="Submitting application...";
  try {const resumeBase64=await fileToBase64(file);const company=currentJob.company||currentJob.company_name||"";const application={job_id:currentJob.id,hr_email:currentJob.hr_email,candidate_name:fd.get("name"),candidate_mobile:fd.get("mobile"),candidate_email:fd.get("email"),candidate_location:fd.get("location"),qualification:fd.get("qualification"),experience:fd.get("experience")||""};const saved=await sb.from("applications").insert(application);if(saved.error) throw new Error("Application could not be saved. Please try again.");const payload={hr_email:currentJob.hr_email,job_title:currentJob.title,company,job_location:currentJob.location||"",candidate_name:fd.get("name"),candidate_mobile:fd.get("mobile"),candidate_email:fd.get("email"),candidate_location:fd.get("location"),qualification:fd.get("qualification"),experience:fd.get("experience")||"",resume_base64:resumeBase64,resume_name:file.name,resume_type:file.type||"application/octet-stream"};await fetch(GOOGLE_APPS_SCRIPT_URL,{method:"POST",mode:"no-cors",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(payload)});msg.className="success";msg.textContent="Application submitted successfully. HR has been notified by email.";form.reset();} catch(err){msg.className="danger";msg.textContent=err.message||"Application could not be submitted.";}
}

window.authForm = function(mode){
  renderHrPage(`<div class="hr-welcome"><h2>${mode==="login"?"HR Login":"Create HR Account"}</h2><p>${mode==="login"?"Login to your employer account to manage jobs and applications.":"Create your free employer account to post vacancies."}</p><form id="authForm" class="form"><label>Email<input type="email" name="email" required></label><label>Password<input type="password" name="password" minlength="6" required></label>${mode==="signup"?'<label>Company Name<input name="company" required></label>':''}<button>${mode==="login"?"Login":"Create Account"}</button><p id="authMsg"></p></form></div>`);
  $("authForm").addEventListener("submit",async e=>{
    e.preventDefault();const f=new FormData(e.target),email=f.get("email"),password=f.get("password"),msg=$("authMsg");msg.className="";msg.textContent="Please wait...";
    const r=mode==="login"?await sb.auth.signInWithPassword({email,password}):await sb.auth.signUp({email,password,options:{data:{company:f.get("company")}}});
    if(r.error){msg.className="danger";msg.textContent=r.error.message;return;}
    if(mode==="login"){msg.className="success";msg.textContent="Login successful. Loading dashboard...";setTimeout(showHrPanel,300);}else{msg.className="success";msg.textContent="Account created. Check email if confirmation is enabled.";}
  });
}

window.showHrPanel = async function(){
  const {data:{user}}=await sb.auth.getUser();
  if(!user){authForm("login");return;}
  const {data:jobs,error:jobsError}=await sb.from("jobs").select("*").eq("hr_user_id",user.id).order("created_at",{ascending:false});
  const {data:apps}=await sb.from("applications").select("*").eq("hr_email",user.email).order("created_at",{ascending:false});
  if(jobsError){renderHrPage(`<div class="hr-welcome"><h2>HR Dashboard</h2><p class="danger">Your HR account is logged in, but jobs could not be loaded.</p><button onclick="sb.auth.signOut().then(()=>authForm('login'))">Logout</button></div>`);return;}
  renderHrPage(`<div class="hr-welcome"><h2>HR / Employer Dashboard</h2><p>Logged in as <b>${esc(user.email)}</b></p><div class="hr-actions"><button onclick="showPostJob()">Post New Job</button><button class="secondary" onclick="sb.auth.signOut().then(()=>authForm('login'))">Logout</button></div><h3>Your Jobs</h3>${(jobs||[]).map(j=>`<div class="job"><b>${esc(j.title)}</b><br>${esc(j.company||j.company_name||"")} · ${esc(j.location||"")}<br><small>${j.is_active!==false?"Active":"Inactive"}</small> <button onclick="deleteJob('${j.id}')">Delete</button></div>`).join("")||"<p>No jobs yet.</p>"}<h3>Applications Received</h3>${(apps||[]).map(a=>`<div class="job"><b>${esc(a.candidate_name)}</b><br>📱 ${esc(a.candidate_mobile)} · ✉️ ${esc(a.candidate_email)}<br>🎓 ${esc(a.qualification||"")} · ${esc(a.experience||"Fresher")}<br><small>${new Date(a.created_at).toLocaleString()}</small></div>`).join("")||"<p>No applications yet.</p>"}</div>`);
}

window.showPostJob = function(){
  renderHrPage(`<div class="hr-welcome"><h2>Post a Job</h2><p>Add your vacancy details and publish it for Rajasthan job seekers.</p><form id="jobForm" class="form"><label>Job Title<input name="title" required></label><label>Company<input name="company" required></label><label>Location<input name="location" required></label><label>Qualification<input name="qualification"></label><label>Salary<input name="salary"></label><label>Job Type<input name="job_type" value="Full Time"></label><label>Last Date<input name="lastdate" placeholder="DD-MM-YYYY"></label><label>Job Description<textarea name="description" rows="5"></textarea></label><div class="hr-actions"><button>Publish Job</button><button type="button" class="secondary" onclick="showHrPanel()">Back to Dashboard</button></div><p id="jobMsg"></p></form></div>`);
  $("jobForm").addEventListener("submit",async e=>{e.preventDefault();const f=new FormData(e.target),{data:{user}}=await sb.auth.getUser(),msg=$("jobMsg");if(!user){msg.className="danger";msg.textContent="Please login again.";return;}const company=f.get("company");const row={hr_user_id:user.id,user_id:user.id,owner_id:user.id,hr_email:user.email,title:f.get("title"),company,company_name:company,location:f.get("location"),qualification:f.get("qualification"),salary:f.get("salary"),job_type:f.get("job_type"),type:f.get("job_type"),lastdate:f.get("lastdate")||null,description:f.get("description"),is_active:true};const r=await sb.from("jobs").insert(row);if(r.error){msg.className="danger";msg.textContent=r.error.message;return;}msg.className="success";msg.textContent="Job published successfully.";setTimeout(showHrPanel,700);});
}
window.deleteJob = async function(id){if(!confirm("Delete this job?"))return;const {data:{user}}=await sb.auth.getUser();if(!user)return;const r=await sb.from("jobs").delete().eq("id",id).eq("user_id",user.id);if(r.error)alert(r.error.message);else showHrPanel();}

function bindButtons(){const login=$("hrLoginBtn"),create=$("createHrBtn");if(login) login.onclick=()=>window.authForm("login");if(create) create.onclick=()=>window.authForm("signup");}
window.addEventListener("DOMContentLoaded",()=>{bindButtons();loadJobs();});
bindButtons();
if(document.readyState!=="loading") loadJobs();
