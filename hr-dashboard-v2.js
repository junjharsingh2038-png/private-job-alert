/* Fresh professional inline HR dashboard renderer. */
(function(){
  const esc2=v=>String(v??"").replace(/[&<>\"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'\"':"&quot;","'":"&#39;"}[m]));
  window.showHrPanel=async function(){
    const {data:{user}}=await sb.auth.getUser();
    if(!user){authForm("login");return;}
    const jobsResult=await sb.from("jobs").select("*").eq("hr_user_id",user.id).order("created_at",{ascending:false});
    const appsResult=await sb.from("applications").select("*").eq("hr_email",user.email).order("created_at",{ascending:false});
    const jobs=jobsResult.data||[],apps=appsResult.data||[];
    if(jobsResult.error){renderHrPage(`<div class="hr-card"><h2>HR Dashboard</h2><p class="danger">Your account is logged in, but jobs could not be loaded.</p><button onclick="sb.auth.signOut().then(()=>authForm('login'))">Logout</button></div>`);return;}
    renderHrPage(`<div class="hr-dashboard">
      <section class="hr-card hr-head-card"><div><span class="hr-badge">HR / EMPLOYER PORTAL</span><h2>Welcome to your HR Dashboard</h2><p>Logged in as <b>${esc2(user.email)}</b></p></div><div class="hr-actions"><button onclick="showPostJob()">+ Post New Job</button><button class="secondary" onclick="sb.auth.signOut().then(()=>authForm('login'))">Logout</button></div></section>
      <section class="hr-card"><div class="hr-card-title"><div><h2>My Posted Jobs</h2><p>Manage the vacancies published by your company.</p></div><span class="count-badge">${jobs.length}</span></div><div class="hr-list">${jobs.length?jobs.map(j=>`<article class="hr-job-card"><div><h3>${esc2(j.title)}</h3><p><b>${esc2(j.company||j.company_name||"")}</b> · ${esc2(j.location||"")}</p><span class="status-badge">${j.is_active!==false?"Active":"Inactive"}</span></div><button class="danger-btn" onclick="deleteJob('${j.id}')">Delete</button></article>`).join(""):`<div class="empty-state"><b>No jobs posted yet</b><p>Click “Post New Job” to publish your first vacancy.</p></div>`}</div></section>
      <section class="hr-card"><div class="hr-card-title"><div><h2>Applications Received</h2><p>Candidate applications for your posted vacancies.</p></div><span class="count-badge">${apps.length}</span></div><div class="hr-list">${apps.length?apps.map(a=>`<article class="application-card"><div class="candidate-top"><div><h3>${esc2(a.candidate_name)}</h3><p>📱 ${esc2(a.candidate_mobile)} &nbsp; · &nbsp; ✉️ ${esc2(a.candidate_email)}</p></div><span class="application-label">Application</span></div><div class="candidate-details"><span>🎓 ${esc2(a.qualification||"Not specified")}</span><span>💼 ${esc2(a.experience||"Fresher")}</span><span>📍 ${esc2(a.candidate_location||"Not specified")}</span></div><small>${a.created_at?new Date(a.created_at).toLocaleString():""}</small></article>`).join(""):`<div class="empty-state"><b>No applications received</b><p>Applications from candidates will appear here automatically.</p></div>`}</div></section>
    </div>`);
  };
})();
