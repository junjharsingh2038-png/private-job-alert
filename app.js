
const DEFAULT_JOBS = [
  {id:1,title:"Technician",company:"Genus Power Infrastructures Ltd",location:"Barmer / Jaisalmer",qualification:"ITI / Diploma",salary:"₹15,000+",type:"Full Time",tags:["Rajasthan","Fresher"],apply:"#",hrEmail:"",date:"30 Aug 2026"},
  {id:2,title:"Sales Executive",company:"Private Employer",location:"Jaipur",qualification:"12th Pass / Graduate",salary:"₹18,000+",type:"Full Time",tags:["Rajasthan","12th Pass"],apply:"#",hrEmail:"",date:"30 Aug 2026"},
  {id:3,title:"Customer Support Executive",company:"Private Employer",location:"Work From Home",qualification:"12th Pass / Graduate",salary:"₹15,000–₹25,000",type:"Remote",tags:["Work From Home","Graduate","Fresher"],apply:"#",hrEmail:"",date:"30 Aug 2026"}
];

let activeFilter = "all";
let searchTerm = "";
let selectedJob = null;

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

function getJobs(){
  try {
    const saved = JSON.parse(localStorage.getItem("pja_jobs") || "[]");
    return [...saved, ...DEFAULT_JOBS];
  } catch { return [...DEFAULT_JOBS]; }
}

function esc(v){
  return String(v ?? "").replace(/[&<>"']/g, m => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[m]));
}

function renderJobs(){
  const all = getJobs();
  const jobs = all.filter(j => {
    const haystack = [
      j.title,j.company,j.location,j.qualification,j.type,...(j.tags || [])
    ].join(" ").toLowerCase();
    const matchesSearch = !searchTerm || haystack.includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === "all" || haystack.includes(activeFilter.toLowerCase());
    return matchesSearch && matchesFilter;
  });

  $("#jobsGrid").innerHTML = jobs.map(j => `
    <article class="job-card">
      <div class="job-top">
        <div class="company">${esc(j.company)}</div>
        <span class="badge">${esc(j.type)}</span>
      </div>
      <h3>${esc(j.title)}</h3>
      <div class="job-meta">
        <span>📍 ${esc(j.location)}</span>
        <span>🎓 ${esc(j.qualification)}</span>
        <span>💰 ${esc(j.salary)}</span>
        <span>⏱ ${esc(j.date || "Latest")}</span>
      </div>
      <div class="job-footer">
        <span class="date">Official vacancy details</span>
        <button class="apply apply-btn" type="button" data-job-id="${esc(j.id)}">Apply Now →</button>
      </div>
    </article>
  `).join("");

  $("#jobCount").textContent = all.length;
  $("#resultText").textContent = `${jobs.length} Job${jobs.length === 1 ? "" : "s"}`;
  $("#emptyState").hidden = jobs.length !== 0;
}

function openApply(job){
  selectedJob = job;
  $("#applyJobTitle").textContent = job.title || "Apply for Job";
  $("#applyJobCompany").textContent = job.company || "";
  $("#applyHiddenTitle").value = job.title || "";
  $("#applyHiddenCompany").value = job.company || "";
  $("#applySubject").value = `Job Application: ${job.title || ""} - ${job.company || ""}`;
  $("#applyNotice").style.color = "#16804d";
  $("#applyNotice").textContent = "";
  $("#applyForm").style.display = "block";
  $("#applyModal").classList.add("show");
  $("#applyModal").setAttribute("aria-hidden","false");
}

function closeApply(){
  $("#applyModal").classList.remove("show");
  $("#applyModal").setAttribute("aria-hidden","true");
}

function openHr(){
  $("#hrModal").classList.add("show");
  $("#hrModal").setAttribute("aria-hidden","false");
}

function closeHr(){
  $("#hrModal").classList.remove("show");
  $("#hrModal").setAttribute("aria-hidden","true");
}

$("#searchForm").addEventListener("submit", e => {
  e.preventDefault();
  searchTerm = $("#searchInput").value.trim();
  renderJobs();
  $("#jobs").scrollIntoView({behavior:"smooth"});
});

$$(".filter").forEach(b => {
  b.addEventListener("click", () => {
    $$(".filter").forEach(x => x.classList.remove("active"));
    b.classList.add("active");
    activeFilter = b.dataset.filter;
    renderJobs();
  });
});

$$("[data-search]").forEach(a => {
  a.addEventListener("click", e => {
    e.preventDefault();
    searchTerm = a.dataset.search;
    $("#searchInput").value = searchTerm;
    activeFilter = "all";
    $$(".filter").forEach(x => x.classList.toggle("active", x.dataset.filter === "all"));
    renderJobs();
    $("#jobs").scrollIntoView({behavior:"smooth"});
  });
});

document.addEventListener("click", event => {
  const button = event.target.closest(".apply-btn");
  if (!button) return;
  const job = getJobs().find(item => String(item.id) === String(button.dataset.jobId));
  if (!job) return;

  if (!job.hrEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(job.hrEmail)) {
    selectedJob = job;
    $("#applyJobTitle").textContent = job.title || "Apply for Job";
    $("#applyJobCompany").textContent = job.company || "";
    $("#applyNotice").style.color = "#b42318";
    $("#applyNotice").textContent = "इस vacancy के लिए HR email configured नहीं है। पहले HR email जोड़ें।";
    $("#applyForm").style.display = "none";
    $("#applyModal").classList.add("show");
    $("#applyModal").setAttribute("aria-hidden","false");
    return;
  }
  openApply(job);
});

$("#closeApply")?.addEventListener("click", closeApply);
$("#cancelApplication")?.addEventListener("click", closeApply);
$("#applyModal")?.addEventListener("click", e => {
  if (e.target === $("#applyModal")) closeApply();
});

$("#candidateResume")?.addEventListener("change", () => {
  const file = $("#candidateResume").files[0];
  if (!file) return;
  const allowed = ["application/pdf","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
  const extOk = /\.(pdf|doc|docx)$/i.test(file.name);
  if ((!allowed.includes(file.type) && !extOk) || file.size > 5 * 1024 * 1024) {
    $("#candidateResume").value = "";
    $("#applyNotice").style.color = "#b42318";
    $("#applyNotice").textContent = "Resume केवल PDF/DOC/DOCX और अधिकतम 5 MB होना चाहिए.";
  } else {
    $("#applyNotice").style.color = "#16804d";
    $("#applyNotice").textContent = "Resume selected.";
  }
});

$("#applyForm")?.addEventListener("submit", event => {
  if (!selectedJob || !selectedJob.hrEmail) {
    event.preventDefault();
    return;
  }
  const file = $("#candidateResume").files[0];
  if (!file || file.size > 5 * 1024 * 1024 || !/\.(pdf|doc|docx)$/i.test(file.name)) {
    event.preventDefault();
    $("#applyNotice").style.color = "#b42318";
    $("#applyNotice").textContent = "Valid PDF/DOC/DOCX resume (max 5 MB) चुनें.";
    return;
  }

  event.currentTarget.action = "https://formsubmit.co/" + encodeURIComponent(selectedJob.hrEmail);
  $("#submitApplication").disabled = true;
  $("#submitApplication").textContent = "Submitting...";
  $("#applyNotice").style.color = "#1557ad";
  $("#applyNotice").textContent = "Application भेजी जा रही है…";
});

$("#hrLoginBtn")?.addEventListener("click", openHr);
$("#createHrBtn")?.addEventListener("click", openHr);
$("#footerHrBtn")?.addEventListener("click", openHr);
$("#closeHr")?.addEventListener("click", closeHr);
$("#hrModal")?.addEventListener("click", e => {
  if (e.target === $("#hrModal")) closeHr();
});

$("#registerBtn")?.addEventListener("click", () => {
  const email = $("#hrEmail").value.trim();
  const pass = $("#hrPassword").value;
  if (!email || pass.length < 6) {
    $("#hrNotice").style.color = "#b42318";
    $("#hrNotice").textContent = "Valid email and minimum 6-character password required.";
    return;
  }
  localStorage.setItem("pja_hr", JSON.stringify({email, pass}));
  $("#hrNotice").style.color = "#16804d";
  $("#hrNotice").textContent = "HR account created on this browser. You can now log in.";
});

$("#loginBtn")?.addEventListener("click", () => {
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem("pja_hr") || "null"); } catch {}
  const email = $("#hrEmail").value.trim();
  const pass = $("#hrPassword").value;
  $("#hrNotice").style.color = "#b42318";
  $("#hrNotice").textContent = saved && saved.email === email && saved.pass === pass
    ? "Login successful."
    : "Account not found or password incorrect. Create an HR account first.";
  if (saved && saved.email === email && saved.pass === pass) {
    $("#hrNotice").style.color = "#16804d";
  }
});

$(".nav-toggle")?.addEventListener("click", () => $(".nav-links").classList.toggle("open"));
$("#year").textContent = new Date().getFullYear();
renderJobs();
