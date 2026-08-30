/*
  SUPABASE CONFIGURATION
*/
const SUPABASE_URL = "https://rlidcatrwonemshwzafp.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_ocJhWyfPg9rVhYROn_Vj0Q_DSSgxeuE";
const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzPKApblqhFj_qAAbDLMaa3k0vzkl9wkDmtKmk5SMTsbBIFuwNZzGLLAqhMRbMg3oa0/exec";
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

window.addEventListener("error", (event) => {
  const box = document.getElementById("modalContent");
  if (box && /supabase|auth|createClient/i.test(event.message || "")) {
    box.innerHTML = "<p class='danger'>Supabase connection error. Please refresh the page and try again.</p>";
  }
});

const $ = id => document.getElementById(id);
let currentJob = null;

window.closeModal = function(){ $("modal").classList.add("hidden"); };
window.openModal = function(html){ $("modalContent").innerHTML=html; $("modal").classList.remove("hidden"); };

async function loadJobs(){
  const q = ($("search").value||"").trim();
  let query = sb.from("jobs").select("id,title,company,location,qualification,salary,job_type,description,hr_email,created_at").eq("is_active",true).order("created_at",{ascending:false});
  if(q) query=query.or(`title.ilike.%${q}%,company.ilike.%${q}%,location.ilike.%${q}%,qualification.ilike.%${q}%`);
  const {data,error}=await query;
  if(error){$("jobsList").innerHTML="<p class='danger'>Database is not connected yet. Please complete the Supabase setup.</p>";return;}
  $("jobsList").innerHTML = data.length ? data.map(j=>`
    <article class="job">
      <button class="apply" onclick='openApply(${JSON.stringify(j).replace(/'/g,"&#39;")})'>Apply Now →</button>
      <h3>${esc(j.title)}</h3><b>${esc(j.company)}</b>
      <p class="muted">📍 ${esc(j.location||"Rajasthan")} &nbsp; 🎓 ${esc(j.qualification||"Any")} &nbsp; 💰 ${esc(j.salary||"As per company")}</p>
      <p>${esc(j.description||"Official vacancy details available through the employer.")}</p>
    </article>`).join("") : "<p>No jobs found.</p>";
}

function esc(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));}

window.openApply = function(job){
  currentJob=job;
  openModal(`<h2>Apply for ${esc(job.title)}</h2>
  <p><b>${esc(job.company)}</b> · ${esc(job.location||"Rajasthan")}</p>
  <form id="applyForm" class="form">
  <label>Full Name<input name="name" required></label>
  <label>Mobile Number<input name="mobile" required pattern="[0-9]{10}"></label>
  <label>Email<input type="email" name="email" required></label>
  <label>Current Location<input name="location" required></label>
  <label>Qualification<input name="qualification" required></label>
  <label>Experience<input name="experience" placeholder="Fresher / Years"></label>
  <label>Resume (PDF/DOC/DOCX, max 5 MB)<input type="file" name="resume" accept=".pdf,.doc,.docx" required></label>
  <button type="submit">Submit Application</button>
  <p id="applyMsg"></p></form>`);
  $("applyForm").addEventListener("submit",submitApplication);
}

function fileToBase64(file){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onload=()=>resolve(String(reader.result).split(",")[1]||"");
    reader.onerror=()=>reject(new Error("Could not read resume"));
    reader.readAsDataURL(file);
  });
}

async function submitApplication(e){
  e.preventDefault();
  const msg=$("applyMsg"), form=e.target, fd=new FormData(form), file=fd.get("resume");
  if(!file || file.size>5*1024*1024){msg.className="danger";msg.textContent="Resume must be PDF/DOC/DOCX and maximum 5 MB.";return;}
  if(!currentJob || !currentJob.hr_email){msg.className="danger";msg.textContent="This job has no HR email configured.";return;}
  msg.className="";msg.textContent="Submitting application...";

  try {
    const resumeBase64=await fileToBase64(file);
    const payload={
      hr_email:currentJob.hr_email,
      job_title:currentJob.title,
      company:currentJob.company,
      job_location:currentJob.location||"",
      candidate_name:fd.get("name"),
      candidate_mobile:fd.get("mobile"),
      candidate_email:fd.get("email"),
      candidate_location:fd.get("location"),
      qualification:fd.get("qualification"),
      experience:fd.get("experience")||"",
      resume_base64:resumeBase64,
      resume_name:file.name,
      resume_type:file.type||"application/octet-stream"
    };

    /* Direct email: no Resend, no domain, and no applications-table dependency. */
    await fetch(GOOGLE_APPS_SCRIPT_URL,{
      method:"POST",
      mode:"no-cors",
      headers:{"Content-Type":"text/plain;charset=utf-8"},
      body:JSON.stringify(payload)
    });

    msg.className="success";
    msg.textContent="Application submitted successfully. HR has been notified by email.";
    form.reset();
  } catch(err){
    msg.className="danger";
    msg.textContent=err.message||"Application could not be submitted.";
  }
}

window.authForm = function(mode){
  openModal(`<h2>${mode==="login"?"HR Login":"Create HR Account"}</h2>
  <form id="authForm" class="form"><label>Email<input type="email" name="email" required></label>
  <label>Password<input type="password" name="password" minlength="6" required></label>
  ${mode==="signup"?'<label>Company Name<input name="company" required></label>':''}
  <button>${mode==="login"?"Login":"Create Account"}</button><p id="authMsg"></p></form>`);
  $("authForm").addEventListener("submit",async e=>{
    e.preventDefault(); const f=new FormData(e.target), email=f.get("email"), password=f.get("password"), msg=$("authMsg");
    const r=mode==="login"?await sb.auth.signInWithPassword({email,password}):await sb.auth.signUp({email,password,options:{data:{company:f.get("company")}}});
    if(r.error){msg.className="danger";msg.textContent=r.error.message;return;}
    msg.className="success";msg.textContent=mode==="login"?"Logged in.":"Account created. Check email if confirmation is enabled.";
    if(mode==="login")setTimeout(showHrPanel,500);
  });
}

window.showHrPanel = async function(){
  const {data:{user}}=await sb.auth.getUser();
  if(!user){authForm("login");return;}
  const {data:jobs}=await sb.from("jobs").select("*").eq("hr_user_id",user.id).order("created_at",{ascending:false});
  openModal(`<h2>HR / Employer Dashboard</h2><p>Logged in as <b>${esc(user.email)}</b></p>
  <button onclick="showPostJob()">Post New Job</button> <button onclick="sb.auth.signOut().then(closeModal)">Logout</button>
  <h3>Your Jobs</h3>${(jobs||[]).map(j=>`<div class="job"><b>${esc(j.title)}</b><br>${esc(j.company)}<br><button onclick="deleteJob('${j.id}')">Delete</button></div>`).join("")||"<p>No jobs yet.</p>"}`);
}

window.showPostJob = function(){
  openModal(`<h2>Post a Job</h2><form id="jobForm" class="form">
  <label>Job Title<input name="title" required></label><label>Company<input name="company" required></label>
  <label>Location<input name="location" required></label><label>Qualification<input name="qualification"></label>
  <label>Salary<input name="salary"></label><label>Job Type<input name="job_type" value="Full Time"></label>
  <label>Description<textarea name="description" rows="5"></textarea></label>
  <button>Publish Job</button><p id="jobMsg"></p></form>`);
  $("jobForm").addEventListener("submit",async e=>{
    e.preventDefault();const f=new FormData(e.target),{data:{user}}=await sb.auth.getUser(),msg=$("jobMsg");
    if(!user){msg.textContent="Please login again.";return;}
    const r=await sb.from("jobs").insert({hr_user_id:user.id,hr_email:user.email,title:f.get("title"),company:f.get("company"),location:f.get("location"),qualification:f.get("qualification"),salary:f.get("salary"),job_type:f.get("job_type"),description:f.get("description")});
    if(r.error){msg.className="danger";msg.textContent=r.error.message;return;}
    msg.className="success";msg.textContent="Job published successfully.";setTimeout(showHrPanel,700);
  });
}
window.deleteJob = async function(id){const r=await sb.from("jobs").delete().eq("id",id); if(r.error)alert(r.error.message); else showHrPanel();}

$("hrLoginBtn").onclick=()=>authForm("login");
$("createHrBtn").onclick=()=>authForm("signup");
loadJobs();
document.addEventListener("DOMContentLoaded", () => {
  const login = document.getElementById("hrLoginBtn");
  const create = document.getElementById("createHrBtn");
  if (login) login.addEventListener("click", () => window.authForm("login"));
  if (create) create.addEventListener("click", () => window.authForm("signup"));
});
