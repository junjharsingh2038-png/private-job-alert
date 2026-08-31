/* HR portal controller. This file also provides a safe fallback for the HR register/login UI. */
(function(){
  const esc2=v=>String(v??"").replace(/[&<>\"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'\"':"&quot;","'":"&#39;"}[m]));
  const q=id=>document.getElementById(id);

  function setMode(mode){
    const reg=mode==='register';
    q('authTitle').textContent=reg?'Register New HR':'HR Login';
    q('authSubtitle').textContent=reg?'Create your HR account using email OTP verification.':'Login with your registered HR email and password.';
    q('hrNameField').classList.toggle('hidden',!reg);
    q('companyField').classList.toggle('hidden',!reg);
    q('passwordField').classList.toggle('hidden',reg);
    q('passwordField').querySelector('input').required=!reg;
    q('authSubmit').textContent=reg?'Send OTP':'Login';
    q('loginTab').classList.toggle('secondary',reg);
    q('registerTab').classList.toggle('secondary',!reg);
    q('authMsg').textContent='';
    q('authForm').classList.remove('hidden');
    q('otpBox').classList.add('hidden');
  }

  async function login(){
    const f=new FormData(q('authForm')),email=String(f.get('email')||'').trim(),password=String(f.get('password')||''),msg=q('authMsg');
    msg.className='';msg.textContent='Please wait...';
    const r=await sb.auth.signInWithPassword({email,password});
    if(r.error){msg.className='danger';msg.textContent=r.error.message;return;}
    await loadPortal();
  }

  async function register(){
    const f=new FormData(q('authForm')),email=String(f.get('email')||'').trim(),name=String(f.get('hr_name')||'').trim(),company=String(f.get('company')||'').trim(),msg=q('authMsg');
    if(!name||!company){msg.className='danger';msg.textContent='HR Name and Company Name are required.';return;}
    msg.className='';msg.textContent='Sending OTP...';
    window.pendingHr={email,name,company};
    const r=await sb.auth.signInWithOtp({email,options:{shouldCreateUser:true,data:{hr_name:name,company}}});
    if(r.error){msg.className='danger';msg.textContent=r.error.message;return;}
    msg.className='success';msg.textContent='OTP sent to your email.';
    q('authForm').classList.add('hidden');q('otpBox').classList.remove('hidden');
  }

  async function verify(){
    const p=window.pendingHr||{},token=String(new FormData(q('otpForm')).get('token')||''),msg=q('otpMsg');
    msg.className='';msg.textContent='Verifying OTP...';
    const r=await sb.auth.verifyOtp({email:p.email,token,type:'email'});
    if(r.error){msg.className='danger';msg.textContent=r.error.message;return;}
    if(r.data.user) await sb.auth.updateUser({data:{hr_name:p.name,company:p.company}});
    msg.className='success';msg.textContent='Account verified successfully.';
    setTimeout(loadPortal,300);
  }

  async function loadPortal(){
    const {data:{user}}=await sb.auth.getUser();
    if(!user){setMode('login');return;}
    const meta=user.user_metadata||{};
    q('hrDisplayName').textContent=meta.hr_name||meta.company||'HR';
    q('hrDisplayEmail').textContent=user.email||'';
    q('authArea').classList.add('hidden');q('portalArea').classList.remove('hidden');
    await refreshPortal();
  }

  async function refreshPortal(){
    const {data:{user}}=await sb.auth.getUser();if(!user)return;
    const jr=await sb.from('jobs').select('*').eq('hr_user_id',user.id).order('created_at',{ascending:false});
    const ar=await sb.from('applications').select('*').eq('hr_email',user.email).order('created_at',{ascending:false});
    const jobs=jr.data||[],apps=ar.data||[];
    q('jobCount').textContent=jobs.length;q('appCount').textContent=apps.length;
    q('jobsArea').innerHTML=jobs.length?jobs.map(j=>`<article class="job-card"><div><h3>${esc2(j.title)}</h3><p class="muted"><b>${esc2(j.company||j.company_name||'')}</b> · ${esc2(j.location||'')}</p><span class="status">${j.is_active===false?'Inactive':'Active'}</span></div><button onclick="hrDeleteJob('${j.id}')">Delete</button></article>`).join(''):'<div class="empty-state">No jobs posted yet. Click “Post New Job”.</div>';
    q('appsArea').innerHTML=apps.length?apps.map(a=>`<article class="application-card"><div class="candidate-top"><div><h3>${esc2(a.candidate_name)}</h3><p>📱 ${esc2(a.candidate_mobile)} · ✉️ ${esc2(a.candidate_email)}</p></div><span class="application-label">Application</span></div><div class="candidate-details"><span>🎓 ${esc2(a.qualification||'Not specified')}</span><span>💼 ${esc2(a.experience||'Fresher')}</span><span>📍 ${esc2(a.candidate_location||'Not specified')}</span></div><small>${a.created_at?new Date(a.created_at).toLocaleString():''}</small></article>`).join(''):'<div class="empty-state">No applications received yet.</div>';
  }

  window.showHrPanel=loadPortal;
  window.hrPostJob=function(){
    const p=q('actionPanel');p.classList.remove('hidden');
    p.innerHTML=`<h2>Post New Job</h2><form id="newJobForm" class="form"><label>Job Title<input name="title" required></label><label>Company Name<input name="company" required></label><label>Location<input name="location" required></label><label>Qualification<input name="qualification"></label><label>Salary<input name="salary"></label><label>Job Type<input name="job_type" value="Full Time"></label><label>Job Description<textarea name="description" rows="5"></textarea></label><div class="portal-actions"><button>Publish Job</button><button type="button" class="secondary" onclick="document.getElementById('actionPanel').classList.add('hidden')">Cancel</button></div><p id="newJobMsg"></p></form>`;
    p.scrollIntoView({behavior:'smooth',block:'center'});
    q('newJobForm').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.target),{data:{user}}=await sb.auth.getUser(),m=q('newJobMsg');const company=f.get('company');const r=await sb.from('jobs').insert({hr_user_id:user.id,user_id:user.id,owner_id:user.id,hr_email:user.email,title:f.get('title'),company,company_name:company,location:f.get('location'),qualification:f.get('qualification'),salary:f.get('salary'),job_type:f.get('job_type'),type:f.get('job_type'),description:f.get('description'),is_active:true});if(r.error){m.className='danger';m.textContent=r.error.message;return;}m.className='success';m.textContent='Job published successfully.';await refreshPortal();setTimeout(()=>p.classList.add('hidden'),700);};
  };
  window.hrDeleteJob=async function(id){if(!confirm('Delete this job?'))return;const {data:{user}}=await sb.auth.getUser();const r=await sb.from('jobs').delete().eq('id',id).eq('hr_user_id',user.id);if(r.error)alert(r.error.message);else refreshPortal();};
  window.hrLogout=async function(){await sb.auth.signOut();q('portalArea').classList.add('hidden');q('authArea').classList.remove('hidden');setMode('login');window.scrollTo({top:0,behavior:'smooth'});};

  window.addEventListener('DOMContentLoaded',()=>{
    q('loginTab')?.addEventListener('click',()=>setMode('login'));
    q('registerTab')?.addEventListener('click',()=>setMode('register'));
    q('authForm')?.addEventListener('submit',e=>{e.preventDefault();authMode==='register'?register():login();});
    q('otpForm')?.addEventListener('submit',e=>{e.preventDefault();verify();});
    const loginBtn=q('hrTopBtn');if(loginBtn)loginBtn.onclick=()=>{setMode('login');q('authArea').scrollIntoView({behavior:'smooth',block:'center'});};
    setMode('login');
    sb.auth.getUser().then(({data:{user}})=>{if(user)loadPortal();});
  });
  let authMode='login';
  window.setHrMode=mode=>{authMode=mode;setMode(mode);};
})();
